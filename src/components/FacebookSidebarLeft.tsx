import React from 'react';
import { AppUserAccount, UserRole, WeightUnit, GatePricingConfig } from '../types/bmk';
import { 
  BarChart3, 
  Package, 
  Truck, 
  ShieldAlert, 
  Smartphone, 
  Settings, 
  Scale, 
  MapPin, 
  Database, 
  ChevronRight,
  UserCheck,
  CheckCircle2
} from 'lucide-react';

interface FacebookSidebarLeftProps {
  currentUser: AppUserAccount;
  currentTab: 'dashboard' | 'parcels' | 'trips' | 'claims' | 'android-studio';
  onNavigateTab: (tab: 'dashboard' | 'parcels' | 'trips' | 'claims' | 'android-studio') => void;
  onOpenLoginModal: () => void;
  onQuickRoleSwitch: (role: UserRole) => void;
  weightUnit: WeightUnit;
  onToggleWeightUnit: () => void;
  onOpenPricingModal: () => void;
  lang: 'my' | 'en';
}

export const FacebookSidebarLeft: React.FC<FacebookSidebarLeftProps> = ({
  currentUser,
  currentTab,
  onNavigateTab,
  onOpenLoginModal,
  onQuickRoleSwitch,
  weightUnit,
  onToggleWeightUnit,
  onOpenPricingModal,
  lang,
}) => {
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <aside className="space-y-4 text-xs font-sans">
      {/* User Profile Card (Facebook Style) */}
      <div
        onClick={onOpenLoginModal}
        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#e4e6eb]/60 transition-colors cursor-pointer group"
      >
        <div
          className={`w-9 h-9 rounded-full bg-gradient-to-br ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm relative`}
        >
          {currentUser.name.slice(0, 1)}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#31a24c] ring-2 ring-white" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-sm text-[#050505] block truncate group-hover:text-[#1877F2] transition-colors">
            {currentUser.name}
          </span>
          <span className="text-[11px] text-[#65676b] block truncate">
            {lang === 'my' ? currentUser.roleTitleMy : currentUser.roleTitleEn} · {currentUser.gateLocation}
          </span>
        </div>
      </div>

      {/* Main Navigation Links (Facebook Left Rail Style) */}
      <nav className="space-y-1">
        {/* Dashboard */}
        <button
          onClick={() => onNavigateTab('dashboard')}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors text-left cursor-pointer ${
            currentTab === 'dashboard'
              ? 'bg-[#e7f3ff] text-[#1877F2] font-bold'
              : 'hover:bg-[#e4e6eb]/60 text-[#050505]'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">
            {lang === 'my' ? 'ဘဏ္ဍာရေး စာရင်းချုပ်' : 'P&L Financials'}
          </span>
        </button>

        {/* Parcels */}
        <button
          onClick={() => onNavigateTab('parcels')}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors text-left cursor-pointer ${
            currentTab === 'parcels'
              ? 'bg-[#e7f3ff] text-[#1877F2] font-bold'
              : 'hover:bg-[#e4e6eb]/60 text-[#050505]'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <span className="text-sm font-medium">
              {lang === 'my' ? 'ကုန်စည်စာရင်း & ဘောင်ချာ' : 'Parcels & Receipts'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#e4e6eb] text-[#65676b] font-mono">
              MDY ➔ KLY
            </span>
          </div>
        </button>

        {/* Trips */}
        <button
          onClick={() => onNavigateTab('trips')}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors text-left cursor-pointer ${
            currentTab === 'trips'
              ? 'bg-[#e7f3ff] text-[#1877F2] font-bold'
              : 'hover:bg-[#e4e6eb]/60 text-[#050505]'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">
            {lang === 'my' ? '၁၂ ဘီးကား ခရီးစဉ်များ' : '12-Wheel Fleet'}
          </span>
        </button>

        {/* Claims */}
        <button
          onClick={() => onNavigateTab('claims')}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors text-left cursor-pointer ${
            currentTab === 'claims'
              ? 'bg-[#e7f3ff] text-[#1877F2] font-bold'
              : 'hover:bg-[#e4e6eb]/60 text-[#050505]'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">
            {lang === 'my' ? 'ပျောက်ဆုံး/ပျက်စီး လျော်ကြေး' : 'Claims & Losses'}
          </span>
        </button>

        {/* Android Studio One APK */}
        <button
          onClick={() => onNavigateTab('android-studio')}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors text-left cursor-pointer ${
            currentTab === 'android-studio'
              ? 'bg-[#e7f3ff] text-[#1877F2] font-bold'
              : 'hover:bg-[#e4e6eb]/60 text-[#050505]'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <span className="text-sm font-medium">Single APK Code</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              v2.4
            </span>
          </div>
        </button>
      </nav>

      <div className="border-t border-[#e4e6eb]" />

      {/* Quick Settings & Controls */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold text-[#65676b] px-2.5 uppercase tracking-wider block">
          {lang === 'my' ? 'ဂိတ်ဆက်တင်များ' : 'Quick Actions'}
        </span>

        {/* Pricing Modal trigger (Admin) */}
        {isAdmin && (
          <button
            onClick={onOpenPricingModal}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#e4e6eb]/60 transition-colors text-left cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[#e4e6eb] text-[#050505] flex items-center justify-center shrink-0">
              <Settings className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-[#050505]">
              {lang === 'my' ? 'ဂိတ်နှုန်းထားသတ်မှတ်ရန်' : 'Admin Gate Rates'}
            </span>
          </button>
        )}

        {/* Viss ⇄ Kg Switcher */}
        <button
          onClick={onToggleWeightUnit}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#e4e6eb]/60 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[#e4e6eb] text-[#050505] flex items-center justify-center shrink-0">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-[#050505]">
              {lang === 'my' ? 'အလေးချိန်ယူနစ်' : 'Weight Unit'}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-[#e7f3ff] text-[#1877F2] font-bold text-[11px]">
            {weightUnit === 'VISS' ? 'ပိဿာ (Viss)' : 'ကီလို (Kg)'}
          </span>
        </button>
      </div>

      <div className="border-t border-[#e4e6eb]" />

      {/* 1-Click Role Switcher for Single APK */}
      <div className="space-y-2 p-2.5 rounded-xl bg-white border border-[#e4e6eb] shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#65676b] flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-[#1877F2]" />
            <span>{lang === 'my' ? 'အကောင့်ခွဲ စမ်းသပ်ရန်:' : 'Simulate Role:'}</span>
          </span>
          <button
            onClick={onOpenLoginModal}
            className="text-[10px] text-[#1877F2] hover:underline font-semibold cursor-pointer"
          >
            PIN Login
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onQuickRoleSwitch('ADMIN')}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors text-center cursor-pointer ${
              currentUser.role === 'ADMIN'
                ? 'bg-[#1877F2] text-white shadow-sm'
                : 'bg-[#f0f2f5] text-[#050505] hover:bg-[#e4e6eb]'
            }`}
          >
            Admin HQ
          </button>
          <button
            onClick={() => onQuickRoleSwitch('MANDALAY_STAFF')}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors text-center cursor-pointer ${
              currentUser.role === 'MANDALAY_STAFF'
                ? 'bg-[#1877F2] text-white shadow-sm'
                : 'bg-[#f0f2f5] text-[#050505] hover:bg-[#e4e6eb]'
            }`}
          >
            MDY Gate
          </button>
          <button
            onClick={() => onQuickRoleSwitch('KALAY_STAFF')}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors text-center cursor-pointer ${
              currentUser.role === 'KALAY_STAFF'
                ? 'bg-[#1877F2] text-white shadow-sm'
                : 'bg-[#f0f2f5] text-[#050505] hover:bg-[#e4e6eb]'
            }`}
          >
            Kalay Gate
          </button>
          <button
            onClick={() => onQuickRoleSwitch('DRIVER')}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors text-center cursor-pointer ${
              currentUser.role === 'DRIVER'
                ? 'bg-[#1877F2] text-white shadow-sm'
                : 'bg-[#f0f2f5] text-[#050505] hover:bg-[#e4e6eb]'
            }`}
          >
            Driver
          </button>
        </div>
      </div>

      {/* Cloud & Hub Shortcuts */}
      <div className="space-y-1.5 p-2.5 rounded-xl bg-white border border-[#e4e6eb] shadow-sm text-[11px] text-[#65676b]">
        <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Cloud Firestore: pos-sync-511822</span>
        </div>
        <div className="text-slate-500">
          ဂိတ်: မန္တလေး (၈၄ လမ်း) ⇄ ကလေး (တာဟန်း)
        </div>
      </div>
    </aside>
  );
};
