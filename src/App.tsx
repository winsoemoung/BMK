import React, { useState, useEffect } from 'react';
import { Parcel, Trip, Claim, UserRole, ParcelStatus, ClaimStatus, TripStatus, DriverExpenseEntry } from './types/bmk';
import { INITIAL_PARCELS, INITIAL_TRIPS, INITIAL_CLAIMS } from './data/mockData';
import { Header } from './components/Header';
import { FinancialDashboard } from './components/FinancialDashboard';
import { ParcelList } from './components/ParcelList';
import { TripManagement } from './components/TripManagement';
import { ClaimsManagement } from './components/ClaimsManagement';
import { AndroidStudioHub } from './components/AndroidStudioHub';
import { ParcelBookingModal } from './components/ParcelBookingModal';
import { DigitalReceiptModal } from './components/DigitalReceiptModal';

export default function App() {
  // Persistent state with localStorage
  const [parcels, setParcels] = useState<Parcel[]>(() => {
    try {
      const saved = localStorage.getItem('bmk_parcels');
      return saved ? JSON.parse(saved) : INITIAL_PARCELS;
    } catch {
      return INITIAL_PARCELS;
    }
  });

  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const saved = localStorage.getItem('bmk_trips');
      return saved ? JSON.parse(saved) : INITIAL_TRIPS;
    } catch {
      return INITIAL_TRIPS;
    }
  });

  const [claims, setClaims] = useState<Claim[]>(() => {
    try {
      const saved = localStorage.getItem('bmk_claims');
      return saved ? JSON.parse(saved) : INITIAL_CLAIMS;
    } catch {
      return INITIAL_CLAIMS;
    }
  });

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'parcels' | 'trips' | 'claims' | 'android-studio'>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');
  const [isMobileView, setIsMobileView] = useState(false);
  const [lang, setLang] = useState<'my' | 'en'>('my');

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedParcelForReceipt, setSelectedParcelForReceipt] = useState<Parcel | null>(null);
  const [parcelForClaim, setParcelForClaim] = useState<Parcel | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('bmk_parcels', JSON.stringify(parcels));
    } catch (e) {
      console.error(e);
    }
  }, [parcels]);

  useEffect(() => {
    try {
      localStorage.setItem('bmk_trips', JSON.stringify(trips));
    } catch (e) {
      console.error(e);
    }
  }, [trips]);

  useEffect(() => {
    try {
      localStorage.setItem('bmk_claims', JSON.stringify(claims));
    } catch (e) {
      console.error(e);
    }
  }, [claims]);

  // Parcel handlers
  const handleBookParcel = (newParcel: Parcel) => {
    setParcels((prev) => [newParcel, ...prev]);

    // If trip was selected, update loaded viss in trip
    if (newParcel.tripId) {
      setTrips((prevTrips) =>
        prevTrips.map((t) => {
          if (t.id === newParcel.tripId) {
            const updatedLoaded = t.currentLoadedViss + newParcel.weightViss;
            const updatedRent = updatedLoaded * 1100;
            return {
              ...t,
              currentLoadedViss: updatedLoaded,
              parcelIds: [...t.parcelIds, newParcel.id],
              totalTruckRentFee: updatedRent,
              totalMdyLabor: updatedLoaded * 25,
              totalKalayLabor: updatedLoaded * 25,
              remainingSettlementKalay: Math.max(0, updatedRent - t.advancePaymentMdy),
            };
          }
          return t;
        })
      );
    }

    // Automatically open digital receipt for immediate Viber / Bluetooth sticker printing
    setSelectedParcelForReceipt(newParcel);
  };

  const handleUpdateParcelStatus = (parcelId: string, newStatus: ParcelStatus) => {
    setParcels((prev) =>
      prev.map((p) => (p.id === parcelId ? { ...p, status: newStatus, updatedAt: new Date().toISOString() } : p))
    );
  };

  const handleBatchUpdateStatus = (parcelIds: string[], newStatus: ParcelStatus) => {
    setParcels((prev) =>
      prev.map((p) => (parcelIds.includes(p.id) ? { ...p, status: newStatus, updatedAt: new Date().toISOString() } : p))
    );
  };

  // Trip handlers
  const handleAddTrip = (newTrip: Trip) => {
    setTrips((prev) => [newTrip, ...prev]);
  };

  const handleUpdateTripStatus = (tripId: string, status: TripStatus) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status } : t))
    );

    // Also update parcels assigned to this trip if in transit or arrived
    if (status === 'IN_TRANSIT') {
      setParcels((prev) =>
        prev.map((p) => (p.tripId === tripId && p.status === 'LOADED' ? { ...p, status: 'IN_TRANSIT' } : p))
      );
    } else if (status === 'ARRIVED') {
      setParcels((prev) =>
        prev.map((p) => (p.tripId === tripId && p.status === 'IN_TRANSIT' ? { ...p, status: 'ARRIVED_KALAY' } : p))
      );
    }
  };

  const handleUpdateTripSettlement = (tripId: string, advanceMdy: number, isSettled: boolean) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          return {
            ...t,
            advancePaymentMdy: advanceMdy,
            isDriverSettled: isSettled,
            driverSettledDate: isSettled ? new Date().toISOString() : undefined,
            remainingSettlementKalay: isSettled ? 0 : Math.max(0, t.totalTruckRentFee - advanceMdy),
          };
        }
        return t;
      })
    );
  };

  const handleAddTripExpense = (tripId: string, expense: DriverExpenseEntry) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          const currentExpenses = t.expenses || [];
          return {
            ...t,
            expenses: [expense, ...currentExpenses],
          };
        }
        return t;
      })
    );
  };

  // Claims handlers
  const handleAddClaim = (newClaim: Claim) => {
    setClaims((prev) => [newClaim, ...prev]);

    // Mark parcel status as claimed
    setParcels((prev) =>
      prev.map((p) =>
        p.id === newClaim.parcelId
          ? { ...p, status: 'CLAIMED_LOST', claimId: newClaim.id, notes: newClaim.description }
          : p
      )
    );
  };

  const handleUpdateClaimStatus = (claimId: string, status: ClaimStatus, approvedAmount?: number) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id === claimId) {
          return {
            ...c,
            status,
            approvedCompensation: approvedAmount !== undefined ? approvedAmount : c.approvedCompensation,
            resolvedDate: new Date().toISOString(),
          };
        }
        return c;
      })
    );
  };

  const handleOpenClaimModalFromParcel = (parcel: Parcel) => {
    setParcelForClaim(parcel);
    setCurrentTab('claims');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        userRole={userRole}
        onRoleChange={setUserRole}
        isMobileView={isMobileView}
        onToggleMobileView={() => setIsMobileView(!isMobileView)}
        lang={lang}
        onToggleLang={() => setLang(lang === 'my' ? 'en' : 'my')}
        onOpenBookingModal={() => setIsBookingModalOpen(true)}
      />

      {/* Main Content Area: Responsive Desktop or Simulated Android Frame */}
      <main className="flex-1 py-6 px-4 sm:px-6">
        {isMobileView ? (
          /* Mobile Android Device Mockup Frame */
          <div className="max-w-[420px] mx-auto">
            {/* Device Frame */}
            <div className="rounded-[40px] border-[8px] border-slate-800 bg-slate-950 shadow-2xl overflow-hidden ring-1 ring-slate-700/50">
              {/* Android Status Bar */}
              <div className="bg-slate-900 px-6 py-2 flex items-center justify-between text-[11px] text-slate-400 font-mono select-none">
                <span>09:30</span>
                <div className="w-16 h-4 bg-slate-950 rounded-full mx-auto" />
                <span className="flex items-center gap-1">
                  <span>5G</span>
                  <span>100%</span>
                </span>
              </div>

              {/* App Content inside Android Mockup */}
              <div className="p-4 overflow-y-auto max-h-[740px]">
                {currentTab === 'dashboard' && (
                  <FinancialDashboard
                    parcels={parcels}
                    trips={trips}
                    claims={claims}
                    userRole={userRole}
                    lang={lang}
                    onNavigateTab={setCurrentTab}
                    onOpenBookingModal={() => setIsBookingModalOpen(true)}
                  />
                )}
                {currentTab === 'parcels' && (
                  <ParcelList
                    parcels={parcels}
                    userRole={userRole}
                    lang={lang}
                    onSelectParcelForReceipt={setSelectedParcelForReceipt}
                    onUpdateStatus={handleUpdateParcelStatus}
                    onBatchUpdateStatus={handleBatchUpdateStatus}
                    onOpenClaimModal={handleOpenClaimModalFromParcel}
                    onOpenBookingModal={() => setIsBookingModalOpen(true)}
                  />
                )}
                {currentTab === 'trips' && (
                  <TripManagement
                    trips={trips}
                    parcels={parcels}
                    onAddTrip={handleAddTrip}
                    onUpdateTripStatus={handleUpdateTripStatus}
                    onUpdateTripSettlement={handleUpdateTripSettlement}
                    onAddTripExpense={handleAddTripExpense}
                    userRole={userRole}
                    lang={lang}
                  />
                )}
                {currentTab === 'claims' && (
                  <ClaimsManagement
                    claims={claims}
                    parcels={parcels}
                    onAddClaim={handleAddClaim}
                    onUpdateClaimStatus={handleUpdateClaimStatus}
                    userRole={userRole}
                    lang={lang}
                    preselectedParcel={parcelForClaim}
                  />
                )}
                {currentTab === 'android-studio' && <AndroidStudioHub lang={lang} />}
              </div>

              {/* Android Bottom Navigation Bar Indicator */}
              <div className="bg-slate-900 py-3 flex justify-center">
                <div className="w-28 h-1 bg-slate-600 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Baseline (1200px - 1440px wide) */
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <FinancialDashboard
                parcels={parcels}
                trips={trips}
                claims={claims}
                userRole={userRole}
                lang={lang}
                onNavigateTab={setCurrentTab}
                onOpenBookingModal={() => setIsBookingModalOpen(true)}
              />
            )}
            {currentTab === 'parcels' && (
              <ParcelList
                parcels={parcels}
                userRole={userRole}
                lang={lang}
                onSelectParcelForReceipt={setSelectedParcelForReceipt}
                onUpdateStatus={handleUpdateParcelStatus}
                onBatchUpdateStatus={handleBatchUpdateStatus}
                onOpenClaimModal={handleOpenClaimModalFromParcel}
                onOpenBookingModal={() => setIsBookingModalOpen(true)}
              />
            )}
            {currentTab === 'trips' && (
              <TripManagement
                trips={trips}
                parcels={parcels}
                onAddTrip={handleAddTrip}
                onUpdateTripStatus={handleUpdateTripStatus}
                onUpdateTripSettlement={handleUpdateTripSettlement}
                onAddTripExpense={handleAddTripExpense}
                userRole={userRole}
                lang={lang}
              />
            )}
            {currentTab === 'claims' && (
              <ClaimsManagement
                claims={claims}
                parcels={parcels}
                onAddClaim={handleAddClaim}
                onUpdateClaimStatus={handleUpdateClaimStatus}
                userRole={userRole}
                lang={lang}
                preselectedParcel={parcelForClaim}
              />
            )}
            {currentTab === 'android-studio' && <AndroidStudioHub lang={lang} />}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      <ParcelBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookParcel={handleBookParcel}
        trips={trips}
        lang={lang}
      />

      {/* Digital Receipt Modal (Share to Viber / SMS / Bluetooth Thermal Sticker) */}
      <DigitalReceiptModal
        parcel={selectedParcelForReceipt}
        onClose={() => setSelectedParcelForReceipt(null)}
        lang={lang}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>BMK Express Car Gate (Mandalay ⇄ Kalay) Express Logistics System</span>
          <span>Standard: 1,200 MMK/viss · Bulky (ကုန်ပွ): Custom Rate · 12-Wheel Truck: 1,100 MMK</span>
        </div>
      </footer>
    </div>
  );
}
