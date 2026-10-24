export type PaymentStatus = 'PAID' | 'UNPAID' | 'COD';

export type ParcelStatus = 
  | 'BOOKED'        // မန္တလေးဂိတ်တွင် ပစ္စည်းလက်ခံရရှိ
  | 'LOADED'        // ၁၂ ဘီးကားပေါ်သို့ တင်ပြီး
  | 'IN_TRANSIT'     // မန္တလေးမှ ကလေးသို့ လမ်းခရီးတွင်
  | 'ARRIVED_KALAY' // ကလေးဂိတ်သို့ ရောက်ရှိ
  | 'DELIVERED'     // ကလေးတွင် လက်ခံသူထံ အပ်နှံပြီး
  | 'CLAIMED_LOST'; // လမ်းခရီး ပျောက်ဆုံး/ပျက်စီး လျော်ကြေးတောင်းခံ

export type UserRole = 'ADMIN' | 'MANDALAY_STAFF' | 'KALAY_STAFF' | 'DRIVER';

export interface UserPermissions {
  canBookParcel: boolean;
  canPrintLabels: boolean;
  canManageTrips: boolean;
  canReceiveAtKalay: boolean;
  canCollectCOD: boolean;
  canConfigurePricing: boolean;
  canApproveClaims: boolean;
  canViewProfitLoss: boolean;
  canSettleDriver: boolean;
}

export interface AppUserAccount {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  roleTitleMy: string;
  roleTitleEn: string;
  gateLocation: 'MANDALAY' | 'KALAY' | 'HQ' | 'TRANSIT';
  gateLocationNameMy: string;
  pin: string; // 4-digit PIN for quick field login
  avatarColor: string;
  permissions: UserPermissions;
}

export type IncidentType = 'LOST' | 'DAMAGED' | 'SHORTAGE';

export type ClaimStatus = 'PENDING' | 'APPROVED_PAID' | 'REJECTED';

export type TripStatus = 'LOADING' | 'IN_TRANSIT' | 'ARRIVED' | 'COMPLETED';

export type WeightUnit = 'VISS' | 'KG';

// Myanmar weight conversion constant: 1 Viss (ပိဿာ) = 1.63293 Kilograms (Kg)
export const VISS_TO_KG_RATIO = 1.63293;
export const KG_TO_VISS_RATIO = 1 / VISS_TO_KG_RATIO; // 0.6123961...

export interface GatePricingConfig {
  customerRatePerViss: number; // default 1200 MMK
  truckRatePerViss: number;    // default 1100 MMK
  mdyLaborPerViss: number;     // default 25 MMK
  kalayLaborPerViss: number;   // default 25 MMK
  defaultBulkyRate: number;    // default 1600 MMK
}

export const DEFAULT_GATE_PRICING: GatePricingConfig = {
  customerRatePerViss: 1200,
  truckRatePerViss: 1100,
  mdyLaborPerViss: 25,
  kalayLaborPerViss: 25,
  defaultBulkyRate: 1600,
};

// Deprecated static constant kept for fallback
export const BMK_PRICING = {
  CUSTOMER_RATE_PER_VISS: 1200,
  DEFAULT_BULKY_RATE: 1600,
  TRUCK_RATE_PER_VISS: 1100,
  MDY_LABOR_PER_VISS: 25,
  KALAY_LABOR_PER_VISS: 25,
  BASE_PROFIT_PER_VISS: 50,
};

export interface FrequentCustomer {
  id: string;
  name: string;
  phone: string;
  city: 'MANDALAY' | 'KALAY';
  address: string;
  defaultItemType: string;
}

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
  weightViss: number;            // Standard weight stored internally in Viss (ပိဿာ)
  customerRatePerViss: number;   // MMK per viss
  isBulkyGoods: boolean;         // ကုန်ပွ (ထုထည်ကြီးပြီး ပေါ့သော ပစ္စည်း)
  bulkyNote?: string;
  totalDeliveryFee: number;      // weightViss * customerRatePerViss
  paymentStatus: PaymentStatus;
  paymentCollectedAt: 'MANDALAY' | 'KALAY';
  truckExpense: number;          // weightViss * truckRatePerViss
  mandalayLaborFee: number;      // weightViss * mdyLaborPerViss
  kalayLaborFee: number;         // weightViss * kalayLaborPerViss
  baseNetProfit: number;         // totalDeliveryFee - (truckExpense + mandalayLaborFee + kalayLaborFee)
  status: ParcelStatus;
  tripId?: string;
  claimId?: string;
  createdAt: string;
  updatedAt: string;
  bookedByStaff: string;
  notes?: string;
  notifiedIntakeAt?: string;    // Timestamp when booking Viber/SMS notification was sent
  notifiedArrivalAt?: string;   // Timestamp when Kalay arrival notification was sent
}

export interface DriverExpenseEntry {
  id: string;
  category: 'FUEL' | 'TOLL_GATE' | 'CHECKPOINT' | 'ALLOWANCE' | 'REPAIR';
  description: string;
  amount: number;
  date: string;
  location: string;
}

export interface Trip {
  id: string;                    // e.g. TRIP-20261023-01
  truckNumber: string;           // e.g. 3B-4521 (Hino 12-Wheeler)
  driverName: string;
  driverPhone: string;
  departureDate: string;
  expectedArrivalDate: string;
  actualArrivalDate?: string;
  route: string;
  status: TripStatus;
  maxCapacityViss: number;       // e.g. 8000 viss
  currentLoadedViss: number;
  parcelIds: string[];
  totalTruckRentFee: number;     // loadedViss * truckRatePerViss
  totalMdyLabor: number;         // loadedViss * mdyLaborPerViss
  totalKalayLabor: number;       // loadedViss * kalayLaborPerViss
  
  // Driver Trip Advance & Settlement Ledger
  advancePaymentMdy: number;      // မန္တလေးထွက်ခွာချိန် ဆီဖိုး/လမ်းစရိတ် ကြိုထုတ်ငွေ
  roadExpensesAllowance: number;  // တိုးဂိတ်ကြေး/စစ်ဆေးရေးဂိတ် ထောက်ပံ့ငွေ
  expenses: DriverExpenseEntry[];
  remainingSettlementKalay: number; // ကလေးရောက်မှ ရှင်းပေးရန် ကျန်ငွေ
  isDriverSettled: boolean;
  driverSettledDate?: string;

  notes?: string;
}

export interface Claim {
  id: string;
  parcelId: string;
  parcelCode: string;
  customerName: string;
  customerPhone: string;
  incidentType: IncidentType;
  description: string;
  claimedAmount: number;
  approvedCompensation: number;
  status: ClaimStatus;
  reportedDate: string;
  resolvedDate?: string;
  reportedBy: string;
  photoUrl?: string;
}

export interface GateFinancialSummary {
  totalParcelsCount: number;
  totalWeightViss: number;
  totalRevenue: number;
  totalTruckExpense: number;
  totalMandalayLabor: number;
  totalKalayLabor: number;
  totalOperatingExpense: number;
  grossBaseProfit: number;
  totalClaimsPaid: number;
  trueNetProfit: number;
  paidRevenue: number;
  codPendingRevenue: number;
  unpaidRevenue: number;
}
