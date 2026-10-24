import React, { useState, useEffect } from 'react';
import { 
  Parcel, 
  Trip, 
  Claim, 
  UserRole, 
  ParcelStatus, 
  ClaimStatus, 
  TripStatus, 
  DriverExpenseEntry,
  WeightUnit,
  GatePricingConfig,
  DEFAULT_GATE_PRICING,
  AppUserAccount
} from './types/bmk';
import { INITIAL_PARCELS, INITIAL_TRIPS, INITIAL_CLAIMS } from './data/mockData';
import { BMK_STAFF_ACCOUNTS } from './data/mockUsers';
import { Header } from './components/Header';
import { FinancialDashboard } from './components/FinancialDashboard';
import { ParcelList } from './components/ParcelList';
import { TripManagement } from './components/TripManagement';
import { ClaimsManagement } from './components/ClaimsManagement';
import { AndroidStudioHub } from './components/AndroidStudioHub';
import { ParcelBookingModal } from './components/ParcelBookingModal';
import { DigitalReceiptModal } from './components/DigitalReceiptModal';
import { AdminPricingModal } from './components/AdminPricingModal';
import { LoginModal } from './components/LoginModal';
import { GeminiChatBotModal } from './components/GeminiChatBotModal';
import { Sparkles } from 'lucide-react';
import { testFirestoreConnection } from './firebase/config';
import { 
  seedInitialDataIfEmpty,
  subscribeToParcels,
  subscribeToTrips,
  subscribeToClaims,
  subscribeToPricingConfig,
  syncParcelToFirestore,
  syncTripToFirestore,
  syncClaimToFirestore,
  syncPricingConfigToFirestore
} from './firebase/firestoreService';

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

  // Gate Rates Pricing Configuration (Admin customizable)
  const [pricingConfig, setPricingConfig] = useState<GatePricingConfig>(() => {
    try {
      const saved = localStorage.getItem('bmk_pricing_config');
      return saved ? JSON.parse(saved) : DEFAULT_GATE_PRICING;
    } catch {
      return DEFAULT_GATE_PRICING;
    }
  });

  // Weight Unit state: 'VISS' (ပိဿာ) or 'KG' (ကီလို)
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(() => {
    try {
      const saved = localStorage.getItem('bmk_weight_unit');
      return (saved as WeightUnit) || 'VISS';
    } catch {
      return 'VISS';
    }
  });

  const [currentUser, setCurrentUser] = useState<AppUserAccount>(() => {
    try {
      const saved = localStorage.getItem('bmk_active_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        const found = BMK_STAFF_ACCOUNTS.find((a) => a.id === parsed.id);
        if (found) return found;
      }
    } catch {}
    return BMK_STAFF_ACCOUNTS[0]; // Default to Admin
  });

  const userRole = currentUser.role;

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'parcels' | 'trips' | 'claims' | 'android-studio'>('dashboard');
  const [isMobileView, setIsMobileView] = useState(false);
  const [lang, setLang] = useState<'my' | 'en'>('my');

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [selectedParcelForReceipt, setSelectedParcelForReceipt] = useState<Parcel | null>(null);
  const [parcelForClaim, setParcelForClaim] = useState<Parcel | null>(null);
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);

  // Connect to Cloud Firestore & Listen to Real-Time Updates
  useEffect(() => {
    testFirestoreConnection().then(() => {
      seedInitialDataIfEmpty();
    });

    const unsubParcels = subscribeToParcels((liveParcels) => {
      if (liveParcels && liveParcels.length > 0) {
        setParcels(liveParcels);
      }
    });

    const unsubTrips = subscribeToTrips((liveTrips) => {
      if (liveTrips && liveTrips.length > 0) {
        setTrips(liveTrips);
      }
    });

    const unsubClaims = subscribeToClaims((liveClaims) => {
      if (liveClaims && liveClaims.length > 0) {
        setClaims(liveClaims);
      }
    });

    const unsubPricing = subscribeToPricingConfig((livePricing) => {
      if (livePricing) {
        setPricingConfig(livePricing);
      }
    });

    return () => {
      unsubParcels();
      unsubTrips();
      unsubClaims();
      unsubPricing();
    };
  }, []);

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

  useEffect(() => {
    try {
      localStorage.setItem('bmk_pricing_config', JSON.stringify(pricingConfig));
    } catch (e) {
      console.error(e);
    }
  }, [pricingConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('bmk_weight_unit', weightUnit);
    } catch (e) {
      console.error(e);
    }
  }, [weightUnit]);

  // Parcel handlers
  const handleBookParcel = (newParcel: Parcel) => {
    setParcels((prev) => [newParcel, ...prev]);
    syncParcelToFirestore(newParcel);

    // If trip was selected, update loaded viss in trip
    if (newParcel.tripId) {
      setTrips((prevTrips) =>
        prevTrips.map((t) => {
          if (t.id === newParcel.tripId) {
            const updatedLoaded = t.currentLoadedViss + newParcel.weightViss;
            const updatedRent = updatedLoaded * pricingConfig.truckRatePerViss;
            const updatedTrip = {
              ...t,
              currentLoadedViss: updatedLoaded,
              parcelIds: [...t.parcelIds, newParcel.id],
              totalTruckRentFee: updatedRent,
              totalMdyLabor: updatedLoaded * pricingConfig.mdyLaborPerViss,
              totalKalayLabor: updatedLoaded * pricingConfig.kalayLaborPerViss,
              remainingSettlementKalay: Math.max(0, updatedRent - t.advancePaymentMdy),
            };
            syncTripToFirestore(updatedTrip);
            return updatedTrip;
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
      prev.map((p) => {
        if (p.id === parcelId) {
          const updated = { ...p, status: newStatus, updatedAt: new Date().toISOString() };
          syncParcelToFirestore(updated);
          return updated;
        }
        return p;
      })
    );
  };

  const handleBatchUpdateStatus = (parcelIds: string[], newStatus: ParcelStatus) => {
    setParcels((prev) =>
      prev.map((p) => {
        if (parcelIds.includes(p.id)) {
          const updated = { ...p, status: newStatus, updatedAt: new Date().toISOString() };
          syncParcelToFirestore(updated);
          return updated;
        }
        return p;
      })
    );
  };

  // Trip handlers
  const handleAddTrip = (newTrip: Trip) => {
    setTrips((prev) => [newTrip, ...prev]);
    syncTripToFirestore(newTrip);
  };

  const handleUpdateTripStatus = (tripId: string, status: TripStatus) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          const updated = { ...t, status };
          syncTripToFirestore(updated);
          return updated;
        }
        return t;
      })
    );

    // Also update parcels assigned to this trip if in transit or arrived
    if (status === 'IN_TRANSIT') {
      setParcels((prev) =>
        prev.map((p) => {
          if (p.tripId === tripId && p.status === 'LOADED') {
            const updated = { ...p, status: 'IN_TRANSIT' as ParcelStatus };
            syncParcelToFirestore(updated);
            return updated;
          }
          return p;
        })
      );
    } else if (status === 'ARRIVED') {
      setParcels((prev) =>
        prev.map((p) => {
          if (p.tripId === tripId && p.status === 'IN_TRANSIT') {
            const updated = { ...p, status: 'ARRIVED_KALAY' as ParcelStatus };
            syncParcelToFirestore(updated);
            return updated;
          }
          return p;
        })
      );
    }
  };

  const handleUpdateTripSettlement = (tripId: string, advanceMdy: number, isSettled: boolean) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          const updated = {
            ...t,
            advancePaymentMdy: advanceMdy,
            isDriverSettled: isSettled,
            driverSettledDate: isSettled ? new Date().toISOString() : undefined,
            remainingSettlementKalay: isSettled ? 0 : Math.max(0, t.totalTruckRentFee - advanceMdy),
          };
          syncTripToFirestore(updated);
          return updated;
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
          const updated = {
            ...t,
            expenses: [expense, ...currentExpenses],
          };
          syncTripToFirestore(updated);
          return updated;
        }
        return t;
      })
    );
  };

  // Claims handlers
  const handleAddClaim = (newClaim: Claim) => {
    setClaims((prev) => [newClaim, ...prev]);
    syncClaimToFirestore(newClaim);

    setParcels((prev) =>
      prev.map((p) => {
        if (p.id === newClaim.parcelId) {
          const updated = { ...p, status: 'CLAIMED_LOST' as ParcelStatus, claimId: newClaim.id, notes: newClaim.description };
          syncParcelToFirestore(updated);
          return updated;
        }
        return p;
      })
    );
  };

  const handleUpdateClaimStatus = (claimId: string, status: ClaimStatus, approvedAmount?: number) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id === claimId) {
          const updated = {
            ...c,
            status,
            approvedCompensation: approvedAmount !== undefined ? approvedAmount : c.approvedCompensation,
            resolvedDate: new Date().toISOString(),
          };
          syncClaimToFirestore(updated);
          return updated;
        }
        return c;
      })
    );
  };

  const handleOpenClaimModalFromParcel = (parcel: Parcel) => {
    setParcelForClaim(parcel);
    setCurrentTab('claims');
  };

  const handleToggleWeightUnit = () => {
    setWeightUnit((prev) => (prev === 'VISS' ? 'KG' : 'VISS'));
  };

  const handleSelectUser = (user: AppUserAccount) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('bmk_active_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }

    // Role-based smart route redirect if user doesn't have access to current tab
    if (user.role === 'MANDALAY_STAFF' && currentTab === 'dashboard') {
      setCurrentTab('parcels');
    } else if (user.role === 'KALAY_STAFF' && (currentTab === 'dashboard' || currentTab === 'claims')) {
      setCurrentTab('trips');
    } else if (user.role === 'DRIVER') {
      setCurrentTab('trips');
    }
  };

  const handleQuickRoleSwitch = (role: UserRole) => {
    const target = BMK_STAFF_ACCOUNTS.find((a) => a.role === role);
    if (target) {
      handleSelectUser(target);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onQuickRoleSwitch={handleQuickRoleSwitch}
        weightUnit={weightUnit}
        onToggleWeightUnit={handleToggleWeightUnit}
        isMobileView={isMobileView}
        onToggleMobileView={() => setIsMobileView(!isMobileView)}
        lang={lang}
        onToggleLang={() => setLang(lang === 'my' ? 'en' : 'my')}
        onOpenBookingModal={() => setIsBookingModalOpen(true)}
        onOpenPricingModal={() => setIsPricingModalOpen(true)}
        onOpenChatBot={() => setIsChatBotOpen(true)}
      />

      {/* Main Content Area */}
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
                    pricingConfig={pricingConfig}
                    weightUnit={weightUnit}
                    lang={lang}
                    onNavigateTab={setCurrentTab}
                    onOpenBookingModal={() => setIsBookingModalOpen(true)}
                    onOpenPricingModal={() => setIsPricingModalOpen(true)}
                  />
                )}
                {currentTab === 'parcels' && (
                  <ParcelList
                    parcels={parcels}
                    userRole={userRole}
                    weightUnit={weightUnit}
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
          /* Desktop Baseline */
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <FinancialDashboard
                parcels={parcels}
                trips={trips}
                claims={claims}
                userRole={userRole}
                pricingConfig={pricingConfig}
                weightUnit={weightUnit}
                lang={lang}
                onNavigateTab={setCurrentTab}
                onOpenBookingModal={() => setIsBookingModalOpen(true)}
                onOpenPricingModal={() => setIsPricingModalOpen(true)}
              />
            )}
            {currentTab === 'parcels' && (
              <ParcelList
                parcels={parcels}
                userRole={userRole}
                weightUnit={weightUnit}
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

      {/* Booking Modal with Viss & Kg input options */}
      <ParcelBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookParcel={handleBookParcel}
        trips={trips}
        pricingConfig={pricingConfig}
        defaultWeightUnit={weightUnit}
        lang={lang}
      />

      {/* Admin Pricing Modal for Custom Rates */}
      <AdminPricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        pricingConfig={pricingConfig}
        onSavePricingConfig={(newConfig) => {
          setPricingConfig(newConfig);
          syncPricingConfigToFirestore(newConfig);
        }}
        lang={lang}
      />

      {/* Digital Receipt Modal (Share to Viber / SMS / Bluetooth Thermal Sticker) */}
      <DigitalReceiptModal
        parcel={selectedParcelForReceipt}
        onClose={() => setSelectedParcelForReceipt(null)}
        weightUnit={weightUnit}
        lang={lang}
      />

      {/* Single APK Account Switcher & Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        lang={lang}
      />

      {/* Gemini AI Chat Bot Modal */}
      <GeminiChatBotModal
        isOpen={isChatBotOpen}
        onClose={() => setIsChatBotOpen(false)}
        currentUser={currentUser}
        pricingConfig={pricingConfig}
        weightUnit={weightUnit}
        parcelsCount={parcels.length}
        tripsCount={trips.length}
        lang={lang}
      />

      {/* Floating Gemini AI Chat Bot Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsChatBotOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
          </span>
          <span className="flex items-center gap-1.5 font-bold">
            <Sparkles className="w-4 h-4 text-slate-950 animate-pulse group-hover:rotate-12 transition-transform" />
            <span>{lang === 'my' ? 'BMK AI လက်ထောက်' : 'BMK AI Copilot'}</span>
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full bg-slate-950/20 text-slate-950 text-[10px] font-mono">
            Gemini
          </span>
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>BMK Express Car Gate (Mandalay ⇄ Kalay) Express Logistics System</span>
          <span>
            {weightUnit === 'VISS' ? '၁ ပိဿာ' : '1 Kg'} = {pricingConfig.customerRatePerViss} MMK/viss (~ {(pricingConfig.customerRatePerViss / 1.63293).toFixed(1)} MMK/kg) · ကားခ {pricingConfig.truckRatePerViss} MMK · အလုပ်သမား {pricingConfig.mdyLaborPerViss + pricingConfig.kalayLaborPerViss} MMK
          </span>
        </div>
      </footer>
    </div>
  );
}
