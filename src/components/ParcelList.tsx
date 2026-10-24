import React, { useState } from 'react';
import { Parcel, ParcelStatus, UserRole, PaymentStatus, WeightUnit } from '../types/bmk';
import { formatMMK, formatNumber, formatWeight, formatRate, getStatusBurmese } from '../utils/formatters';
import { 
  Search, 
  QrCode, 
  Share2, 
  AlertTriangle, 
  ArrowRight, 
  Package, 
  Filter,
  Camera, 
  RotateCcw,
  Zap, 
  BellRing,
  MessageSquare,
  ThumbsUp,
  Globe,
  MoreHorizontal,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface ParcelListProps {
  parcels: Parcel[];
  userRole: UserRole;
  weightUnit: WeightUnit;
  lang: 'my' | 'en';
  onSelectParcelForReceipt: (parcel: Parcel) => void;
  onUpdateStatus: (parcelId: string, newStatus: ParcelStatus) => void;
  onBatchUpdateStatus: (parcelIds: string[], newStatus: ParcelStatus) => void;
  onOpenClaimModal: (parcel: Parcel) => void;
  onOpenBookingModal: () => void;
  onOpenNotificationModal?: (parcel: Parcel, mode: 'INTAKE' | 'ARRIVAL') => void;
}

export const ParcelList: React.FC<ParcelListProps> = ({
  parcels,
  userRole,
  weightUnit,
  lang,
  onSelectParcelForReceipt,
  onUpdateStatus,
  onBatchUpdateStatus,
  onOpenClaimModal,
  onOpenBookingModal,
  onOpenNotificationModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');

  // Scanner & Continuous Batch Mode
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [scannedBatchIds, setScannedBatchIds] = useState<string[]>([]);
  const [recentScannedNotice, setRecentScannedNotice] = useState<string>('');

  // Filtering
  const filteredParcels = parcels.filter((parcel) => {
    const matchesSearch =
      parcel.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.senderPhone.includes(searchTerm) ||
      parcel.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.receiverPhone.includes(searchTerm) ||
      parcel.itemType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || parcel.status === statusFilter;
    const matchesPayment = paymentFilter === 'ALL' || parcel.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleSimulateScan = (idToScan: string) => {
    if (!scannedBatchIds.includes(idToScan)) {
      setScannedBatchIds((prev) => [idToScan, ...prev]);
    }
    setRecentScannedNotice(`စကင်ဖတ်ပြီး: ${idToScan}`);

    if (!isContinuousMode) {
      setTimeout(() => {
        setIsScannerOpen(false);
        setRecentScannedNotice('');
      }, 1500);
    }
  };

  const handleApplyBatchStatus = (targetStatus: ParcelStatus) => {
    if (scannedBatchIds.length === 0) return;
    onBatchUpdateStatus(scannedBatchIds, targetStatus);
    setRecentScannedNotice(`ပစ္စည်း ${scannedBatchIds.length} ခုကို ${getStatusBurmese(targetStatus)} အဖြစ် ပြောင်းလဲပြီးပါပြီ`);
    setScannedBatchIds([]);
  };

  const getNextStatus = (current: ParcelStatus): ParcelStatus | null => {
    switch (current) {
      case 'BOOKED':
        return 'LOADED';
      case 'LOADED':
        return 'IN_TRANSIT';
      case 'IN_TRANSIT':
        return 'ARRIVED_KALAY';
      case 'ARRIVED_KALAY':
        return 'DELIVERED';
      default:
        return null;
    }
  };

  const getNextStatusLabel = (next: ParcelStatus): string => {
    switch (next) {
      case 'LOADED':
        return lang === 'my' ? '၁၂ ဘီးကားပေါ်တင်' : 'Load Truck';
      case 'IN_TRANSIT':
        return lang === 'my' ? 'လမ်းခရီးထွက်' : 'Depart';
      case 'ARRIVED_KALAY':
        return lang === 'my' ? 'ကလေးဂိတ်ရောက်' : 'Arrive Kalay';
      case 'DELIVERED':
        return lang === 'my' ? 'အပ်နှံပြီး' : 'Deliver';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header (Facebook Feed Control Card) */}
      <div className="p-4 rounded-xl border border-[#e4e6eb] bg-white shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Pill Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#65676b]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                lang === 'my'
                  ? 'ဘောင်ချာအမှတ်၊ ပို့သူ/လက်ခံသူ၊ ဖုန်းနံပါတ်ဖြင့် ရှာပါ...'
                  : 'Search by Tracking ID, Name, Phone, or Item...'
              }
              className="w-full pl-9 pr-4 py-2 bg-[#f0f2f5] focus:bg-white focus:ring-2 focus:ring-[#1877F2] focus:outline-none rounded-full text-xs sm:text-sm text-[#050505] placeholder-[#65676b] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-2.5 text-xs text-[#65676b] hover:text-[#050505]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Scanner Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScannerOpen(!isScannerOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isScannerOpen
                  ? 'bg-[#1877F2] text-white shadow-sm'
                  : 'bg-[#f0f2f5] hover:bg-[#e4e6eb] text-[#050505]'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{lang === 'my' ? 'ML Kit စကင်နာ' : 'Batch Scanner'}</span>
            </button>

            <button
              onClick={onOpenBookingModal}
              className="px-3.5 py-2 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs whitespace-nowrap shadow-sm cursor-pointer"
            >
              + {lang === 'my' ? 'ဘောင်ချာအသစ်' : 'New Parcel'}
            </button>
          </div>
        </div>

        {/* Continuous Batch Camera Scanner Panel */}
        {isScannerOpen && (
          <div className="p-4 rounded-xl bg-[#f0f2f5] border border-[#1877F2]/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#1877F2] flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>Google ML Kit Batch Scanner</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px]">
                  Camera Ready
                </span>
              </div>

              <button
                onClick={() => setIsContinuousMode(!isContinuousMode)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  isContinuousMode
                    ? 'bg-[#1877F2] text-white shadow-sm'
                    : 'bg-white text-[#65676b] border border-[#e4e6eb]'
                }`}
              >
                {isContinuousMode ? '⚡ Continuous Mode ON' : 'Single Scan'}
              </button>
            </div>

            {/* Quick Test Barcode Buttons */}
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-[#65676b]">Quick Barcode click:</span>
                {parcels.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSimulateScan(p.id)}
                    className={`px-2 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                      scannedBatchIds.includes(p.id)
                        ? 'bg-[#1877F2] text-white font-bold'
                        : 'bg-white text-[#1877F2] border border-[#e4e6eb] hover:bg-[#e7f3ff]'
                    }`}
                  >
                    {p.id}
                  </button>
                ))}
              </div>

              {scannedBatchIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[#1877F2] font-bold text-xs">
                    {scannedBatchIds.length} Scanned
                  </span>
                  <button
                    onClick={() => setScannedBatchIds([])}
                    className="p-1 text-[#65676b] hover:text-[#050505]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Batch Action Bar if items scanned */}
            {scannedBatchIds.length > 0 && (
              <div className="p-3 rounded-lg bg-white border border-[#e4e6eb] flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[#050505] font-medium">
                  Update <strong>{scannedBatchIds.length}</strong> vouchers to:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleApplyBatchStatus('LOADED')}
                    className="px-2.5 py-1 rounded bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold"
                  >
                    ကားပေါ်တင်ပြီး (Loaded)
                  </button>
                  <button
                    onClick={() => handleApplyBatchStatus('ARRIVED_KALAY')}
                    className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold"
                  >
                    ကလေးရောက် (Arrived)
                  </button>
                  <button
                    onClick={() => handleApplyBatchStatus('DELIVERED')}
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    အပ်နှံပြီး (Delivered)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filter Segmented Controls (Facebook Pills Style) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#e4e6eb] text-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {[
              { key: 'ALL', label: lang === 'my' ? 'အားလုံး' : 'All' },
              { key: 'BOOKED', label: lang === 'my' ? 'ဂိတ်လက်ခံ' : 'Booked' },
              { key: 'LOADED', label: lang === 'my' ? 'ကားတင်ပြီး' : 'Loaded' },
              { key: 'IN_TRANSIT', label: lang === 'my' ? 'လမ်းခရီး' : 'In Transit' },
              { key: 'ARRIVED_KALAY', label: lang === 'my' ? 'ကလေးရောက်' : 'Arrived' },
              { key: 'DELIVERED', label: lang === 'my' ? 'အပ်နှံပြီး' : 'Delivered' },
              { key: 'CLAIMED_LOST', label: lang === 'my' ? 'လျော်ကြေး' : 'Claimed' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.key
                    ? 'bg-[#e7f3ff] text-[#1877F2]'
                    : 'text-[#65676b] hover:bg-[#f0f2f5]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Payment filter */}
          <div className="flex items-center gap-1">
            {[
              { key: 'ALL', label: 'All Pay' },
              { key: 'PAID', label: 'Paid' },
              { key: 'COD', label: 'COD' },
              { key: 'UNPAID', label: 'Unpaid' },
            ].map((pTab) => (
              <button
                key={pTab.key}
                onClick={() => setPaymentFilter(pTab.key)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer ${
                  paymentFilter === pTab.key
                    ? 'bg-[#1877F2] text-white'
                    : 'text-[#65676b] hover:bg-[#f0f2f5]'
                }`}
              >
                {pTab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Parcels List (Facebook Post Cards) */}
      <div className="space-y-4">
        {filteredParcels.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-[#e4e6eb] bg-white shadow-sm space-y-3">
            <Package className="w-12 h-12 text-[#65676b] mx-auto opacity-50" />
            <div className="text-[#050505] font-bold text-base">
              {lang === 'my' ? 'ကုန်စည်မှတ်တမ်း မတွေ့ရှိပါ' : 'No Parcels Found'}
            </div>
            <p className="text-xs text-[#65676b]">
              {lang === 'my'
                ? 'ရှာဖွေမှု စာသား သို့မဟုတ် Filter ကို ပြောင်းလဲ စစ်ဆေးကြည့်ပါ။'
                : 'Try adjusting your search query or status filter.'}
            </p>
          </div>
        ) : (
          filteredParcels.map((parcel) => {
            const nextStatus = getNextStatus(parcel.status);

            return (
              <article
                key={parcel.id}
                className="bg-white rounded-xl shadow-sm border border-[#e4e6eb] overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Facebook Post Header */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* BMK Blue Avatar */}
                    <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-black text-sm shadow shrink-0">
                      BMK
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-[#050505] hover:underline cursor-pointer">
                          BMK Express Logistics
                        </span>
                        <span className="text-[11px] text-[#65676b]">·</span>
                        <span className="text-[11px] text-[#65676b]">
                          {parcel.bookedByStaff || 'MDY Staff'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-[#65676b]">
                        <span>{new Date(parcel.createdAt).toLocaleDateString('my-MM')}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5" title="Public Gate Record">
                          <Globe className="w-3 h-3 text-[#65676b]" />
                          <span>မန္တလေး ➔ ကလေး</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tracking ID Badge & Payment Pill */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-[#e7f3ff] text-[#1877F2] font-mono font-bold text-xs">
                      {parcel.id}
                    </span>
                    <button
                      onClick={() => onSelectParcelForReceipt(parcel)}
                      className="p-1 rounded-full hover:bg-[#f0f2f5] text-[#65676b] transition-colors"
                      title="More details"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Facebook Post Caption */}
                <div className="px-3.5 sm:px-4 pb-2 text-xs sm:text-sm text-[#050505]">
                  <p>
                    📦 <strong className="text-[#1877F2]">{parcel.itemType}</strong> {parcel.packageCount} ထုပ်/ဖာ အား မန္တလေးဂိတ်တွင် စနစ်တကျ လက်ခံပြီး ဘောင်ချာဖွင့်လှစ်ပြီးပါပြီ။ 
                    လက်ခံသူ <strong className="font-semibold">{parcel.receiverName}</strong> (ကလေးမြို့) ထံသို့ ၁၂ ဘီးကားဖြင့် ပို့ဆောင်ပေးပါမည်။
                  </p>
                </div>

                {/* Facebook Post Attachment / Media Card (Logistics Slip Box) */}
                <div className="mx-3.5 sm:mx-4 mb-3 p-3.5 rounded-xl bg-[#f0f2f5] border border-[#e4e6eb] space-y-3 text-xs">
                  {/* Route & Status Banner */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#e4e6eb]">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#1877F2] uppercase tracking-wide">
                        မန္တလေးဂိတ် ➔ ကလေးဂိတ်
                      </span>
                      {parcel.isBulkyGoods && (
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                          📦 ကုန်ပွစျေး
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          parcel.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : parcel.paymentStatus === 'COD'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {parcel.paymentStatus === 'PAID'
                          ? 'ရှင်းပြီး (PAID)'
                          : parcel.paymentStatus === 'COD'
                          ? 'ကလေးရောက်ငွေချေ (COD)'
                          : 'မရှင်းရသေး (UNPAID)'}
                      </span>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-[#050505] border border-[#e4e6eb]">
                        {getStatusBurmese(parcel.status)}
                      </span>
                    </div>
                  </div>

                  {/* Sender & Receiver 2-Column Split */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white p-2.5 rounded-lg border border-[#e4e6eb] space-y-0.5">
                      <span className="text-[#65676b] block text-[10px] font-medium">📤 ပို့သူ (မန္တလေး):</span>
                      <div className="font-bold text-[#050505]">{parcel.senderName}</div>
                      <div className="font-mono text-[#1877F2] text-[11px]">{parcel.senderPhone}</div>
                      <div className="text-[10px] text-[#65676b] truncate">{parcel.senderAddress}</div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-[#e4e6eb] space-y-0.5">
                      <span className="text-[#65676b] block text-[10px] font-medium">📥 လက်ခံသူ (ကလေးမြို့):</span>
                      <div className="font-bold text-[#050505]">{parcel.receiverName}</div>
                      <div className="font-mono text-[#1877F2] text-[11px]">{parcel.receiverPhone}</div>
                      <div className="text-[10px] text-[#65676b] truncate">{parcel.receiverAddress}</div>
                    </div>
                  </div>

                  {/* Weight, Rate & Fee Footer Strip */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div>
                      <span className="text-[#65676b] block text-[10px]">အလေးချိန် နှင့် နှုန်းထား:</span>
                      <span className="font-bold text-[#050505] font-mono">
                        {formatWeight(parcel.weightViss, weightUnit, lang)}
                      </span>
                      <span className="text-[#65676b] text-[10px] ml-1">
                        ({formatRate(parcel.customerRatePerViss, weightUnit, lang)})
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[#65676b] block text-[10px]">စုစုပေါင်း ပို့ဆောင်ခ:</span>
                      <span className="font-black text-sm text-emerald-600 font-mono">
                        {formatMMK(parcel.totalDeliveryFee)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Facebook Reactions Strip (Like & Comments counter) */}
                <div className="px-4 py-2 flex items-center justify-between text-xs text-[#65676b] border-t border-[#e4e6eb]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px]">
                      👍
                    </span>
                    <span className="hover:underline cursor-pointer">
                      ၁၂ ဘီးယာဉ်မောင်း နှင့် အခြား 18 ဦး
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {parcel.notifiedArrivalAt ? (
                      <span className="text-purple-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ဆိုက်ရောက်စာပို့ပြီး</span>
                      </span>
                    ) : parcel.notifiedIntakeAt ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ဘောင်ချာစာပို့ပြီး</span>
                      </span>
                    ) : (
                      <span className="text-[#65676b]">အသိပေးစာ မပို့ရသေး</span>
                    )}
                  </div>
                </div>

                {/* Facebook Action Bar (Like, Comment, Share, Action buttons) */}
                <div className="border-t border-[#e4e6eb] px-2 py-1 grid grid-cols-2 sm:grid-cols-4 gap-1">
                  {/* Action 1: Next Status Workflow (Facebook Like button style) */}
                  {nextStatus ? (
                    <button
                      onClick={() => onUpdateStatus(parcel.id, nextStatus)}
                      className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg hover:bg-[#f2f2f2] text-[#1877F2] font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="truncate">{getNextStatusLabel(nextStatus)}</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 py-2 px-2 text-emerald-600 font-semibold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ပြီးစီး (Done)</span>
                    </div>
                  )}

                  {/* Action 2: Customer Notification (Facebook Comment / Messenger style) */}
                  <button
                    onClick={() =>
                      onOpenNotificationModal &&
                      onOpenNotificationModal(
                        parcel,
                        parcel.status === 'ARRIVED_KALAY' ? 'ARRIVAL' : 'INTAKE'
                      )
                    }
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg hover:bg-[#f2f2f2] text-[#65676b] hover:text-purple-600 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="truncate">
                      {parcel.status === 'ARRIVED_KALAY' ? 'အရောက်ပို့ (Viber)' : 'ဘောင်ချာပို့ (SMS)'}
                    </span>
                  </button>

                  {/* Action 3: Receipt & Sticker (Facebook Share style) */}
                  <button
                    onClick={() => onSelectParcelForReceipt(parcel)}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg hover:bg-[#f2f2f2] text-[#65676b] hover:text-[#050505] font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="truncate">{lang === 'my' ? 'ဘောင်ချာပြေစာ' : 'Voucher'}</span>
                  </button>

                  {/* Action 4: Claim / Report Loss */}
                  {parcel.status !== 'CLAIMED_LOST' ? (
                    <button
                      onClick={() => onOpenClaimModal(parcel)}
                      className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg hover:bg-[#f2f2f2] text-[#65676b] hover:text-rose-600 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span className="truncate">{lang === 'my' ? 'လျော်ကြေး' : 'Claim'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-center py-2 text-rose-500 font-semibold text-xs">
                      <span>လျော်ပြီး</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
