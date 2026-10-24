import React from 'react';
import { AppUserAccount } from '../types/bmk';
import { Package, Box, Camera, Sparkles, PlusCircle } from 'lucide-react';

interface FacebookCreatePostProps {
  currentUser: AppUserAccount;
  onOpenBookingModal: () => void;
  onNavigateTab: (tab: 'dashboard' | 'parcels' | 'trips' | 'claims' | 'android-studio') => void;
  lang: 'my' | 'en';
}

export const FacebookCreatePost: React.FC<FacebookCreatePostProps> = ({
  currentUser,
  onOpenBookingModal,
  onNavigateTab,
  lang,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#e4e6eb] p-3 sm:p-4 space-y-3">
      {/* Top Row: User Avatar + Wide Input Field */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div
          className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm`}
        >
          {currentUser.name.slice(0, 1)}
        </div>

        <button
          onClick={onOpenBookingModal}
          className="flex-1 bg-[#f0f2f5] hover:bg-[#e4e6eb] transition-colors rounded-full py-2.5 px-4 text-left text-[#65676b] text-xs sm:text-sm font-normal truncate cursor-pointer"
        >
          {lang === 'my'
            ? `${currentUser.name} ရေ၊ ကုန်စည်အသစ် ဘောင်ချာဖွင့်မလား? (မန္တလေး ➔ ကလေး)...`
            : `What cargo are you receiving today, ${currentUser.name}?`}
        </button>
      </div>

      <div className="border-t border-[#e4e6eb]" />

      {/* Bottom Row: 3 Facebook Action Buttons */}
      <div className="grid grid-cols-3 gap-1">
        <button
          onClick={onOpenBookingModal}
          className="flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-1 sm:px-2 rounded-lg hover:bg-[#f2f2f2] transition-colors cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-[#65676b] truncate">
            {lang === 'my' ? 'ဘောင်ချာဖွင့်' : 'Book Cargo'}
          </span>
        </button>

        <button
          onClick={onOpenBookingModal}
          className="flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-1 sm:px-2 rounded-lg hover:bg-[#f2f2f2] transition-colors cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Box className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-[#65676b] truncate">
            {lang === 'my' ? 'ကုန်ပွစျေး' : 'Bulky Mode'}
          </span>
        </button>

        <button
          onClick={() => onNavigateTab('parcels')}
          className="flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-1 sm:px-2 rounded-lg hover:bg-[#f2f2f2] transition-colors cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-sky-50 text-[#1877F2] flex items-center justify-center shrink-0">
            <Camera className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-[#65676b] truncate">
            {lang === 'my' ? 'စကင်ဖတ်' : 'Batch Scan'}
          </span>
        </button>
      </div>
    </div>
  );
};
