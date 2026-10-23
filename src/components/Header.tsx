import React from 'react';
import { UserRole } from '../types/bmk';
import { Plus, Shield, Smartphone, Monitor, Globe } from 'lucide-react';

interface HeaderProps {
  currentTab: 'dashboard' | 'parcels' | 'trips' | 'claims' | 'android-studio';
  onTabChange: (tab: 'dashboard' | 'parcels' | 'trips' | 'claims' | 'android-studio') => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isMobileView: boolean;
  onToggleMobileView: () => void;
  lang: 'my' | 'en';
  onToggleLang: () => void;
  onOpenBookingModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  userRole,
  onRoleChange,
  isMobileView,
  onToggleMobileView,
  lang,
  onToggleLang,
  onOpenBookingModal,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      {/* 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/src/assets/images/bmk_gate_emblem_1792773077611.jpg"
            alt="BMK Emblem"
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-lg object-cover ring-1 ring-amber-500/30"
          />
          <button
            onClick={() => onTabChange('dashboard')}
            className="text-left font-bold tracking-tight text-white text-lg whitespace-nowrap hover:text-amber-400 transition-colors"
          >
            BMK Express <span className="text-amber-400 font-normal text-sm ml-1 hidden sm:inline">Mandalay ⇄ Kalay</span>
          </button>
        </div>

        {/* Zone 2: 4-5 Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'dashboard'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            {lang === 'my' ? 'ဘဏ္ဍာရေး & အမြတ်' : 'P&L Dashboard'}
          </button>
          <button
            onClick={() => onTabChange('parcels')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'parcels'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            {lang === 'my' ? 'ကုန်စည်စာရင်း & ဘောင်ချာ' : 'Parcels & Receipts'}
          </button>
          <button
            onClick={() => onTabChange('trips')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'trips'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            {lang === 'my' ? '၁၂ ဘီးကားခရီးစဉ်' : '12-Wheel Trips'}
          </button>
          <button
            onClick={() => onTabChange('claims')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'claims'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            {lang === 'my' ? 'ပျောက်ဆုံး/ပျက်စီး လျော်ကြေး' : 'Claims & Losses'}
          </button>
          <button
            onClick={() => onTabChange('android-studio')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              currentTab === 'android-studio'
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'hover:text-white text-emerald-400/90'
            }`}
          >
            <span>Kotlin & Android Studio</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenBookingModal}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg hover:from-amber-300 hover:to-amber-400 active:scale-95 transition-all shadow-md shadow-amber-500/10 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'my' ? 'ပစ္စည်းလက်ခံမည်' : 'Book Parcel'}</span>
          </button>
        </div>
      </div>

      {/* Sub-bar: Role Selector, Device Viewport Toggle & Language Controls */}
      <div className="border-t border-slate-800/80 bg-slate-950/70 px-4 sm:px-6 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Mobile view navigation pill-less buttons */}
          <div className="flex md:hidden items-center gap-2 overflow-x-auto py-0.5">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap ${currentTab === 'dashboard' ? 'bg-slate-800 text-amber-400 font-medium' : 'text-slate-400'}`}
            >
              {lang === 'my' ? 'Dashboard' : 'P&L'}
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
              Android Code
            </button>
          </div>

          {/* Left: Role Switcher (RBAC) */}
          <div className="flex items-center gap-2 text-slate-400">
            <span className="flex items-center gap-1 font-medium text-slate-300">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'my' ? 'အသုံးပြုသူ အဆင့်:' : 'Role:'}</span>
            </span>
            <div className="inline-flex rounded-md bg-slate-900 border border-slate-800 p-0.5">
              <button
                onClick={() => onRoleChange('ADMIN')}
                className={`px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap ${
                  userRole === 'ADMIN'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'my' ? 'ဂိတ်ပိုင်ရှင် (Admin)' : 'Admin (Owner)'}
              </button>
              <button
                onClick={() => onRoleChange('MANDALAY_STAFF')}
                className={`px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap ${
                  userRole === 'MANDALAY_STAFF'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'my' ? 'မန္တလေးဂိတ် ဝန်ထမ်း' : 'Mandalay Gate Staff'}
              </button>
              <button
                onClick={() => onRoleChange('KALAY_STAFF')}
                className={`px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap ${
                  userRole === 'KALAY_STAFF'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'my' ? 'ကလေးဂိတ် ဝန်ထမ်း' : 'Kalay Gate Staff'}
              </button>
            </div>
          </div>

          {/* Right: Viewport Simulator & Language */}
          <div className="flex items-center gap-3">
            {/* Mobile / Desktop Viewport switch */}
            <button
              onClick={onToggleMobileView}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
                isMobileView
                  ? 'border-cyan-500 text-cyan-400 bg-cyan-950/40'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-900'
              }`}
              title="Toggle Android Device Frame Simulation"
            >
              {isMobileView ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{lang === 'my' ? 'Android မိုဘိုင်းပုံစံ (On)' : 'Mobile Frame'}</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5" />
                  <span>{lang === 'my' ? 'ကျယ်ပြန့်သော မျက်နှာပြင်' : 'Desktop View'}</span>
                </>
              )}
            </button>

            {/* Language toggle */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'my' ? 'မြန်မာ 🇲🇲' : 'English 🇬🇧'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
