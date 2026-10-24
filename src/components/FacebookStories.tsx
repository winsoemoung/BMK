import React from 'react';
import { Parcel, Trip, GatePricingConfig, WeightUnit } from '../types/bmk';
import { formatMMK, formatNumber, vissToKg } from '../utils/formatters';
import { Truck, MapPin, Package, DollarSign, Smartphone, Sparkles, Plus } from 'lucide-react';

interface FacebookStoriesProps {
  parcels: Parcel[];
  trips: Trip[];
  onOpenBookingModal: () => void;
  onNavigateTab: (tab: 'dashboard' | 'parcels' | 'trips' | 'claims' | 'android-studio') => void;
  lang: 'my' | 'en';
}

export const FacebookStories: React.FC<FacebookStoriesProps> = ({
  parcels,
  trips,
  onOpenBookingModal,
  onNavigateTab,
  lang,
}) => {
  const inTransitTrips = trips.filter((t) => t.status === 'IN_TRANSIT');
  const arrivedTrips = trips.filter((t) => t.status === 'ARRIVED');
  const todayParcels = parcels.length;
  const totalWeight = parcels.reduce((sum, p) => sum + p.weightViss, 0);

  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
      {/* Story 1: Create Story / Book Cargo */}
      <button
        onClick={onOpenBookingModal}
        className="w-28 sm:w-32 h-44 sm:h-48 rounded-xl bg-white border border-[#e4e6eb] shadow-sm flex flex-col justify-between overflow-hidden shrink-0 hover:opacity-95 transition-all text-left relative group cursor-pointer"
      >
        <div className="h-28 sm:h-32 bg-gradient-to-br from-[#1877F2]/20 to-[#1877F2]/5 flex items-center justify-center relative overflow-hidden">
          <img
            src="/src/assets/images/bmk_gate_emblem_1792773077611.jpg"
            alt="BMK Gate"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="absolute top-[100px] sm:top-[112px] left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#1877F2] text-white ring-4 ring-white flex items-center justify-center shadow">
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div className="p-2 pt-4 text-center bg-white">
          <span className="text-[11px] font-bold text-[#050505] block leading-tight">
            {lang === 'my' ? 'ဘောင်ချာဖွင့်' : 'Create Voucher'}
          </span>
        </div>
      </button>

      {/* Story 2: Mandalay Gate Live Intake */}
      <button
        onClick={() => onNavigateTab('parcels')}
        className="w-28 sm:w-32 h-44 sm:h-48 rounded-xl bg-gradient-to-b from-sky-600 to-sky-900 shadow-sm p-3 flex flex-col justify-between overflow-hidden shrink-0 hover:scale-[1.02] transition-all text-left relative group cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full ring-2 ring-[#1877F2] bg-white flex items-center justify-center shadow">
          <Package className="w-4 h-4 text-sky-600" />
        </div>
        <div className="space-y-0.5 text-white">
          <span className="text-[10px] text-sky-200 block font-medium">မန္တလေးဂိတ်</span>
          <span className="text-xs font-bold block leading-tight">
            {todayParcels} {lang === 'my' ? 'ပါဆယ်တင်ပြီး' : 'Parcels'}
          </span>
          <span className="text-[9px] text-sky-200 font-mono block">
            {formatNumber(totalWeight, 0)} ပိဿာ
          </span>
        </div>
      </button>

      {/* Story 3: 12-Wheeler Fleet in Transit */}
      <button
        onClick={() => onNavigateTab('trips')}
        className="w-28 sm:w-32 h-44 sm:h-48 rounded-xl bg-gradient-to-b from-amber-600 to-amber-900 shadow-sm p-3 flex flex-col justify-between overflow-hidden shrink-0 hover:scale-[1.02] transition-all text-left relative group cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full ring-2 ring-amber-400 bg-white flex items-center justify-center shadow">
          <Truck className="w-4 h-4 text-amber-600" />
        </div>
        <div className="space-y-0.5 text-white">
          <span className="text-[10px] text-amber-200 block font-medium">၁၂ ဘီး ကားကြီးများ</span>
          <span className="text-xs font-bold block leading-tight">
            {inTransitTrips.length} စီး {lang === 'my' ? 'လမ်းခရီးတွင်' : 'In Transit'}
          </span>
          <span className="text-[9px] text-amber-200 block truncate">
            မုံရွာ ➔ ဂန့်ဂေါ
          </span>
        </div>
      </button>

      {/* Story 4: Kalay Gate Arrival */}
      <button
        onClick={() => onNavigateTab('trips')}
        className="w-28 sm:w-32 h-44 sm:h-48 rounded-xl bg-gradient-to-b from-purple-700 to-purple-950 shadow-sm p-3 flex flex-col justify-between overflow-hidden shrink-0 hover:scale-[1.02] transition-all text-left relative group cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full ring-2 ring-purple-400 bg-white flex items-center justify-center shadow">
          <MapPin className="w-4 h-4 text-purple-600" />
        </div>
        <div className="space-y-0.5 text-white">
          <span className="text-[10px] text-purple-200 block font-medium">ကလေးဂိတ် ဆိုက်ရောက်</span>
          <span className="text-xs font-bold block leading-tight">
            {arrivedTrips.length} စီး {lang === 'my' ? 'ဆိုက်ရောက်/ချဆဲ' : 'Arrived'}
          </span>
          <span className="text-[9px] text-purple-200 block truncate">
            တာဟန်းရပ်ကွက်
          </span>
        </div>
      </button>

      {/* Story 5: APK & Android Studio */}
      <button
        onClick={() => onNavigateTab('android-studio')}
        className="w-28 sm:w-32 h-44 sm:h-48 rounded-xl bg-gradient-to-b from-emerald-600 to-emerald-950 shadow-sm p-3 flex flex-col justify-between overflow-hidden shrink-0 hover:scale-[1.02] transition-all text-left relative group cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full ring-2 ring-emerald-400 bg-white flex items-center justify-center shadow">
          <Smartphone className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="space-y-0.5 text-white">
          <span className="text-[10px] text-emerald-200 block font-medium">Single APK</span>
          <span className="text-xs font-bold block leading-tight">
            BMK Express.apk
          </span>
          <span className="text-[9px] text-emerald-200 block font-mono">
            v2.4 Online
          </span>
        </div>
      </button>
    </div>
  );
};
