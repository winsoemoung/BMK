export type PaymentStatus = 'PAID' | 'UNPAID' | 'COD';

export type ParcelStatus = 
  | 'BOOKED'        // မန္တလေးဂိတ်တွင် ပစ္စည်းလက်ခံရရှိ
  | 'LOADED'        // ၁၂ ဘီးကားပေါ်သို့ တင်ပြီး
  | 'IN_TRANSIT'     // မန္တလေးမှ ကလေးသို့ လမ်းခရီးတွင်
  | 'ARRIVED_KALAY' // ကလေးဂိတ်သို့ ရောက်ရှိ
  | 'DELIVERED'     // ကလေးတွင် လက်ခံသူထံ အပ်နှံပြီး
  | 'CLAIMED_LOST'; // လမ်းခရီး ပျောက်ဆုံး/ပျက်စီး လျော်ကြေးတောင်းခံ

export type UserRole = 'ADMIN' | 'MANDALAY_STAFF' | 'KALAY_STAFF';

export type IncidentType = 'LOST' | 'DAMAGED' | 'SHORTAGE';

export type ClaimStatus = 'PENDING' | 'APPROVED_PAID' | 'REJECTED';

export type TripStatus = 'LOADING' | 'IN_TRANSIT' | 'ARRIVED' | 'COMPLETED';

// Core Business Pricing Constants (MMK per viss / ပိသာ)
export const BMK_PRICING = {
  CUSTOMER_RATE_PER_VISS: 1200,   // Customer service fee per viss
  TRUCK_RATE_PER_VISS: 1100,      // 12-wheel truck charter fee per viss
  MDY_LABOR_PER_VISS: 25,         // Mandalay loading labor fee per viss
  KALAY_LABOR_PER_VISS: 25,       // Kalay unloading labor fee per viss
  BASE_PROFIT_PER_VISS: 50,       // 1200 - (1100 + 25 + 25) = 50 MMK
};

export interface Parcel {
  id: string;                    // e.g., BMK-20261023-001
  qrCode: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  itemType: string;              // e.g. ကုန်ခြောက်, အထည်အလိပ်, ဆေးဝါး, စက်ပစ္စည်း
  itemDescription: string;
  packageCount: number;
  weightViss: number;            // ပိသာ အလေးချိန်
  customerRatePerViss: number;   // 1200 MMK
  totalDeliveryFee: number;      // weightViss * 1200
  paymentStatus: PaymentStatus;
  paymentCollectedAt: 'MANDALAY' | 'KALAY';
  truckExpense: number;          // weightViss * 1100
  mandalayLaborFee: number;      // weightViss * 25
  kalayLaborFee: number;         // weightViss * 25
  baseNetProfit: number;         // weightViss * 50
  status: ParcelStatus;
  tripId?: string;
  claimId?: string;
  createdAt: string;
  updatedAt: string;
  bookedByStaff: string;
  notes?: string;
}

export interface Trip {
  id: string;                    // e.g. TRIP-20261023-01
  truckNumber: string;           // e.g. 3B-4521 (Hino 12-Wheeler)
  driverName: string;
  driverPhone: string;
  departureDate: string;
  expectedArrivalDate: string;
  actualArrivalDate?: string;
  route: string;                 // Mandalay -> Monywa -> Gangaw -> Kalay
  status: TripStatus;
  maxCapacityViss: number;       // e.g. 8000 viss
  currentLoadedViss: number;
  parcelIds: string[];
  totalTruckRentFee: number;     // loadedViss * 1100
  totalMdyLabor: number;         // loadedViss * 25
  totalKalayLabor: number;       // loadedViss * 25
  notes?: string;
}

export interface Claim {
  id: string;                    // e.g. CLM-001
  parcelId: string;
  parcelCode: string;
  customerName: string;
  customerPhone: string;
  incidentType: IncidentType;
  description: string;
  claimedAmount: number;         // Customer requested compensation
  approvedCompensation: number;  // Approved amount deducted from gate net profit
  status: ClaimStatus;
  reportedDate: string;
  resolvedDate?: string;
  reportedBy: string;
  photoUrl?: string;
}

export interface GateFinancialSummary {
  totalParcelsCount: number;
  totalWeightViss: number;
  totalRevenue: number;          // totalWeight * 1200
  totalTruckExpense: number;     // totalWeight * 1100
  totalMandalayLabor: number;    // totalWeight * 25
  totalKalayLabor: number;       // totalWeight * 25
  totalOperatingExpense: number; // Truck + MDY labor + Kalay labor
  grossBaseProfit: number;       // totalWeight * 50
  totalClaimsPaid: number;       // sum of approved compensation
  trueNetProfit: number;         // grossBaseProfit - totalClaimsPaid
  paidRevenue: number;
  codPendingRevenue: number;
  unpaidRevenue: number;
}
