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
  Settings,
  DollarSign
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
  const totalWeightViss = parcels.reduce((sum, p) => sum + p.weightViss, 0);
  const totalRevenue = parcels.reduce((sum, p) => sum + p.totalDeliveryFee, 0);
  const totalTruckExpense = parcels.reduce((sum, p) => sum + p.truckExpense, 0);
  const totalMdyLabor = parcels.reduce((sum, p) => sum + p.mandalayLaborFee, 0);
  const totalKalayLabor = parcels.reduce((sum, p) => sum + p.kalayLaborFee, 0);
  const totalOperatingExpense = totalTruckExpense + totalMdyLabor + totalKalayLabor;
  const grossBaseProfit = parcels.reduce((sum, p) => sum + p.baseNetProfit, 0);

  const totalClaimsPaid = claims
    .filter((c) => c.status === 'APPROVED_PAID')
    .reduce((sum, c) => sum + c.approvedCompensation, 0);

  const trueNetProfit = grossBaseProfit - totalClaimsPaid;

  const isAdmin = userRole === 'ADMIN';

  const configLaborTotal = pricingConfig.mdyLaborPerViss + pricingConfig.kalayLaborPerViss;
  const configTotalExpense = pricingConfig.truckRatePerViss + configLaborTotal;
  const configBaseProfit = pricingConfig.customerRatePerViss - configTotalExpense;

  return (
    <div className="space-y-4 font-sans">
      {/* Facebook Cover / Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#1877F2] via-[#166fe5] to-sky-600 text-white shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold">
              <span>{weightUnit === 'KG' ? 'ကီလိုဂရမ် (Kg) စနစ်' : 'ပိဿာ (Viss) စနစ်'}</span>
              <span>·</span>
              <span className="font-mono">
                {formatRate(pricingConfig.customerRatePerViss, weightUnit, lang)}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              {lang === 'my' ? 'BMK ကုန်စည်ကားဂိတ် လုပ်ငန်းလည်ပတ်မှု' : 'BMK Car Gate Operations'}
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
              {lang === 'my'
                ? `မန္တလေးမှ ကလေးသို့ ၁၂ ဘီးကားကြီးများဖြင့် အမြန်ကုန်စည်ပို့ဆောင်ရေး။ ပို့ခ ${formatRate(pricingConfig.customerRatePerViss, weightUnit, lang)}၊ ကားခ ${formatRate(pricingConfig.truckRatePerViss, weightUnit, lang)} နှင့် လုပ်သားခများ ရှင်းတမ်း။`
                : `Express freight between Mandalay & Kalay. Rate: ${formatRate(pricingConfig.customerRatePerViss, weightUnit, lang)}.`}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {isAdmin && (
              <button
                onClick={onOpenPricingModal}
                className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Settings className="w-4 h-4" />
                <span>{lang === 'my' ? 'နှုန်းထားပြင်ရန်' : 'Adjust Rates'}</span>
              </button>
            )}
            <button
              onClick={onOpenBookingModal}
              className="px-5 py-2.5 rounded-lg bg-white text-[#1877F2] font-black text-xs sm:text-sm shadow-md hover:bg-sky-50 active:scale-95 transition-all cursor-pointer"
            >
              + {lang === 'my' ? 'ဘောင်ချာအသစ်ဖွင့်' : 'Book Parcel'}
            </button>
          </div>
        </div>
      </div>

      {/* RBAC Notice if viewing as Gate Staff */}
      {!isAdmin && (
        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <span className="font-bold">{lang === 'my' ? 'ဂိတ်ဝန်ထမ်း အကောင့်:' : 'Staff Mode:'}</span>{' '}
            {lang === 'my'
              ? 'လုပ်ငန်း၏ အသားတင်အမြတ် (Net Profit) ကို ဂိတ်ပိုင်ရှင် (Admin/Owner) တစ်ဦးတည်းသာ ကြည့်ရှုခွင့်ရှိပါသည်။'
              : 'Full financial net profit reports are restricted to Gate Admin.'}
          </div>
        </div>
      )}

      {/* Financial KPI Grid (Facebook Metrics Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Total Revenue */}
        <div className="p-4 rounded-xl border border-[#e4e6eb] bg-white shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#65676b]">
            <span className="font-semibold">{lang === 'my' ? 'စုစုပေါင်း ဝင်ငွေ (Revenue)' : 'Total Revenue'}</span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-[#050505]">
            {formatMMK(totalRevenue)}
          </div>
          <div className="text-xs text-[#65676b] flex items-center justify-between pt-1 border-t border-[#e4e6eb]">
            <span>{formatWeight(totalWeightViss, weightUnit, lang)}</span>
            <span className="text-[#1877F2] font-mono font-bold">
              @{formatRate(pricingConfig.customerRatePerViss, weightUnit, lang)}
            </span>
          </div>
        </div>

        {/* Metric 2: 12-Wheel Truck Expense */}
        <div className="p-4 rounded-xl border border-[#e4e6eb] bg-white shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#65676b]">
            <span className="font-semibold">{lang === 'my' ? '၁၂ ဘီး ကားငှါးခ (Truck Rental)' : '12-Wheel Truck Fee'}</span>
            <div className="w-7 h-7 rounded-full bg-sky-50 text-[#1877F2] flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-[#1877F2]">
            {formatMMK(totalTruckExpense)}
          </div>
          <div className="text-xs text-[#65676b] flex items-center justify-between pt-1 border-t border-[#e4e6eb]">
            <span>{formatWeight(totalWeightViss, weightUnit, lang)}</span>
            <span className="text-[#1877F2] font-mono">
              @{formatRate(pricingConfig.truckRatePerViss, weightUnit, lang)}
            </span>
          </div>
        </div>

        {/* Metric 3: Total Dual Gate Labor Fees */}
        <div className="p-4 rounded-xl border border-[#e4e6eb] bg-white shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#65676b]">
            <span className="font-semibold">{lang === 'my' ? 'အလုပ်သမားခ (MDY + Kalay)' : 'Dual Gate Labor'}</span>
            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-amber-600">
            {formatMMK(totalMdyLabor + totalKalayLabor)}
          </div>
          <div className="text-xs text-[#65676b] flex items-center justify-between pt-1 border-t border-[#e4e6eb]">
            <span>{pricingConfig.mdyLaborPerViss} + {pricingConfig.kalayLaborPerViss}</span>
            <span className="text-amber-600 font-mono font-bold">
              = {formatRate(configLaborTotal, weightUnit, lang)}
            </span>
          </div>
        </div>

        {/* Metric 4: True Net Profit */}
        <div className="p-4 rounded-xl border border-[#e4e6eb] bg-white shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#65676b]">
            <span className="font-semibold text-[#050505]">
              {lang === 'my' ? 'အသားတင်အမြတ် (Net Profit)' : 'True Net Profit'}
            </span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          {isAdmin ? (
            <>
              <div
                className={`text-2xl font-black font-mono tabular-nums ${
                  trueNetProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {formatMMK(trueNetProfit)}
              </div>
              <div className="text-xs text-[#65676b] flex items-center justify-between pt-1 border-t border-[#e4e6eb]">
                <span>{lang === 'my' ? 'လျော်ကြေးနုတ်ပြီး' : 'After Claims'}</span>
                {totalClaimsPaid > 0 ? (
                  <span className="text-rose-600 font-mono">-{formatMMK(totalClaimsPaid)}</span>
                ) : (
                  <span className="text-emerald-600 font-semibold">{lang === 'my' ? 'ဆုံးရှုံးမှုမရှိ' : 'Zero Loss'}</span>
                )}
              </div>
            </>
          ) : (
            <div className="py-2">
              <span className="text-xs text-[#65676b] italic">
                {lang === 'my' ? '🔒 Admin သာ ကြည့်ခွင့်ရှိသည်' : '🔒 Admin Only'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Core Unit Economics Breakdown (Facebook Insight Card) */}
      <div className="p-5 rounded-xl border border-[#e4e6eb] bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#1877F2]" />
            <h2 className="text-sm sm:text-base font-bold text-[#050505]">
              {lang === 'my'
                ? `ငွေကြေးခွဲဝေမှု ပုံသေနည်း (၁ ပိဿာ / ၁ Kg နှုန်းထားများ)`
                : `BMK Unit Economics (${weightUnit === 'KG' ? 'Per Kg' : 'Per Viss'})`}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#1877F2] bg-[#e7f3ff] px-2.5 py-1 rounded-full font-bold">
              အခြေခံအမြတ်: {formatRate(configBaseProfit, weightUnit, lang)}
            </span>
          </div>
        </div>

        {/* Visual Waterfall Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-1">
          {/* Revenue */}
          <div className="p-3 rounded-xl border border-[#e4e6eb] bg-[#f0f2f5]">
            <span className="text-[11px] text-[#65676b] block">{lang === 'my' ? '၁။ ကောက်ခံခ' : '1. Customer Fee'}</span>
            <div className="text-base font-bold font-mono text-emerald-600 mt-1">
              {formatRate(pricingConfig.customerRatePerViss, weightUnit, lang)}
            </div>
            <span className="text-[10px] text-[#65676b] font-mono">
              ~ {formatNumber(rateVissToKg(pricingConfig.customerRatePerViss), 1)} ကျပ်/Kg
            </span>
          </div>

          {/* Truck Rental */}
          <div className="p-3 rounded-xl border border-[#e4e6eb] bg-[#f0f2f5]">
            <span className="text-[11px] text-[#65676b] block">{lang === 'my' ? '၂။ ၁၂ ဘီးကားခ' : '2. 12-Wheeler'}</span>
            <div className="text-base font-bold font-mono text-[#1877F2] mt-1">
              -{formatRate(pricingConfig.truckRatePerViss, weightUnit, lang)}
            </div>
            <span className="text-[10px] text-[#65676b] font-mono">
              ~ {formatNumber(rateVissToKg(pricingConfig.truckRatePerViss), 1)} ကျပ်/Kg
            </span>
          </div>

          {/* MDY Labor */}
          <div className="p-3 rounded-xl border border-[#e4e6eb] bg-[#f0f2f5]">
            <span className="text-[11px] text-[#65676b] block">{lang === 'my' ? '၃။ မန္တလေးကားတင်ခ' : '3. MDY Labor'}</span>
            <div className="text-base font-bold font-mono text-amber-600 mt-1">
              -{formatRate(pricingConfig.mdyLaborPerViss, weightUnit, lang)}
            </div>
            <span className="text-[10px] text-[#65676b]">တင်ခ အလုပ်သမား</span>
          </div>

          {/* Kalay Labor */}
          <div className="p-3 rounded-xl border border-[#e4e6eb] bg-[#f0f2f5]">
            <span className="text-[11px] text-[#65676b] block">{lang === 'my' ? '၄။ ကလေးကားချခ' : '4. Kalay Labor'}</span>
            <div className="text-base font-bold font-mono text-amber-600 mt-1">
              -{formatRate(pricingConfig.kalayLaborPerViss, weightUnit, lang)}
            </div>
            <span className="text-[10px] text-[#65676b]">ချခ အလုပ်သမား</span>
          </div>

          {/* Net Profit Margin */}
          <div className="p-3 rounded-xl border border-[#1877F2]/30 bg-[#e7f3ff]">
            <span className="text-[11px] text-[#1877F2] block font-bold">{lang === 'my' ? '၅။ အသားတင်အမြတ်' : '5. Profit'}</span>
            <div className="text-base font-black font-mono text-[#1877F2] mt-1">
              +{formatRate(configBaseProfit, weightUnit, lang)}
            </div>
            <span className="text-[10px] text-[#1877F2]">
              ~ {formatNumber(rateVissToKg(configBaseProfit), 1)} ကျပ်/Kg
            </span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#f0f2f5] border border-[#e4e6eb] text-xs text-[#65676b] flex items-center justify-between flex-wrap gap-2">
          <span>
            💡 <strong>အလေးချိန်တွက်ချက်မှု စံနှုန်း:</strong>{' '}
            ၁ ပိဿာ = ၁.၆၃၂၉၃ ကီလိုဂရမ် (Kg) ဖြစ်ပြီး၊ ၁ ကီလိုဂရမ် = ၀.၆၁၂၄ ပိဿာ ဖြစ်ပါသည်။
          </span>
          <button
            onClick={() => onNavigateTab('claims')}
            className="text-[#1877F2] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>{lang === 'my' ? 'လျော်ကြေးစာရင်း ကြည့်မည်' : 'View Claims'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
