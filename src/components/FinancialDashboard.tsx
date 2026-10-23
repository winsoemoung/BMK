import React from 'react';
import { Parcel, Trip, Claim, UserRole, BMK_PRICING, GateFinancialSummary } from '../types/bmk';
import { formatMMK, formatNumber } from '../utils/formatters';
import { 
  TrendingUp, 
  Truck, 
  Users, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  Receipt,
  Scale
} from 'lucide-react';

interface FinancialDashboardProps {
  parcels: Parcel[];
  trips: Trip[];
  claims: Claim[];
  userRole: UserRole;
  lang: 'my' | 'en';
  onNavigateTab: (tab: 'dashboard' | 'parcels' | 'trips' | 'claims' | 'android-studio') => void;
  onOpenBookingModal: () => void;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  parcels,
  trips,
  claims,
  userRole,
  lang,
  onNavigateTab,
  onOpenBookingModal,
}) => {
  // Aggregate financial metrics
  const totalWeightViss = parcels.reduce((sum, p) => sum + p.weightViss, 0);
  const totalRevenue = totalWeightViss * BMK_PRICING.CUSTOMER_RATE_PER_VISS;
  const totalTruckExpense = totalWeightViss * BMK_PRICING.TRUCK_RATE_PER_VISS;
  const totalMdyLabor = totalWeightViss * BMK_PRICING.MDY_LABOR_PER_VISS;
  const totalKalayLabor = totalWeightViss * BMK_PRICING.KALAY_LABOR_PER_VISS;
  const totalOperatingExpense = totalTruckExpense + totalMdyLabor + totalKalayLabor;
  const grossBaseProfit = totalWeightViss * BMK_PRICING.BASE_PROFIT_PER_VISS;

  // Compensation claims paid
  const totalClaimsPaid = claims
    .filter((c) => c.status === 'APPROVED_PAID')
    .reduce((sum, c) => sum + c.approvedCompensation, 0);

  const pendingClaimsAmount = claims
    .filter((c) => c.status === 'PENDING')
    .reduce((sum, c) => sum + c.claimedAmount, 0);

  // True Net Profit (Base profit minus loss compensations)
  const trueNetProfit = grossBaseProfit - totalClaimsPaid;

  // Payment statuses
  const paidRevenue = parcels
    .filter((p) => p.paymentStatus === 'PAID')
    .reduce((sum, p) => sum + p.totalDeliveryFee, 0);
  const codRevenue = parcels
    .filter((p) => p.paymentStatus === 'COD')
    .reduce((sum, p) => sum + p.totalDeliveryFee, 0);
  const unpaidRevenue = parcels
    .filter((p) => p.paymentStatus === 'UNPAID')
    .reduce((sum, p) => sum + p.totalDeliveryFee, 0);

  // If role is Gate Staff (Mandalay or Kalay), RBAC restricts full P&L according to user prompt:
  // "Restrict financial reports and profit views strictly to Admin."
  const isAdmin = userRole === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Top Banner with Commercial 12-Wheel Truck Route Photo */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/bmk_truck_highway_1792773077830.jpg"
            alt="Mandalay to Kalay Highway Freight"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25 filter brightness-75 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
        </div>

        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <span>{lang === 'my' ? 'မန္တလေး ⇄ ကလေး ကုန်စည်ပို့ဆောင်ရေးစနစ်' : 'Mandalay ⇄ Kalay Express Freight'}</span>
              <span>·</span>
              <span>{lang === 'my' ? '၁၂ ဘီးကားကြီးများဖြင့် တိုက်ရိုက်' : '12-Wheel Heavy Cargo Fleet'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {lang === 'my' ? 'BMK ကုန်စည်ကားဂိတ် လုပ်ငန်းလည်ပတ်မှု' : 'BMK Delivery Car Gate Operations'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {lang === 'my'
                ? 'မန္တလေးဂိတ်မှ ကလေးမြို့သို့ ၁၂ ဘီးကားကြီးများဖြင့် ကုန်စည်များ ပို့ဆောင်ခြင်း၊ တစ်ပိသာ ၁,၂၀၀ ကျပ်နှုန်းထား၊ ကားငှါးခ ၁,၁၀၀ ကျပ်နှင့် အလုပ်သမားစရိတ် ၅၀ ကျပ် နုတ်ယူပြီး အသားတင်အမြတ် တွက်ချက်သည့် စနစ်။'
                : 'Direct express transport from Mandalay Gate to Kalay with standard rate of 1,200 MMK/viss, 1,100 MMK truck charter, 50 MMK dual-gate labor, and automatic road compensation loss deduction.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={onOpenBookingModal}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-400/20 active:scale-95 transition-all text-center"
            >
              {lang === 'my' ? '+ ကုန်ပစ္စည်းအသစ် လက်ခံရန်' : '+ Book New Parcel'}
            </button>
            <button
              onClick={() => onNavigateTab('android-studio')}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-emerald-400 font-semibold text-sm border border-emerald-500/30 transition-all text-center"
            >
              {lang === 'my' ? 'Android Studio Code ကြည့်မည်' : 'View Android Code'}
            </button>
          </div>
        </div>
      </div>

      {/* RBAC Notice if viewing as Gate Staff */}
      {!isAdmin && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200">
            <span className="font-semibold">{lang === 'my' ? 'ဂိတ်ဝန်ထမ်း အကောင့်:' : 'Staff Mode Active:'}</span>{' '}
            {lang === 'my'
              ? 'လုပ်ငန်း၏ အသားတင်အမြတ် (Net Profit) နှင့် ဘဏ္ဍာရေးအစီရင်ခံစာ အပြည့်အစုံကို ဂိတ်ပိုင်ရှင် (Admin/Owner) တစ်ဦးတည်းသာ ကြည့်ရှုခွင့်ရှိပါသည်။ (အထက် sub-bar တွင် Admin သို့ ပြောင်းလဲ စမ်းသပ်နိုင်ပါသည်)'
              : 'Full financial net profit reports and ledger books are restricted strictly to Gate Admin (Owner). You can switch roles to Admin using the top bar to inspect all profit models.'}
          </div>
        </div>
      )}

      {/* Financial KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Revenue */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{lang === 'my' ? 'စုစုပေါင်း ဝင်ငွေ (Revenue)' : 'Total Revenue'}</span>
            <Receipt className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {formatMMK(totalRevenue)}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span>{formatNumber(totalWeightViss)} ပိသာ</span>
            <span className="text-emerald-400">@ 1,200 MMK/viss</span>
          </div>
        </div>

        {/* Metric 2: 12-Wheel Truck Expense */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{lang === 'my' ? '၁၂ ဘီး ကားငှါးခ (Truck Rental)' : '12-Wheel Truck Fee'}</span>
            <Truck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-sky-400">
            {formatMMK(totalTruckExpense)}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span>{formatNumber(totalWeightViss)} ပိသာ</span>
            <span className="text-sky-400">@ 1,100 MMK/viss</span>
          </div>
        </div>

        {/* Metric 3: Total Dual Gate Labor Fees */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{lang === 'my' ? 'အလုပ်သမားစရိတ် (MDY + Kalay)' : 'Dual Gate Labor Fees'}</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-400">
            {formatMMK(totalMdyLabor + totalKalayLabor)}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span>မန္တလေး 25 + ကလေး 25</span>
            <span className="text-amber-400">= 50 MMK/viss</span>
          </div>
        </div>

        {/* Metric 4: True Net Profit (After Claims Loss Deduction) */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-white">
              {lang === 'my' ? 'အသားတင်အမြတ် (True Net Profit)' : 'True Net Profit'}
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          {isAdmin ? (
            <>
              <div
                className={`text-2xl font-extrabold font-mono tabular-nums ${
                  trueNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatMMK(trueNetProfit)}
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span>{lang === 'my' ? 'လျော်ကြေးနုတ်ပြီး' : 'After Loss Claims'}</span>
                {totalClaimsPaid > 0 ? (
                  <span className="text-rose-400 font-mono">-{formatMMK(totalClaimsPaid)}</span>
                ) : (
                  <span className="text-emerald-400">{lang === 'my' ? 'ဆုံးရှုံးမှုမရှိ' : 'Zero Loss'}</span>
                )}
              </div>
            </>
          ) : (
            <div className="py-2">
              <span className="text-xs text-slate-500 italic">
                {lang === 'my' ? '🔒 Admin သာ ကြည့်ခွင့်ရှိသည်' : '🔒 Restricted to Admin'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Core Unit Economics Breakdown (The 1 viss formula requested) */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              {lang === 'my' ? 'ကုန်စည် ၁ ပိသာလျှင် ငွေကြေးခွဲဝေမှု ပုံသေနည်း (Unit Economics per Viss)' : 'BMK Unit Economics (Per Viss)'}
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {lang === 'my' ? 'အခြေခံအမြတ်: ၅၀ ကျပ်/ပိသာ' : 'Base Profit: 50 MMK/viss'}
          </span>
        </div>

        {/* Visual Waterfall Strip */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {/* Revenue */}
          <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <span className="text-xs text-slate-400 block">{lang === 'my' ? '၁။ လူကြီးမင်းထံမှကောက်ခံခ' : '1. Customer Fee'}</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">1,200 MMK</div>
            <span className="text-xs text-slate-400">{lang === 'my' ? 'တစ်ပိသာ ဝင်ငွေ' : 'Revenue / viss'}</span>
          </div>

          {/* Truck Rental */}
          <div className="p-3.5 rounded-xl border border-sky-500/20 bg-sky-500/5">
            <span className="text-xs text-slate-400 block">{lang === 'my' ? '၂။ ၁၂ ဘီးကားငှါးခ' : '2. 12-Wheel Truck'}</span>
            <div className="text-xl font-bold font-mono text-sky-400 mt-1">-1,100 MMK</div>
            <span className="text-xs text-slate-400">{lang === 'my' ? 'ကားခပေးချေမှု' : 'Truck cost / viss'}</span>
          </div>

          {/* MDY Labor */}
          <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <span className="text-xs text-slate-400 block">{lang === 'my' ? '၃။ မန္တလေးကားတင်ခ' : '3. Mandalay Labor'}</span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">-25 MMK</div>
            <span className="text-xs text-slate-400">{lang === 'my' ? 'တင်ခ အလုပ်သမား' : 'Loading labor'}</span>
          </div>

          {/* Kalay Labor */}
          <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <span className="text-xs text-slate-400 block">{lang === 'my' ? '၄။ ကလေးကားချခ' : '4. Kalay Labor'}</span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">-25 MMK</div>
            <span className="text-xs text-slate-400">{lang === 'my' ? 'ချခ အလုပ်သမား' : 'Unloading labor'}</span>
          </div>

          {/* Net Profit Margin */}
          <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/10">
            <span className="text-xs text-purple-300 block font-semibold">{lang === 'my' ? '၅။ BMK အသားတင်အမြတ်' : '5. Base Profit Margin'}</span>
            <div className="text-xl font-extrabold font-mono text-purple-300 mt-1">+50 MMK</div>
            <span className="text-xs text-purple-400">{lang === 'my' ? 'ကျန်ငွေ (အလျော်မပါသေး)' : 'Before loss claims'}</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between flex-wrap gap-2">
          <span>
            💡 <strong className="text-white">အလျော်ပေးရသည့် အခြေအနေ (Claims & Loss Risk):</strong>{' '}
            {lang === 'my'
              ? 'လမ်းခရီးတွင် ပစ္စည်း ပျောက်ဆုံး/ပျက်စီးပါက အဆိုပါ အလျော်ငွေ (Compensation) ကို စုစုပေါင်း အသားတင်အမြတ်ငွေ (Net Profit) ထဲမှ တိုက်ရိုက် နုတ်ယူ ရှင်းတမ်းထုတ်ပါသည်။'
              : 'Any road damage or lost cargo claims are directly deducted from the total gate net profit.'}
          </span>
          <button
            onClick={() => onNavigateTab('claims')}
            className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
          >
            <span>{lang === 'my' ? 'လျော်ကြေးစာရင်း ကြည့်မည်' : 'View Claims Ledger'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Two Column Layout: Payment Status & 12-Wheel Truck Trips Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Collection Status */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">
              {lang === 'my' ? 'ငွေပေးချေမှု အခြေအနေ (Payment Status)' : 'Payment Collection Status'}
            </h3>
            <span className="text-xs text-slate-400">{parcels.length} Parcels</span>
          </div>

          <div className="space-y-3">
            {/* Paid */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-sm font-semibold text-white block">
                    {lang === 'my' ? 'မန္တလေးတွင် ငွေရှင်းပြီး (Paid)' : 'Paid at Mandalay Gate'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {parcels.filter((p) => p.paymentStatus === 'PAID').length} ပစ္စည်း
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold font-mono text-emerald-400">{formatMMK(paidRevenue)}</div>
                <span className="text-xs text-slate-500">
                  {totalRevenue > 0 ? ((paidRevenue / totalRevenue) * 100).toFixed(0) : 0}% of revenue
                </span>
              </div>
            </div>

            {/* COD */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="text-sm font-semibold text-white block">
                    {lang === 'my' ? 'ကလေးရောက်မှ ငွေချေမည် (COD)' : 'Cash on Delivery (Kalay Gate)'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {parcels.filter((p) => p.paymentStatus === 'COD').length} ပစ္စည်း
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold font-mono text-amber-400">{formatMMK(codRevenue)}</div>
                <span className="text-xs text-slate-500">{lang === 'my' ? 'ကလေးတွင်ကောက်ရန်' : 'Collect at Kalay'}</span>
              </div>
            </div>

            {/* Unpaid */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <div>
                  <span className="text-sm font-semibold text-white block">
                    {lang === 'my' ? 'မရှင်းရသေး (Unpaid / Pending)' : 'Pending Payment'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {parcels.filter((p) => p.paymentStatus === 'UNPAID').length} ပစ္စည်း
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold font-mono text-rose-400">{formatMMK(unpaidRevenue)}</div>
                <span className="text-xs text-slate-500">{lang === 'my' ? 'ကြွေးကျန်' : 'Outstanding'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 12-Wheel Truck Trips Quick Summary */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">
              {lang === 'my' ? '၁၂ ဘီး ကားကြီး ခရီးစဉ်များ (Active Trucks)' : '12-Wheel Truck Active Trips'}
            </h3>
            <button
              onClick={() => onNavigateTab('trips')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              <span>{lang === 'my' ? 'အားလုံးကြည့်မည်' : 'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {trips.map((trip) => {
              const capacityPct = Math.min(100, Math.round((trip.currentLoadedViss / trip.maxCapacityViss) * 100));
              return (
                <div key={trip.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-100 text-sm">{trip.truckNumber}</span>
                      <span className="text-xs text-slate-400 block">
                        {trip.driverName} ({trip.driverPhone})
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        trip.status === 'IN_TRANSIT'
                          ? 'bg-amber-500/20 text-amber-300'
                          : trip.status === 'ARRIVED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {trip.status === 'IN_TRANSIT'
                        ? 'လမ်းခရီးတွင်'
                        : trip.status === 'ARRIVED'
                        ? 'ကလေးရောက်ရှိ'
                        : trip.status}
                    </span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{formatNumber(trip.currentLoadedViss)} / {formatNumber(trip.maxCapacityViss)} ပိသာ</span>
                      <span>{capacityPct}% capacity</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${capacityPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>ကားငှါးခ (1100/ပိသာ): {formatMMK(trip.totalTruckRentFee)}</span>
                    <span className="text-slate-300">{trip.parcelIds.length} parcels</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
