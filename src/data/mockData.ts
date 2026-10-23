import { Parcel, Trip, Claim, BMK_PRICING } from '../types/bmk';

export const INITIAL_PARCELS: Parcel[] = [
  {
    id: 'BMK-20261023-001',
    qrCode: 'BMK-20261023-001|MDY-KLY|120VISS',
    senderName: 'ဦးသန်းထွန်း (ရွှေစင်ကုန်မာ)',
    senderPhone: '09-450012345',
    senderAddress: 'မန္တလေး၊ ၈၄ လမ်း၊ ၃၅x၃၆ ကြား၊ ချမ်းအေးသာစံ',
    receiverName: 'ဒေါ်အေးသီတာ (တာဟန်း ကုန်စုံ)',
    receiverPhone: '09-256123456',
    receiverAddress: 'ကလေးမြို့၊ တာဟန်းရပ်ကွက်၊ ဗိုလ်ချုပ်လမ်းမကြီး',
    itemType: 'ကုန်ခြောက် / စားသောက်ကုန်',
    itemDescription: 'လက်ဖက်ခြောက်၊ ငါးခြောက် နှင့် စားဆီပုံးများ (၁၀ ထုပ်)',
    packageCount: 10,
    weightViss: 120,
    customerRatePerViss: BMK_PRICING.CUSTOMER_RATE_PER_VISS,
    totalDeliveryFee: 120 * BMK_PRICING.CUSTOMER_RATE_PER_VISS, // 144,000 MMK
    paymentStatus: 'PAID',
    paymentCollectedAt: 'MANDALAY',
    truckExpense: 120 * BMK_PRICING.TRUCK_RATE_PER_VISS,        // 132,000 MMK
    mandalayLaborFee: 120 * BMK_PRICING.MDY_LABOR_PER_VISS,    // 3,000 MMK
    kalayLaborFee: 120 * BMK_PRICING.KALAY_LABOR_PER_VISS,       // 3,000 MMK
    baseNetProfit: 120 * BMK_PRICING.BASE_PROFIT_PER_VISS,      // 6,000 MMK
    status: 'IN_TRANSIT',
    tripId: 'TRIP-20261023-01',
    createdAt: '2026-10-23T06:30:00Z',
    updatedAt: '2026-10-23T08:15:00Z',
    bookedByStaff: 'မောင်ဇော် (MDY Gate)',
    notes: 'မိုးရေမစိုစေရန် တာပေါ်လင် သေချာအုပ်ထားရန်'
  },
  {
    id: 'BMK-20261023-002',
    qrCode: 'BMK-20261023-002|MDY-KLY|85VISS',
    senderName: 'မနီနီဝင်း (ဝင်းအထည်တိုက်)',
    senderPhone: '09-798889911',
    senderAddress: 'မန္တလေး၊ ဇေးချိုတိုက်တန်း၊ အလယ်ရုံ',
    receiverName: 'မဇင်မာဦး (ဖက်ရှင်ဆိုင်)',
    receiverPhone: '09-400122334',
    receiverAddress: 'ကလေးမြို့၊ ပင်လုံရပ်ကွက်၊ စျေးကြီးအနီး',
    itemType: 'အထည်အလိပ် / ဖက်ရှင်',
    itemDescription: 'ဆွယ်တာ၊ ဂျင်းဘောင်းဘီ အထုပ်ကြီး (၅ အထုပ်)',
    packageCount: 5,
    weightViss: 85,
    customerRatePerViss: BMK_PRICING.CUSTOMER_RATE_PER_VISS,
    totalDeliveryFee: 85 * BMK_PRICING.CUSTOMER_RATE_PER_VISS,  // 102,000 MMK
    paymentStatus: 'COD',
    paymentCollectedAt: 'KALAY',
    truckExpense: 85 * BMK_PRICING.TRUCK_RATE_PER_VISS,         // 93,500 MMK
    mandalayLaborFee: 85 * BMK_PRICING.MDY_LABOR_PER_VISS,     // 2,125 MMK
    kalayLaborFee: 85 * BMK_PRICING.KALAY_LABOR_PER_VISS,        // 2,125 MMK
    baseNetProfit: 85 * BMK_PRICING.BASE_PROFIT_PER_VISS,       // 4,250 MMK
    status: 'IN_TRANSIT',
    tripId: 'TRIP-20261023-01',
    createdAt: '2026-10-23T07:10:00Z',
    updatedAt: '2026-10-23T08:15:00Z',
    bookedByStaff: 'မောင်ဇော် (MDY Gate)',
    notes: 'ကလေးရောက်မှ ကုန်စည်ပို့ခ ၁၀၂,၀၀၀ ကျပ် ကောက်ခံရန်'
  },
  {
    id: 'BMK-20261023-003',
    qrCode: 'BMK-20261023-003|MDY-KLY|240VISS',
    senderName: 'ဦးကျော်သူ (အောင်စက်ပစ္စည်းရောင်းဝယ်ရေး)',
    senderPhone: '09-970034567',
    senderAddress: 'မန္တလေး၊ စက်မှုဇုန် (၁)၊ ၆၂ လမ်း',
    receiverName: 'ကိုဟန်ဝင်း (ထွန်းစက်ပြင်ဝပ်ရှော့)',
    receiverPhone: '09-698765432',
    receiverAddress: 'ကလေးမြို့၊ ချမ်းမြေ့အောင်စည်၊ ကားကြီးကွင်းလမ်း',
    itemType: 'စက်ပစ္စည်း အပိုပစ္စည်း',
    itemDescription: 'လယ်ထွန်စက် အင်ဂျင်အပိုပစ္စည်း သံသေတ္တာ (၃ လုံး)',
    packageCount: 3,
    weightViss: 240,
    customerRatePerViss: BMK_PRICING.CUSTOMER_RATE_PER_VISS,
    totalDeliveryFee: 240 * BMK_PRICING.CUSTOMER_RATE_PER_VISS, // 288,000 MMK
    paymentStatus: 'PAID',
    paymentCollectedAt: 'MANDALAY',
    truckExpense: 240 * BMK_PRICING.TRUCK_RATE_PER_VISS,        // 264,000 MMK
    mandalayLaborFee: 240 * BMK_PRICING.MDY_LABOR_PER_VISS,    // 6,000 MMK
    kalayLaborFee: 240 * BMK_PRICING.KALAY_LABOR_PER_VISS,       // 6,000 MMK
    baseNetProfit: 240 * BMK_PRICING.BASE_PROFIT_PER_VISS,      // 12,000 MMK
    status: 'LOADED',
    tripId: 'TRIP-20261023-01',
    createdAt: '2026-10-23T07:45:00Z',
    updatedAt: '2026-10-23T08:30:00Z',
    bookedByStaff: 'မောင်ဇော် (MDY Gate)',
    notes: 'လေးလံသော ပစ္စည်းဖြစ်၍ ကားအောက်ခြေတွင် ထားရှိရန်'
  },
  {
    id: 'BMK-20261023-004',
    qrCode: 'BMK-20261023-004|MDY-KLY|40VISS',
    senderName: 'ဒေါ်ခင်မျိုးနွယ် (နွယ်နွယ်ဆေးဆိုင်)',
    senderPhone: '09-443322110',
    senderAddress: 'မန္တလေး၊ ၃၀ လမ်း၊ ၇၈x၇၉ ကြား',
    receiverName: 'ဒေါက်တာဇင်မင်း (ကလေးကုသိုလ်ဖြစ်ဆေးခန်း)',
    receiverPhone: '09-955667788',
    receiverAddress: 'ကလေးမြို့၊ ဆေးရုံကြီးအနီး၊ ဗိုလ်ချုပ်လမ်း',
    itemType: 'ဆေးဝါးနှင့် ကျန်းမာရေးသုံးပစ္စည်း',
    itemDescription: 'အဖျားပျောက်ဆေးနှင့် ဓာတ်ဆားထုတ်များ (၄ ဖာ)',
    packageCount: 4,
    weightViss: 40,
    customerRatePerViss: BMK_PRICING.CUSTOMER_RATE_PER_VISS,
    totalDeliveryFee: 40 * BMK_PRICING.CUSTOMER_RATE_PER_VISS,  // 48,000 MMK
    paymentStatus: 'PAID',
    paymentCollectedAt: 'MANDALAY',
    truckExpense: 40 * BMK_PRICING.TRUCK_RATE_PER_VISS,         // 44,000 MMK
    mandalayLaborFee: 40 * BMK_PRICING.MDY_LABOR_PER_VISS,     // 1,000 MMK
    kalayLaborFee: 40 * BMK_PRICING.KALAY_LABOR_PER_VISS,        // 1,000 MMK
    baseNetProfit: 40 * BMK_PRICING.BASE_PROFIT_PER_VISS,       // 2,000 MMK
    status: 'BOOKED',
    createdAt: '2026-10-23T08:50:00Z',
    updatedAt: '2026-10-23T08:50:00Z',
    bookedByStaff: 'ကိုအောင်ကို (MDY Gate)',
    notes: 'ဖိမချေရ၊ ဆေးဝါးများဖြစ်သည်'
  },
  {
    id: 'BMK-20261022-018',
    qrCode: 'BMK-20261022-018|MDY-KLY|90VISS',
    senderName: 'ကိုမျိုးမင်း (မန္တလေးအလှကုန်)',
    senderPhone: '09-771122334',
    senderAddress: 'မန္တလေး၊ ၈၄ လမ်း၊ အောင်မြေသာစံ',
    receiverName: 'မသူဇာနွယ်',
    receiverPhone: '09-421155990',
    receiverAddress: 'ကလေးမြို့၊ စျေးကွက်သစ်၊ ဆိုင်အမှတ် (၁၂)',
    itemType: 'အလှကုန်နှင့် လူသုံးကုန်',
    itemDescription: 'ခေါင်းလျှော်ရည်၊ ဆပ်ပြာနှင့် ခရင်ဘူးများ (၆ ဖာ)',
    packageCount: 6,
    weightViss: 90,
    customerRatePerViss: BMK_PRICING.CUSTOMER_RATE_PER_VISS,
    totalDeliveryFee: 90 * BMK_PRICING.CUSTOMER_RATE_PER_VISS,  // 108,000 MMK
    paymentStatus: 'PAID',
    paymentCollectedAt: 'MANDALAY',
    truckExpense: 90 * BMK_PRICING.TRUCK_RATE_PER_VISS,         // 99,000 MMK
    mandalayLaborFee: 90 * BMK_PRICING.MDY_LABOR_PER_VISS,     // 2,250 MMK
    kalayLaborFee: 90 * BMK_PRICING.KALAY_LABOR_PER_VISS,        // 2,250 MMK
    baseNetProfit: 90 * BMK_PRICING.BASE_PROFIT_PER_VISS,       // 4,500 MMK
    status: 'ARRIVED_KALAY',
    tripId: 'TRIP-20261022-02',
    createdAt: '2026-10-22T09:00:00Z',
    updatedAt: '2026-10-23T07:20:00Z',
    bookedByStaff: 'မောင်ဇော် (MDY Gate)',
    notes: 'ကလေးဂိတ်သို့ ရောက်ရှိပြီး၊ လူကြုံလာယူမည်'
  },
  {
    id: 'BMK-20261021-009',
    qrCode: 'BMK-20261021-009|MDY-KLY|60VISS',
    senderName: 'ဦးတင်မောင် (ရတနာပုံအိုးလုပ်ငန်း)',
    senderPhone: '09-250098765',
    senderAddress: 'မန္တလေး၊ အမရပူရမြို့နယ်',
    receiverName: 'ဦးလှရွှေ',
    receiverPhone: '09-402288114',
    receiverAddress: 'ကလေးမြို့၊ တာဟန်း၊ ချမ်းသာရွာသစ်',
    itemType: 'လူသုံးကုန် အိုးခွက်ပစ္စည်း',
    itemDescription: 'မြေအိုးနှင့် ဖန်ပုလင်း (၄ ထုပ်)',
    packageCount: 4,
    weightViss: 60,
    customerRatePerViss: BMK_PRICING.CUSTOMER_RATE_PER_VISS,
    totalDeliveryFee: 60 * BMK_PRICING.CUSTOMER_RATE_PER_VISS,  // 72,000 MMK
    paymentStatus: 'PAID',
    paymentCollectedAt: 'MANDALAY',
    truckExpense: 60 * BMK_PRICING.TRUCK_RATE_PER_VISS,         // 66,000 MMK
    mandalayLaborFee: 60 * BMK_PRICING.MDY_LABOR_PER_VISS,     // 1,500 MMK
    kalayLaborFee: 60 * BMK_PRICING.KALAY_LABOR_PER_VISS,        // 1,500 MMK
    baseNetProfit: 60 * BMK_PRICING.BASE_PROFIT_PER_VISS,       // 3,000 MMK
    status: 'CLAIMED_LOST',
    tripId: 'TRIP-20261021-01',
    claimId: 'CLM-001',
    createdAt: '2026-10-21T10:00:00Z',
    updatedAt: '2026-10-22T14:30:00Z',
    bookedByStaff: 'ကိုအောင်ကို (MDY Gate)',
    notes: 'လမ်းခရီးတွင် ပစ္စည်းပြုတ်ကျ ပျောက်ဆုံးသဖြင့် လျော်ကြေး ၅၀,၀၀၀ ကျပ် ပေးလျော်ခဲ့သည်'
  },
  {
    id: 'BMK-20261022-015',
    qrCode: 'BMK-20261022-015|MDY-KLY|150VISS',
    senderName: 'ဒေါ်လှနွယ် (နွယ်နွယ်ဆန်ကုန်သည်)',
    senderPhone: '09-450998877',
    senderAddress: 'မန္တလေး၊ ဒေးဝန်းစျေး၊ မဟာအောင်မြေ',
    receiverName: 'ဦးထွန်းဦး',
    receiverPhone: '09-258833112',
    receiverAddress: 'ကလေးမြို့၊ ကလေးစျေးကြီးရှေ့',
    itemType: 'စားသောက်ကုန် / စပါးဆန်',
    itemDescription: 'ပေါ်ဆန်းမွှေး ဆန်အိတ် (၃ အိတ်)',
    packageCount: 3,
    weightViss: 150,
    customerRatePerViss: BMK_PRICING.CUSTOMER_RATE_PER_VISS,
    totalDeliveryFee: 150 * BMK_PRICING.CUSTOMER_RATE_PER_VISS, // 180,000 MMK
    paymentStatus: 'PAID',
    paymentCollectedAt: 'MANDALAY',
    truckExpense: 150 * BMK_PRICING.TRUCK_RATE_PER_VISS,        // 165,000 MMK
    mandalayLaborFee: 150 * BMK_PRICING.MDY_LABOR_PER_VISS,    // 3,750 MMK
    kalayLaborFee: 150 * BMK_PRICING.KALAY_LABOR_PER_VISS,       // 3,750 MMK
    baseNetProfit: 150 * BMK_PRICING.BASE_PROFIT_PER_VISS,      // 7,500 MMK
    status: 'DELIVERED',
    tripId: 'TRIP-20261022-02',
    createdAt: '2026-10-22T08:00:00Z',
    updatedAt: '2026-10-23T06:45:00Z',
    bookedByStaff: 'မောင်ဇော် (MDY Gate)',
    notes: 'ကလေးဂိတ်မှ လူကြုံ လာရောက်ထုတ်ယူပြီးစီး'
  }
];

export const INITIAL_TRIPS: Trip[] = [
  {
    id: 'TRIP-20261023-01',
    truckNumber: '3B-4521 (Hino 12-Wheeler)',
    driverName: 'ဦးမောင်ကျော်',
    driverPhone: '09-778899001',
    departureDate: '2026-10-23',
    expectedArrivalDate: '2026-10-24',
    route: 'Mandalay -> Monywa -> Gangaw -> Kalay (မန္တလေး - မုံရွာ - ဂန့်ဂေါ - ကလေး)',
    status: 'IN_TRANSIT',
    maxCapacityViss: 8000,
    currentLoadedViss: 445, // parcels 001 (120) + 002 (85) + 003 (240)
    parcelIds: ['BMK-20261023-001', 'BMK-20261023-002', 'BMK-20261023-003'],
    totalTruckRentFee: 445 * BMK_PRICING.TRUCK_RATE_PER_VISS, // 489,500 MMK
    totalMdyLabor: 445 * BMK_PRICING.MDY_LABOR_PER_VISS,     // 11,125 MMK
    totalKalayLabor: 445 * BMK_PRICING.KALAY_LABOR_PER_VISS,   // 11,125 MMK
    notes: '၁၂ ဘီးကားကြီး မနက် ၈:၃၀ နာရီတွင် မန္တလေးမှ ထွက်ခွာခဲ့သည်'
  },
  {
    id: 'TRIP-20261022-02',
    truckNumber: '6D-9912 (Mitsubishi Fuso 12-Wheeler)',
    driverName: 'ကိုမျိုးလွင်',
    driverPhone: '09-965544332',
    departureDate: '2026-10-22',
    expectedArrivalDate: '2026-10-23',
    actualArrivalDate: '2026-10-23',
    route: 'Mandalay -> Monywa -> Gangaw -> Kalay',
    status: 'ARRIVED',
    maxCapacityViss: 8500,
    currentLoadedViss: 240, // 90 + 150
    parcelIds: ['BMK-20261022-018', 'BMK-20261022-015'],
    totalTruckRentFee: 240 * BMK_PRICING.TRUCK_RATE_PER_VISS, // 264,000 MMK
    totalMdyLabor: 240 * BMK_PRICING.MDY_LABOR_PER_VISS,     // 6,000 MMK
    totalKalayLabor: 240 * BMK_PRICING.KALAY_LABOR_PER_VISS,   // 6,000 MMK
    notes: 'ကလေးဂိတ်သို့ မနက် ၇ နာရီတွင် အောင်မြင်စွာ ဆိုက်ရောက်ခဲ့သည်'
  }
];

export const INITIAL_CLAIMS: Claim[] = [
  {
    id: 'CLM-001',
    parcelId: 'BMK-20261021-009',
    parcelCode: 'BMK-20261021-009',
    customerName: 'ဦးတင်မောင် (ရတနာပုံအိုးလုပ်ငန်း)',
    customerPhone: '09-250098765',
    incidentType: 'LOST',
    description: 'ဂန့်ဂေါနှင့်ကလေးကြား တောင်တက်လမ်းကြမ်းတွင် ကားအနောက်ခြမ်းမှ မြေအိုးထုပ် ၁ ထုပ် လျှောကျပျောက်ဆုံးသွားခဲ့ရခြင်း',
    claimedAmount: 60000,
    approvedCompensation: 50000,
    status: 'APPROVED_PAID',
    reportedDate: '2026-10-22T10:15:00Z',
    resolvedDate: '2026-10-22T14:30:00Z',
    reportedBy: 'ကိုစန်းလွင် (Kalay Gate)',
    photoUrl: ''
  }
];
