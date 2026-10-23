import React, { useState } from 'react';
import { GatePricingConfig, DEFAULT_GATE_PRICING, VISS_TO_KG_RATIO } from '../types/bmk';
import { formatMMK, formatNumber, rateVissToKg } from '../utils/formatters';
import { X, Check, Settings, Scale, RefreshCw, AlertCircle } from 'lucide-react';

interface AdminPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pricingConfig: GatePricingConfig;
  onSavePricingConfig: (newConfig: GatePricingConfig) => void;
  lang: 'my' | 'en';
}

export const AdminPricingModal: React.FC<AdminPricingModalProps> = ({
  isOpen,
  onClose,
  pricingConfig,
  onSavePricingConfig,
  lang,
}) => {
  if (!isOpen) return null;

  const [customerRate, setCustomerRate] = useState(pricingConfig.customerRatePerViss.toString());
  const [truckRate, setTruckRate] = useState(pricingConfig.truckRatePerViss.toString());
  const [mdyLabor, setMdyLabor] = useState(pricingConfig.mdyLaborPerViss.toString());
  const [kalayLabor, setKalayLabor] = useState(pricingConfig.kalayLaborPerViss.toString());
  const [bulkyRate, setBulkyRate] = useState(pricingConfig.defaultBulkyRate.toString());

  const cRate = parseFloat(customerRate) || 0;
  const tRate = parseFloat(truckRate) || 0;
  const mLabor = parseFloat(mdyLabor) || 0;
  const kLabor = parseFloat(kalayLabor) || 0;
  const totalLabor = mLabor + kLabor;
  const totalOperatingCost = tRate + totalLabor;
  const baseProfit = cRate - totalOperatingCost;

  // Kg rates
  const customerRateKg = rateVissToKg(cRate);
  const truckRateKg = rateVissToKg(tRate);
  const laborRateKg = rateVissToKg(totalLabor);
  const baseProfitKg = rateVissToKg(baseProfit);

  const handleResetDefaults = () => {
    setCustomerRate(DEFAULT_GATE_PRICING.customerRatePerViss.toString());
    setTruckRate(DEFAULT_GATE_PRICING.truckRatePerViss.toString());
    setMdyLabor(DEFAULT_GATE_PRICING.mdyLaborPerViss.toString());
    setKalayLabor(DEFAULT_GATE_PRICING.kalayLaborPerViss.toString());
    setBulkyRate(DEFAULT_GATE_PRICING.defaultBulkyRate.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePricingConfig({
      customerRatePerViss: cRate,
      truckRatePerViss: tRate,
      mdyLaborPerViss: mLabor,
      kalayLaborPerViss: kLabor,
      defaultBulkyRate: parseFloat(bulkyRate) || 1600,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {lang === 'my'
                  ? 'ဂိတ်နှုန်းထားနှင့် ကုန်ကျစရိတ်များ စိတ်ကြိုက်သတ်မှတ်ခြင်း'
                  : 'Gate Rates & Pricing Configuration'}
              </h2>
              <span className="text-xs text-amber-400">
                {lang === 'my' ? 'Admin သာ ပြင်ဆင်ခွင့်ရှိသည် (စိတ်ကြိုက် ပိဿာ / Kg နှုန်းထားများ)' : 'Admin Only Pricing Panel'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Real-time Margin Preview Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-400 flex items-center gap-1">
                <Scale className="w-4 h-4" />
                <span>{lang === 'my' ? 'တွက်ချက်ရရှိမည့် အခြေခံအမြတ် (Base Net Margin):' : 'Calculated Base Profit:'}</span>
              </span>
              <span
                className={`font-mono font-extrabold text-sm ${
                  baseProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {baseProfit >= 0 ? `+${formatMMK(baseProfit)}` : `-${formatMMK(Math.abs(baseProfit))}`} / ပိဿာ
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-850">
              <span>Kg နှုန်းပြောင်းလဲချက် (~ ၁ ပိဿာ = ၁.၆၃၃ Kg):</span>
              <span className="font-mono text-slate-300 font-bold">
                {formatNumber(baseProfitKg, 1)} MMK / Kg
              </span>
            </div>

            <div className="text-[11px] text-slate-400 pt-1">
              ပုံသေနည်း: {cRate} (ဝင်ငွေ) - [{tRate} (ကားခ) + {mLabor} (မန္တလေး) + {kLabor} (ကလေး)] = {baseProfit} ကျပ်/ပိဿာ
            </div>
          </div>

          {/* Rate 1: Customer Rate */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-200">
                ၁။ ကာစတန်မာ ပို့ဆောင်ခ နှုန်းထား (Customer Rate) *
              </label>
              <span className="font-mono text-emerald-400 font-bold">
                ~ {formatNumber(customerRateKg, 1)} MMK/Kg
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                required
                min="0"
                step="50"
                value={customerRate}
                onChange={(e) => setCustomerRate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold text-sm focus:border-amber-400 focus:outline-none"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400">ကျပ် / ပိဿာ</span>
            </div>
            <span className="text-[11px] text-slate-400 block">
              ပုံမှန်စံနှုန်း: ၁,၂၀၀ ကျပ်/ပိဿာ (၁ ကီလိုလျှင် ၇၃၄.၉ ကျပ်)
            </span>
          </div>

          {/* Rate 2: Truck Rental Fee */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-200">
                ၂။ ၁၂ ဘီး ကားငှါးခ (12-Wheel Truck Charter Rate) *
              </label>
              <span className="font-mono text-sky-400 font-bold">
                ~ {formatNumber(truckRateKg, 1)} MMK/Kg
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                required
                min="0"
                step="50"
                value={truckRate}
                onChange={(e) => setTruckRate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold text-sm focus:border-amber-400 focus:outline-none"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400">ကျပ် / ပိဿာ</span>
            </div>
            <span className="text-[11px] text-slate-400 block">
              ပုံမှန်စံနှုန်း: ၁,၁၀၀ ကျပ်/ပိဿာ (၁ ကီလိုလျှင် ၆၇၃.၆ ကျပ်)
            </span>
          </div>

          {/* Rate 3 & 4: Labor Fees (Mandalay & Kalay) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Mandalay Loading Labor */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <label className="font-bold text-slate-200 block">
                ၃။ မန္တလေး ကားတင်ခ အလုပ်သမားခ *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="0"
                  step="5"
                  value={mdyLabor}
                  onChange={(e) => setMdyLabor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                />
                <span className="absolute right-2.5 top-2.5 text-[11px] text-slate-400">ကျပ်/ပိဿာ</span>
              </div>
              <span className="text-[10px] text-slate-400 block">
                မူလစံနှုန်း: ၂၅ ကျပ်/ပိဿာ
              </span>
            </div>

            {/* Kalay Unloading Labor */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <label className="font-bold text-slate-200 block">
                ၄။ ကလေး ကားချခ အလုပ်သမားခ *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="0"
                  step="5"
                  value={kalayLabor}
                  onChange={(e) => setKalayLabor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                />
                <span className="absolute right-2.5 top-2.5 text-[11px] text-slate-400">ကျပ်/ပိဿာ</span>
              </div>
              <span className="text-[10px] text-slate-400 block">
                မူလစံနှုန်း: ၂၅ ကျပ်/ပိဿာ
              </span>
            </div>
          </div>

          {/* Rate 5: Default Bulky Goods Rate (ကုန်ပွစျေး) */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <label className="font-bold text-purple-300 block">
              ၅။ ကုန်ပွ စံနှုန်းထား (Default Bulky Rate)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="100"
                value={bulkyRate}
                onChange={(e) => setBulkyRate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-purple-400 focus:outline-none"
              />
              <span className="absolute right-3 top-2.5 text-xs text-purple-400">ကျပ် / ပိဿာ</span>
            </div>
            <span className="text-[11px] text-slate-400 block">
              ထုထည်ကြီးပြီး ပေါ့သော ပစ္စည်းများအတွက် မူလစတင်နှုန်း: ၁,၆၀၀ ကျပ်
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>မူလစံနှုန်းများသို့ ပြန်ထားမည် (Reset)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                {lang === 'my' ? 'ပယ်ဖျက်မည်' : 'Cancel'}
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold flex items-center gap-1.5 shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>{lang === 'my' ? 'နှုန်းထားသစ် အတည်ပြုသိမ်းဆည်းမည်' : 'Save Pricing Rates'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
