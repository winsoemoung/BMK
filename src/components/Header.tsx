import React, { useState } from 'react';
import { AppUserAccount, UserRole, WeightUnit } from '../types/bmk';
import { 
  Home, 
  Package, 
  Truck, 
  ShieldAlert, 
  Smartphone, 
  Search, 
  MessageCircle, 
  Bell, 
  Plus, 
  Scale, 
  Settings, 
  Globe, 
  ChevronDown, 
  LogOut, 
  UserCheck, 
  Shield, 
  Sparkles,
  MapPin,
  CheckCircle2,
  X
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'dashboard' | 'parcels' | 'trips' | 'claims' | 'android-studio';
  onTabChange: (tab: 'dashboard' | 'parcels' | 'trips' | 'claims' | 'android-studio') => void;
  currentUser: AppUserAccount;
  onOpenLoginModal: () => void;
  onQuickRoleSwitch: (role: UserRole) => void;
  weightUnit: WeightUnit;
  onToggleWeightUnit: () => void;
  isMobileView: boolean;
  onToggleMobileView: () => void;
  lang: 'my' | 'en';
  onToggleLang: () => void;
  onOpenBookingModal: () => void;
  onOpenPricingModal: () => void;
  onOpenChatBot: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  onOpenLoginModal,
  onQuickRoleSwitch,
  weightUnit,
  onToggleWeightUnit,
  isMobileView,
  onToggleMobileView,
  lang,
  onToggleLang,
  onOpenBookingModal,
  onOpenPricingModal,
  onOpenChatBot,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e4e6eb] shadow-sm select-none">
      {/* Facebook Desktop & Tablet Top Bar */}
      <div className="max-w-[1920px] mx-auto px-4 h-14 flex items-center justify-between gap-2 sm:gap-4">
        {/* LEFT ZONE: Facebook Logo + Search Bar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Facebook Blue Circle Logo with BMK styling */}
          <button
            onClick={() => onTabChange('dashboard')}
            className="w-10 h-10 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center font-black text-xl shadow cursor-pointer transition-transform active:scale-95 shrink-0"
            title="BMK Express - Home"
          >
            <span>b</span>
          </button>

          {/* Facebook Search Pill */}
          <div className="relative hidden sm:flex items-center">
            <Search className="w-4 h-4 text-[#65676b] absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder={lang === 'my' ? 'BMK Express တွင် ရှာဖွေပါ...' : 'Search BMK Express...'}
              onClick={() => onTabChange('parcels')}
              className="bg-[#f0f2f5] hover:bg-[#e4e6eb] focus:bg-white focus:ring-2 focus:ring-[#1877F2] focus:outline-none rounded-full pl-9 pr-4 py-2 text-xs sm:text-sm text-[#050505] placeholder-[#65676b] w-48 md:w-60 lg:w-64 transition-all"
            />
          </div>
        </div>

        {/* CENTER ZONE: Facebook 5 Main Navigation Tabs */}
        <nav className="hidden md:flex items-center justify-center flex-1 max-w-2xl h-full px-2">
          {/* Tab 1: Home / Dashboard */}
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex-1 h-full flex flex-col items-center justify-center relative hover:bg-[#f2f2f2] rounded-lg transition-colors cursor-pointer group ${
              currentTab === 'dashboard' ? 'text-[#1877F2]' : 'text-[#65676b]'
            }`}
            title={lang === 'my' ? 'ပင်မစာမျက်နှာ (P&L Dashboard)' : 'Home / P&L'}
          >
            <Home className="w-6 h-6 stroke-[2.2]" />
            {currentTab === 'dashboard' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1877F2] rounded-t-full" />
            )}
          </button>

          {/* Tab 2: Parcels / Marketplace */}
          <button
            onClick={() => onTabChange('parcels')}
            className={`flex-1 h-full flex flex-col items-center justify-center relative hover:bg-[#f2f2f2] rounded-lg transition-colors cursor-pointer group ${
              currentTab === 'parcels' ? 'text-[#1877F2]' : 'text-[#65676b]'
            }`}
            title={lang === 'my' ? 'ကုန်စည်စာရင်း (Parcels)' : 'Cargo Parcels'}
          >
            <Package className="w-6 h-6 stroke-[2.2]" />
            {currentTab === 'parcels' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1877F2] rounded-t-full" />
            )}
          </button>

          {/* Tab 3: Trips / Fleet */}
          <button
            onClick={() => onTabChange('trips')}
            className={`flex-1 h-full flex flex-col items-center justify-center relative hover:bg-[#f2f2f2] rounded-lg transition-colors cursor-pointer group ${
              currentTab === 'trips' ? 'text-[#1877F2]' : 'text-[#65676b]'
            }`}
            title={lang === 'my' ? '၁၂ ဘီးကား ခရီးစဉ်များ (Fleet)' : '12-Wheel Fleet'}
          >
            <Truck className="w-6 h-6 stroke-[2.2]" />
            {currentTab === 'trips' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1877F2] rounded-t-full" />
            )}
          </button>

          {/* Tab 4: Claims / Safety Center */}
          <button
            onClick={() => onTabChange('claims')}
            className={`flex-1 h-full flex flex-col items-center justify-center relative hover:bg-[#f2f2f2] rounded-lg transition-colors cursor-pointer group ${
              currentTab === 'claims' ? 'text-[#1877F2]' : 'text-[#65676b]'
            }`}
            title={lang === 'my' ? 'လျော်ကြေးစီမံခန့်ခွဲမှု (Claims)' : 'Claims Management'}
          >
            <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
            {currentTab === 'claims' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1877F2] rounded-t-full" />
            )}
          </button>

          {/* Tab 5: Android Studio Hub */}
          <button
            onClick={() => onTabChange('android-studio')}
            className={`flex-1 h-full flex flex-col items-center justify-center relative hover:bg-[#f2f2f2] rounded-lg transition-colors cursor-pointer group ${
              currentTab === 'android-studio' ? 'text-[#1877F2]' : 'text-[#65676b]'
            }`}
            title={lang === 'my' ? 'Android Studio One APK Hub' : 'One APK Code'}
          >
            <Smartphone className="w-6 h-6 stroke-[2.2]" />
            {currentTab === 'android-studio' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1877F2] rounded-t-full" />
            )}
          </button>
        </nav>

        {/* RIGHT ZONE: Facebook Circular Action Buttons & Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Quick Book Cargo Button (Facebook + / Create button) */}
          <button
            onClick={onOpenBookingModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e7f3ff] hover:bg-[#d8eaff] text-[#1877F2] font-semibold text-xs sm:text-sm transition-colors cursor-pointer shadow-sm"
            title="Book Cargo Voucher"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline font-bold">
              {lang === 'my' ? 'ဘောင်ချာဖွင့်' : 'Book'}
            </span>
          </button>

          {/* Facebook Messenger Icon Button (Opens Gemini AI Chat Bot) */}
          <button
            onClick={onOpenChatBot}
            className="w-10 h-10 rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] text-[#050505] flex items-center justify-center transition-colors cursor-pointer relative"
            title="BMK Gemini AI Copilot (Messenger)"
          >
            <MessageCircle className="w-5 h-5 fill-[#050505] text-[#050505]" />
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#fa383e] text-white text-[10px] font-bold ring-2 ring-white">
              AI
            </span>
          </button>

          {/* Viss ⇄ Kg Unit Switcher Button */}
          <button
            onClick={onToggleWeightUnit}
            className="w-10 h-10 rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] text-[#050505] flex items-center justify-center text-[11px] font-bold transition-colors cursor-pointer"
            title={weightUnit === 'VISS' ? 'လက်ရှိ: ပိဿာ (Kg သို့ ပြောင်းရန် နှိပ်ပါ)' : 'Current: Kg (Switch to Viss)'}
          >
            <span className="font-mono text-[#1877F2] font-bold">
              {weightUnit === 'VISS' ? 'ပိဿာ' : 'Kg'}
            </span>
          </button>

          {/* Admin Pricing Settings Button */}
          {isAdmin && (
            <button
              onClick={onOpenPricingModal}
              className="w-10 h-10 rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] text-[#050505] flex items-center justify-center transition-colors cursor-pointer hidden sm:flex"
              title="Admin Pricing Rates"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}

          {/* Language Toggle Button */}
          <button
            onClick={onToggleLang}
            className="w-10 h-10 rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
            title="Toggle Language"
          >
            <span className="text-xs font-bold">
              {lang === 'my' ? '🇲🇲' : '🇬🇧'}
            </span>
          </button>

          {/* Facebook Profile Avatar Circle */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1877F2] to-sky-600 text-white flex items-center justify-center font-bold text-sm shadow cursor-pointer relative hover:opacity-95 transition-opacity"
              title={`${currentUser.name} (${currentUser.role})`}
            >
              <span>{currentUser.name.slice(0, 1)}</span>
              {/* Green Active Dot */}
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#31a24c] ring-2 ring-white" />
            </button>

            {/* Facebook Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-12 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-[#e4e6eb] p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                {/* Profile Card Header */}
                <div
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onOpenLoginModal();
                  }}
                  className="p-3 rounded-xl hover:bg-[#f2f2f2] transition-colors cursor-pointer flex items-center gap-3 border border-[#e4e6eb]"
                >
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-base shadow`}>
                    {currentUser.name.slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-sm text-[#050505] block truncate">
                      {currentUser.name}
                    </span>
                    <span className="text-xs text-[#65676b] block">
                      {lang === 'my' ? currentUser.roleTitleMy : currentUser.roleTitleEn}
                    </span>
                  </div>
                </div>

                {/* Role Switcher Section */}
                <div className="space-y-1.5 pt-1 border-t border-[#e4e6eb]">
                  <span className="text-[11px] font-bold text-[#65676b] px-2 uppercase tracking-wider block">
                    {lang === 'my' ? 'အကောင့်ခွဲ ရွေးချယ်ရန် (Single APK):' : 'Switch Role:'}
                  </span>
                  {[
                    { role: 'ADMIN' as UserRole, name: 'ဦးကိုကို (Admin HQ)', title: 'ဂိတ်ပိုင်ရှင်' },
                    { role: 'MANDALAY_STAFF' as UserRole, name: 'ကိုအောင်မျိုး (မန္တလေး)', title: 'တင်ရေးတာဝန်ခံ' },
                    { role: 'KALAY_STAFF' as UserRole, name: 'မသီတာ (ကလေး)', title: 'ချရေး & COD တာဝန်ခံ' },
                    { role: 'DRIVER' as UserRole, name: 'ကိုဝင်းဇော် (ယာဉ်မောင်း)', title: '၁၂ ဘီး ယာဉ်မောင်း' },
                  ].map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        onQuickRoleSwitch(r.role);
                        setIsProfileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                        currentUser.role === r.role
                          ? 'bg-[#e7f3ff] text-[#1877F2] font-bold'
                          : 'hover:bg-[#f2f2f2] text-[#050505]'
                      }`}
                    >
                      <div className="text-left">
                        <span className="block font-semibold">{r.name}</span>
                        <span className="text-[10px] text-[#65676b]">{r.title}</span>
                      </div>
                      {currentUser.role === r.role && <CheckCircle2 className="w-4 h-4 text-[#1877F2]" />}
                    </button>
                  ))}
                </div>

                {/* Login Modal trigger */}
                <div className="pt-2 border-t border-[#e4e6eb]">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenLoginModal();
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-[#f0f2f5] hover:bg-[#e4e6eb] text-[#050505] font-semibold text-xs transition-colors text-center cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{lang === 'my' ? 'PIN ဖြင့် လော့ဂ်အင်ဝင်မည်' : 'PIN Login Dialog'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Facebook Mobile Tab Navigation (Under Header) */}
      <div className="flex md:hidden items-center justify-around border-t border-[#e4e6eb] h-12 bg-white">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex-1 h-full flex items-center justify-center relative cursor-pointer ${
            currentTab === 'dashboard' ? 'text-[#1877F2]' : 'text-[#65676b]'
          }`}
        >
          <Home className="w-5 h-5 stroke-[2.2]" />
          {currentTab === 'dashboard' && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1877F2] rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => onTabChange('parcels')}
          className={`flex-1 h-full flex items-center justify-center relative cursor-pointer ${
            currentTab === 'parcels' ? 'text-[#1877F2]' : 'text-[#65676b]'
          }`}
        >
          <Package className="w-5 h-5 stroke-[2.2]" />
          {currentTab === 'parcels' && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1877F2] rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => onTabChange('trips')}
          className={`flex-1 h-full flex items-center justify-center relative cursor-pointer ${
            currentTab === 'trips' ? 'text-[#1877F2]' : 'text-[#65676b]'
          }`}
        >
          <Truck className="w-5 h-5 stroke-[2.2]" />
          {currentTab === 'trips' && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1877F2] rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => onTabChange('claims')}
          className={`flex-1 h-full flex items-center justify-center relative cursor-pointer ${
            currentTab === 'claims' ? 'text-[#1877F2]' : 'text-[#65676b]'
          }`}
        >
          <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
          {currentTab === 'claims' && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1877F2] rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => onTabChange('android-studio')}
          className={`flex-1 h-full flex items-center justify-center relative cursor-pointer ${
            currentTab === 'android-studio' ? 'text-[#1877F2]' : 'text-[#65676b]'
          }`}
        >
          <Smartphone className="w-5 h-5 stroke-[2.2]" />
          {currentTab === 'android-studio' && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1877F2] rounded-t-full" />
          )}
        </button>
      </div>
    </header>
  );
};
