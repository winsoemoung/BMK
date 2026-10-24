import React from 'react';
import { Parcel, Trip, GatePricingConfig, WeightUnit } from '../types/bmk';
import { formatMMK, formatNumber, rateVissToKg } from '../utils/formatters';
import { 
  Settings, 
  Truck, 
  Phone, 
  BellRing, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  Info,
  Sparkles
} from 'lucide-react';

interface FacebookSidebarRightProps {
  pricingConfig: GatePricingConfig;
  weightUnit: WeightUnit;
  trips: Trip[];
  parcels: Parcel[];
  onOpenPricingModal: () => void;
  onOpenNotificationModal?: (parcel: Parcel, mode: 'INTAKE' | 'ARRIVAL') => void;
  lang: 'my' | 'en';
}

export const FacebookSidebarRight: React.FC<FacebookSidebarRightProps> = ({
  pricingConfig,
  weightUnit,
  trips,
  parcels,
  onOpenPricingModal,
  onOpenNotificationModal,
  lang,
}) => {
  const rateInKg = rateVissToKg(pricingConfig.customerRatePerViss);
  const notifiedParcels = parcels.filter((p) => p.notifiedArrivalAt || p.notifiedIntakeAt).slice(0, 4);

  return (
    <aside className="space-y-4 text-xs font-sans">
      {/* Sponsored Card: Gate Pricing Config (Facebook Sponsored Widget Style) */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e4e6eb] p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#65676b] uppercase tracking-wider">
            {lang === 'my' ? 'တရားဝင် သတ်မှတ်နှုန်းထားများ' : 'Official Gate Rates'}
          </span>
          <button
            onClick={onOpenPricingModal}
            className="text-[11px] text-[#1877F2] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Settings className="w-3 h-3" />
            <span>{lang === 'my' ? 'ပြင်ဆင်ရန်' : 'Edit'}</span>
          </button>
        </div>

        <div className="space-y-2 text-[#050505]">
          <div className="p-2.5 rounded-lg bg-[#f0f2f5] flex items-center justify-between">
            <div>
              <span className="text-[#65676b] block text-[10px]">လူကြီးမင်း ပို့ခနှုန်း (Customer):</span>
              <span className="font-bold text-sm text-[#050505] font-mono">
                {formatNumber(pricingConfig.customerRatePerViss)} ကျပ်/ပိဿာ
              </span>
            </div>
            <span className="text-[10px] text-[#1877F2] font-mono font-semibold bg-[#e7f3ff] px-2 py-0.5 rounded">
              ~ {formatNumber(rateInKg, 1)} MMK/Kg
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-[#f0f2f5]">
              <span className="text-[#65676b] block text-[10px]">၁၂ ဘီးကားခ:</span>
              <span className="font-mono font-bold text-[#050505]">
                {formatNumber(pricingConfig.truckRatePerViss)} ကျပ်
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[#f0f2f5]">
              <span className="text-[#65676b] block text-[10px]">အလုပ်သမားခ:</span>
              <span className="font-mono font-bold text-[#050505]">
                {pricingConfig.mdyLaborPerViss + pricingConfig.kalayLaborPerViss} ကျပ်
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contacts / Fleet Drivers (Facebook Contacts List Style) */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e4e6eb] p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#65676b] uppercase tracking-wider flex items-center gap-1.5">
            <span>{lang === 'my' ? 'ယာဉ်မောင်းနှင့် ဂိတ်တာဝန်ခံများ' : 'Active Personnel'}</span>
            <span className="w-2 h-2 rounded-full bg-[#31a24c] animate-pulse" />
          </span>
          <span className="text-[10px] text-[#65676b] font-mono">Online</span>
        </div>

        <div className="space-y-2">
          {/* Driver 1 */}
          <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#f2f2f2] transition-colors cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  တအ
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#31a24c] ring-2 ring-white" />
              </div>
              <div>
                <span className="font-semibold text-xs text-[#050505] block">ကိုတင်အေး</span>
                <span className="text-[10px] text-[#65676b] block">7A-1088 (Nissan 12-Wheeler)</span>
              </div>
            </div>
            <a
              href="tel:09790112233"
              className="p-1.5 rounded-full hover:bg-[#e4e6eb] text-[#1877F2] transition-colors"
              title="Call Driver"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mandalay Staff */}
          <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#f2f2f2] transition-colors cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs">
                  အမ
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#31a24c] ring-2 ring-white" />
              </div>
              <div>
                <span className="font-semibold text-xs text-[#050505] block">ကိုအောင်မျိုး</span>
                <span className="text-[10px] text-[#65676b] block">မန္တလေးဂိတ်မှူး (၈၄ လမ်း)</span>
              </div>
            </div>
            <a
              href="tel:09450012345"
              className="p-1.5 rounded-full hover:bg-[#e4e6eb] text-[#1877F2] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Kalay Staff */}
          <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#f2f2f2] transition-colors cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                  သတ
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#31a24c] ring-2 ring-white" />
              </div>
              <div>
                <span className="font-semibold text-xs text-[#050505] block">မသီတာ</span>
                <span className="text-[10px] text-[#65676b] block">ကလေးဂိတ်မှူး (တာဟန်း)</span>
              </div>
            </div>
            <a
              href="tel:09256123456"
              className="p-1.5 rounded-full hover:bg-[#e4e6eb] text-[#1877F2] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Customer Notification Logs (Viber & SMS Alerts) */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e4e6eb] p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#65676b] uppercase tracking-wider flex items-center gap-1.5">
            <BellRing className="w-3.5 h-3.5 text-[#1877F2]" />
            <span>{lang === 'my' ? 'လတ်တလော အသိပေးချက်များ' : 'Recent Alerts'}</span>
          </span>
          <span className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-1.5 py-0.5 rounded">
            Viber / SMS
          </span>
        </div>

        <div className="space-y-2">
          {notifiedParcels.length > 0 ? (
            notifiedParcels.map((p) => (
              <div
                key={p.id}
                onClick={() => onOpenNotificationModal && onOpenNotificationModal(p, p.status === 'ARRIVED_KALAY' ? 'ARRIVAL' : 'INTAKE')}
                className="p-2 rounded-lg bg-[#f0f2f5] hover:bg-[#e4e6eb] transition-colors cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#1877F2] text-[11px]">{p.id}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{p.notifiedArrivalAt ? 'ကလေးဆိုက်ရောက်' : 'ဘောင်ချာဖွင့်'}</span>
                  </span>
                </div>
                <div className="text-[11px] text-[#050505] truncate">
                  To: <strong>{p.receiverName}</strong> ({p.receiverPhone})
                </div>
              </div>
            ))
          ) : (
            <div className="text-[11px] text-[#65676b] italic p-2 text-center bg-[#f0f2f5] rounded-lg">
              {lang === 'my' ? 'ပါဆယ်များတွင် Viber/SMS တိုက်ရိုက်ပို့နိုင်ပါသည်' : 'Ready to send customer alerts'}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
