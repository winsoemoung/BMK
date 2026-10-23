import React from 'react';
import { Parcel, Trip, Claim, UserRole, GatePricingConfig, WeightUnit } from '../types/bmk';
import { formatMMK, formatNumber, formatWeight, formatRate, rateVissToKg, vissToKg } from '../utils/formatters';
import { 
  TrendingUp, 
  Truck, 
  Users, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  Receipt,
  Scale,
  Settings
} from 'lucide-react';

interface FinancialDashboardProps {
  parcels: Parcel[];
  trips: Trip[];
  claims: Claim[];
  userRole: UserRole;
  pricingConfig: GatePricingConfig;
  weightUnit: WeightUnit;
  lang: 'my' | 'en';
  onNavigateTab: (tab: 'dashboard' | 'parcels' | 'trips' | 'claims' | 'android-studio') => void;
  onOpenBookingModal: () => void;
  onOpenPricingModal: () => void;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  parcels,
  trips,
  claims,
  userRole,
  pricingConfig,
  weightUnit,
  lang,
  onNavigateTab,
  onOpenBookingModal,
  onOpenPricingModal,
}) => {
  // Aggregate financial metrics using parcel's actual calculations
  const totalWeightViss = parcels.reduce((sum, p) => sum + p.weightViss, 0);
  const totalRevenue = parcels.reduce((sum, p) => sum + p.totalDeliveryFee, 0);
  const totalTruckExpense = parcels.reduce((sum, p) => sum + p.truckExpense, 0);
  const totalMdyLabor = parcels.reduce((sum, p) => sum + p.mandalayLaborFee, 0);
  const totalKalayLabor = parcels.reduce((sum, p) => sum + p.kalayLaborFee, 0);
  const totalOperatingExpense = totalTruckExpense + totalMdyLabor + totalKalayLabor;
  const grossBaseProfit = parcels.reduce((sum, p) => sum + p.baseNetProfit, 0);

  // Compensation claims paid
  const totalClaimsPaid = claims
    .filter((c) => c.status === 'APPROVED_PAID')
    .reduce((sum, c) => sum + c.approvedCompensation, 0);

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

  const isAdmin = userRole === 'ADMIN';

  // Current Config Unit Margins
  const configLaborTotal = pricingConfig.mdyLaborPerViss + pricingConfig.kalayLaborPerViss;
  const configBaseProfit = pricingConfig.customerRatePerViss - (pricingConfig.truckRatePerViss + configLaborTotal);

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
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider flex-wrap">
              <span>{lang === 'my' ? 'မန္တလေး ⇄ ကလေး ကုန်စည်ပို့ဆောင်ရေးစနစ်' : 'Mandalay ⇄ Kalay Express Freight'}</span>
              <span>·</span>
              <span>
                {weightUnit === 'KG' ? 'ကီလိုဂရမ် (Kg) စနစ်ဖွင့်ထားသည်' : 'ပိဿာ (Viss) စနစ်'}
              </span>
              <span>·</span>
              <span className="font-mono">
                {formatRate(pricingConfig.customerRatePerViss, weightUnit, lang)}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {lang === 'my' ? 'BMK ကုန်စည်ကားဂိတ် လုပ်ငန်းလည်ပတ်မှု' : 'BMK Delivery Car Gate Operations'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {lang === 'my'
                ? `မန္တလေးမှ ကလေးသို့ ၁၂ ဘီးကားကြီးများဖြင့် ပို့ဆောင်ခြင်း။ ပို့ဆောင်ခ ${formatRate(pricingConfig.customerRatePerViss, weightUnit, lang)}၊ ကားခ ${formatRate(pricingConfig.truckRatePerViss, weightUnit, lang)} နှင့် အလုပ်သမားခများ ရှင်းတမ်းထုတ်ပေးသည့် စနစ်။`
                : `Express freight between Mandalay & Kalay. Current rate: ${formatRate(pricingConfig.customerRatePerViss, weightUnit, lang)}, truck charter: ${formatRate(pricingConfig.truckRatePerViss, weightUnit, lang)}.`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {isAdmin && (
              <button
                onClick={onOpenPricingModal}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Settings className="w-4 h-4" />
                <span>{lang === 'my' ? 'ဂိတ်နှုန်းထားများ ပြင်မည်' : 'Adjust Rates'}</span>
              </button>
            )}
            <button
              onClick={onOpenBookingModal}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-400/20 active:scale-95 transition-all text-center"
            >
              {lang === 'my' ? '+ ကုန်ပစ္စည်းအသစ် လက်ခံရန်' : '+ Book New Parcel'}
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
              ? 'လုပ်ငန်း၏ အသားတင်အမြတ် (Net Profit) နှင့် ဘဏ္ဍာရေးအစီရင်ခံစာ အပြည့်အစုံကို ဂိတ်ပိုင်ရှင် (Admin/Owner) တစ်ဦးတည်းသာ ကြည့်ရှုခွင့်ရှိပါသည်။'
              : 'Full financial net profit reports and ledger books are restricted strictly to Gate Admin (Owner).'}
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
            <span>{formatWeight(totalWeightViss, weightUnit, lang)}</span>
            <span className="text-emerald-400 font-mono">
              @{formatRate(pricingConfig.customerRatePerViss, weightUnit, lang)}
            </span>
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
            <span>{formatWeight(totalWeightViss, weightUnit, lang)}</span>
            <span className="text-sky-400 font-mono">
              @{formatRate(pricingConfig.truckRatePerViss, weightUnit, lang)}
            </span>
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
            <span>
              {pricingConfig.mdyLaborPerViss} + {pricingConfig.kalayLaborPerViss}
            </span>
            <span className="text-amber-400 font-mono">
              = {formatRate(configLaborTotal, weightUnit, lang)}
            </span>
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

      {/* Core Unit Economics Breakdown with Viss & Kg Equivalents */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              {lang === 'my'
                ? `ငွေကြေးခွဲဝေမှု ပုံသေနည်း (၁ ပိဿာ / ၁ Kg နှုန်းထားများ)`
                : `BMK Unit Economics (${weightUnit === 'KG' ? 'Per Kg' : 'Per Viss'})`}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              အခြေခံအမြတ်: {formatRate(configBaseProfit, weightUnit, lang)}
            </span>
            {isAdmin && (
              <button
                onClick={onOpenPricingModal}
                className="text-xs text-slate-400 hover:text-amber-400 underline font-medium"
              >
                {lang === 'my' ? 'နှုန်းထားပြင်ရန်' : 'Edit'}
              </button>
            )}
          </div>
        </div>

        {/* Visual Waterfall Strip */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {/* Revenue */}
          <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <span className="text-xs text-slate-400 block">{lang === 'my' ? '၁။ လူကြီးမင်းထံမှကောက်ခံခ' : '1. Customer Fee'}</span>
            <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-1">
              {formatRate(pricingConfig.customerRatePerViss, weightUnit, lang)}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {weightUnit === 'VISS'
                ? `~ ${formatNumber(rateVissToKg(pricingConfig.customerRatePerViss), 1)} ကျပ်/Kg`
                : `${pricingConfig.customerRatePerViss} ကျပ်/ပိဿာ`}
            </span>
          </div>

          {/* Truck Rental */}
          <div className="p-3.5 rounded-xl border border-sky-500/20 bg-sky-500/5">
            <span className="text-xs text-slate-400 block">{lang === 'my' ? '၂။ ၁၂ ဘီးကားငှါးခ' : '2. 12-Wheel Truck'}</span>
            <div className="text-lg sm:text-xl font-bold font-mono text-sky-400 mt-1">
              -{formatRate(pricingConfig.truckRatePerViss, weightUnit, lang)}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {weightUnit === 'VISS'
                ? `~ ${formatNumber(rateVissToKg(pricingConfig.truckRatePerViss), 1)} ကျပ်/Kg`
                : `${pricingConfig.truckRatePerViss} ကျပ်/ပိဿာ`}
            </span>
          </div>

          {/* MDY Labor */}
          <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <span className="text-xs text-slate-400 block">{lang === 'my' ? '၃။ မန္တလေးကားတင်ခ' : '3. Mandalay Labor'}</span>
            <div className="text-lg sm:text-xl font-bold font-mono text-amber-400 mt-1">
              -{formatRate(pricingConfig.mdyLaborPerViss, weightUnit, lang)}
            </div>
            <span className="text-[11px] text-slate-400">တင်ခ အလုပ်သမား</span>
          </div>

          {/* Kalay Labor */}
          <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <span className="text-xs text-slate-400 block">{lang === 'my' ? '၄။ ကလေးကားချခ' : '4. Kalay Labor'}</span>
            <div className="text-lg sm:text-xl font-bold font-mono text-amber-400 mt-1">
              -{formatRate(pricingConfig.kalayLaborPerViss, weightUnit, lang)}
            </div>
            <span className="text-[11px] text-slate-400">ချခ အလုပ်သမား</span>
          </div>

          {/* Net Profit Margin */}
          <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/10">
            <span className="text-xs text-purple-300 block font-semibold">{lang === 'my' ? '၅။ BMK အသားတင်အမြတ်' : '5. Base Profit Margin'}</span>
            <div className="text-lg sm:text-xl font-extrabold font-mono text-purple-300 mt-1">
              +{formatRate(configBaseProfit, weightUnit, lang)}
            </div>
            <span className="text-[11px] text-purple-400">
              {weightUnit === 'VISS'
                ? `~ ${formatNumber(rateVissToKg(configBaseProfit), 1)} ကျပ်/Kg`
                : `${configBaseProfit} ကျပ်/ပိဿာ`}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between flex-wrap gap-2">
          <span>
            💡 <strong className="text-white">အလေးချိန်တွက်ချက်မှု စံနှုန်း:</strong>{' '}
            ၁ ပိဿာ = ၁.၆၃၂၉၃ ကီလိုဂရမ် (Kg) ဖြစ်ပြီး၊ ၁ ကီလိုဂရမ် = ၀.၆၁၂၄ ပိဿာ ဖြစ်ပါသည်။
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
    </div>
  );
};
