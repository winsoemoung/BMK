import React from 'react';
import { AppUserAccount, UserRole, WeightUnit } from '../types/bmk';
import { 
  Plus, 
  Shield, 
  Smartphone, 
  Monitor, 
  Globe, 
  Scale, 
  Settings, 
  UserCheck, 
  Truck, 
  MapPin, 
  Lock,
  ChevronDown,
  LogOut
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
}) => {
  const isAdmin = currentUser.role === 'ADMIN';
  const isMandalay = currentUser.role === 'MANDALAY_STAFF';
  const isKalay = currentUser.role === 'KALAY_STAFF';
  const isDriver = currentUser.role === 'DRIVER';

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      {/* 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 md:gap-8 h-16">
        {/* Zone 1: Wordmark & Single APK Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/src/assets/images/bmk_gate_emblem_1792773077611.jpg"
            alt="BMK Emblem"
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-lg object-cover ring-1 ring-amber-500/30"
          />
          <div className="flex flex-col">
            <button
              onClick={() => onTabChange(isAdmin ? 'dashboard' : isKalay ? 'trips' : 'parcels')}
              className="text-left font-bold tracking-tight text-white text-base sm:text-lg whitespace-nowrap hover:text-amber-400 transition-colors flex items-center gap-1.5"
            >
              <span>BMK Express</span>
              <span className="text-amber-400 font-normal text-xs sm:text-sm hidden sm:inline">Mandalay ⇄ Kalay</span>
            </button>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-mono text-emerald-400 font-semibold leading-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Cloud: pos-sync-511822
              </span>
              <span className="text-slate-600 text-[10px]">·</span>
              <span className="text-[10px] font-mono text-slate-400">Offline Persistence</span>
            </div>
          </div>
        </div>

        {/* Zone 2: 4-5 Clean single-line text navigation links with Permission Awareness */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          {/* Dashboard: Admin only */}
          <button
            onClick={() => onTabChange('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              currentTab === 'dashboard'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            <span>{lang === 'my' ? 'ဘဏ္ဍာရေး & အမြတ်' : 'P&L Dashboard'}</span>
            {!isAdmin && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                Admin
              </span>
            )}
          </button>

          {/* Parcels: Primary for Mandalay & Admin */}
          <button
            onClick={() => onTabChange('parcels')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              currentTab === 'parcels'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            <span>{lang === 'my' ? 'ကုန်စည်စာရင်း & ဘောင်ချာ' : 'Parcels & Receipts'}</span>
            {isMandalay && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 font-normal">
                MDY Gate
              </span>
            )}
          </button>

          {/* Trips: Crucial for Kalay & Drivers & Admin */}
          <button
            onClick={() => onTabChange('trips')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              currentTab === 'trips'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            <span>{lang === 'my' ? '၁၂ ဘီးကားခရီးစဉ်' : '12-Wheel Trips'}</span>
            {isKalay && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 font-normal">
                ကားဆိုက် / ချ
              </span>
            )}
          </button>

          {/* Claims */}
          <button
            onClick={() => onTabChange('claims')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              currentTab === 'claims'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            <span>{lang === 'my' ? 'ပျောက်ဆုံး/ပျက်စီး လျော်ကြေး' : 'Claims & Losses'}</span>
          </button>

          {/* Android Studio Hub */}
          <button
            onClick={() => onTabChange('android-studio')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              currentTab === 'android-studio'
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'hover:text-white text-emerald-400/90'
            }`}
          >
            <span>One APK Code & Auth</span>
          </button>
        </nav>

        {/* Zone 3: Active Account Pill & Primary Action button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Active Account Switcher Button */}
          <button
            onClick={onOpenLoginModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700 hover:border-amber-400/40 text-left transition-all group"
            title="အကောင့်ပြောင်းရန် နှိပ်ပါ (Switch User / Role)"
          >
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${currentUser.avatarColor} flex items-center justify-center text-white font-bold text-xs shadow`}>
              {isAdmin && <Shield className="w-3.5 h-3.5" />}
              {isMandalay && 'MDY'}
              {isKalay && 'KLY'}
              {isDriver && <Truck className="w-3.5 h-3.5" />}
            </div>

            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-amber-300 font-medium leading-tight">
                {lang === 'my' ? currentUser.roleTitleMy : currentUser.roleTitleEn}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
          </button>

          {/* Action button: Contextual to Role */}
          {currentUser.permissions.canBookParcel ? (
            <button
              onClick={onOpenBookingModal}
              className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg hover:from-amber-300 hover:to-amber-400 active:scale-95 transition-all shadow-md shadow-amber-500/10 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'my' ? 'ပစ္စည်းလက်ခံမည်' : 'Book Parcel'}</span>
            </button>
          ) : isKalay ? (
            <button
              onClick={() => onTabChange('trips')}
              className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg hover:from-purple-500 hover:to-purple-600 active:scale-95 transition-all shadow-md whitespace-nowrap shrink-0"
            >
              <Truck className="w-4 h-4" />
              <span>{lang === 'my' ? 'ကားဆိုက်ရောက်စစ်ဆေး' : 'Kalay Check-in'}</span>
            </button>
          ) : (
            <button
              onClick={() => onTabChange('trips')}
              className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-lg hover:bg-slate-750 transition-all whitespace-nowrap shrink-0"
            >
              <span>{lang === 'my' ? 'ခရီးစဉ်ကြည့်ရှုမည်' : 'View Trips'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-bar: 1-Click Role Simulator, Location Badge, Viss ⇄ Kg, Admin Rates & Language */}
      <div className="border-t border-slate-800/80 bg-slate-950/70 px-4 sm:px-6 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Mobile view navigation pill-less buttons */}
          <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto py-0.5">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap ${currentTab === 'dashboard' ? 'bg-slate-800 text-amber-400 font-medium' : 'text-slate-400'}`}
            >
              P&L
            </button>
            <button
              onClick={() => onTabChange('parcels')}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap ${currentTab === 'parcels' ? 'bg-slate-800 text-amber-400 font-medium' : 'text-slate-400'}`}
            >
              {lang === 'my' ? 'ကုန်စည်များ' : 'Parcels'}
            </button>
            <button
              onClick={() => onTabChange('trips')}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap ${currentTab === 'trips' ? 'bg-slate-800 text-amber-400 font-medium' : 'text-slate-400'}`}
            >
              {lang === 'my' ? '၁၂ ဘီးကား' : 'Trips'}
            </button>
            <button
              onClick={() => onTabChange('claims')}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap ${currentTab === 'claims' ? 'bg-slate-800 text-amber-400 font-medium' : 'text-slate-400'}`}
            >
              {lang === 'my' ? 'လျော်ကြေး' : 'Claims'}
            </button>
            <button
              onClick={() => onTabChange('android-studio')}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap ${currentTab === 'android-studio' ? 'bg-emerald-950 text-emerald-400 font-medium' : 'text-slate-400'}`}
            >
              One APK Code
            </button>
          </div>

          {/* Left: Quick Role Selector (For testing how 1 single APK reacts to different accounts) */}
          <div className="flex items-center gap-2 text-slate-400 flex-wrap">
            <span className="flex items-center gap-1 font-medium text-slate-300">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'my' ? 'အကောင့်ခွဲစနစ်:' : 'Active Role:'}</span>
            </span>

            <div className="inline-flex rounded-lg bg-slate-900 border border-slate-800 p-0.5">
              <button
                onClick={() => onQuickRoleSwitch('ADMIN')}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors whitespace-nowrap font-medium ${
                  currentUser.role === 'ADMIN'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="ဦးကိုကို (ဂိတ်ပိုင်ရှင် / Admin HQ)"
              >
                {lang === 'my' ? 'ဂိတ်ပိုင်ရှင် (Admin)' : 'Admin (HQ)'}
              </button>
              <button
                onClick={() => onQuickRoleSwitch('MANDALAY_STAFF')}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors whitespace-nowrap font-medium ${
                  currentUser.role === 'MANDALAY_STAFF'
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="ကိုအောင်မျိုး (မန္တလေးဂိတ် တင်ရေးတာဝန်ခံ)"
              >
                {lang === 'my' ? 'မန္တလေးဂိတ်' : 'MDY Gate'}
              </button>
              <button
                onClick={() => onQuickRoleSwitch('KALAY_STAFF')}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors whitespace-nowrap font-medium ${
                  currentUser.role === 'KALAY_STAFF'
                    ? 'bg-purple-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="မသီတာ (ကလေးဂိတ် ချရေး & COD တာဝန်ခံ)"
              >
                {lang === 'my' ? 'ကလေးဂိတ်' : 'Kalay Gate'}
              </button>
              <button
                onClick={() => onQuickRoleSwitch('DRIVER')}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors whitespace-nowrap font-medium ${
                  currentUser.role === 'DRIVER'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="ကိုဝင်းဇော် (၁၂ ဘီး ယာဉ်မောင်း)"
              >
                {lang === 'my' ? 'ယာဉ်မောင်း' : 'Driver'}
              </button>
            </div>

            {/* Location Pill */}
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <MapPin className="w-3 h-3 text-slate-500" />
              <span>{lang === 'my' ? currentUser.gateLocationNameMy : currentUser.gateLocation}</span>
            </span>

            {/* Admin Custom Rates Trigger */}
            {currentUser.permissions.canConfigurePricing && (
              <button
                onClick={onOpenPricingModal}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-amber-500/50 text-amber-400 hover:bg-amber-500/10 font-medium transition-colors"
                title="Configure custom customer rate, truck rate, and labor fees"
              >
                <Settings className="w-3 h-3" />
                <span>{lang === 'my' ? 'ဂိတ်နှုန်းထားသတ်မှတ်ရန်' : 'Edit Rates'}</span>
              </button>
            )}
          </div>

          {/* Right: Weight Unit Toggle (Viss ⇄ Kg), Mobile Viewport, Language */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Weight Unit Toggle: Viss ⇄ Kg */}
            <div className="inline-flex rounded-md bg-slate-900 border border-slate-800 p-0.5">
              <button
                onClick={() => weightUnit !== 'VISS' && onToggleWeightUnit()}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1 ${
                  weightUnit === 'VISS'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch weight unit to Myanmar Viss (ပိဿာ)"
              >
                <Scale className="w-3 h-3" />
                <span>{lang === 'my' ? 'ပိဿာ (Viss)' : 'Viss'}</span>
              </button>
              <button
                onClick={() => weightUnit !== 'KG' && onToggleWeightUnit()}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1 ${
                  weightUnit === 'KG'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch weight unit to Kilograms (Kg)"
              >
                <span>ကီလို (Kg)</span>
              </button>
            </div>

            {/* Mobile / Desktop Viewport switch */}
            <button
              onClick={onToggleMobileView}
              className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-colors ${
                isMobileView
                  ? 'border-cyan-500 text-cyan-400 bg-cyan-950/40'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-900'
              }`}
              title="Toggle Android Device Frame Simulation"
            >
              {isMobileView ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Mobile</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </>
              )}
            </button>

            {/* Language toggle */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'my' ? 'မြန်မာ 🇲🇲' : 'EN 🇬🇧'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
