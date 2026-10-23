import React, { useState } from 'react';
import { Parcel, ParcelStatus, UserRole, PaymentStatus } from '../types/bmk';
import { formatMMK, formatNumber, getStatusBurmese } from '../utils/formatters';
import { 
  Search, 
  QrCode, 
  Share2, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  Truck, 
  Package, 
  Filter,
  Camera
} from 'lucide-react';

interface ParcelListProps {
  parcels: Parcel[];
  userRole: UserRole;
  lang: 'my' | 'en';
  onSelectParcelForReceipt: (parcel: Parcel) => void;
  onUpdateStatus: (parcelId: string, newStatus: ParcelStatus) => void;
  onOpenClaimModal: (parcel: Parcel) => void;
  onOpenBookingModal: () => void;
}

export const ParcelList: React.FC<ParcelListProps> = ({
  parcels,
  userRole,
  lang,
  onSelectParcelForReceipt,
  onUpdateStatus,
  onOpenClaimModal,
  onOpenBookingModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedResult, setScannedResult] = useState('');

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
    setSearchTerm(idToScan);
    setScannedResult(`Found: ${idToScan}`);
    setTimeout(() => {
      setIsScannerOpen(false);
      setScannedResult('');
    }, 1200);
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
        return lang === 'my' ? '၁၂ ဘီးကားပေါ်တင်မည်' : 'Load to Truck';
      case 'IN_TRANSIT':
        return lang === 'my' ? 'လမ်းခရီးသို့ ထွက်ခွာမည်' : 'Depart (In Transit)';
      case 'ARRIVED_KALAY':
        return lang === 'my' ? 'ကလေးဂိတ် ဆိုက်ရောက်' : 'Arrived at Kalay';
      case 'DELIVERED':
        return lang === 'my' ? 'လူကြီးမင်းထံ အပ်နှံပြီး' : 'Mark Delivered';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-5">
      {/* Search, Filter Bar and Scanner Trigger */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                lang === 'my'
                  ? 'ဘောင်ချာအမှတ်၊ ပို့သူ/လက်ခံသူ အမည်၊ ဖုန်းနံပါတ်ဖြင့် ရှာဖွေပါ...'
                  : 'Search by Tracking ID, Name, Phone, or Item...'
              }
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Barcode / QR Scanner Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScannerOpen(!isScannerOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                isScannerOpen
                  ? 'bg-amber-400 text-slate-950 border-amber-400'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{lang === 'my' ? 'QR / Barcode စကင်နာ' : 'QR Scanner'}</span>
            </button>

            <button
              onClick={onOpenBookingModal}
              className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs whitespace-nowrap"
            >
              + {lang === 'my' ? 'ပစ္စည်းအသစ်သွင်း' : 'New Parcel'}
            </button>
          </div>
        </div>

        {/* QR Scanner Simulation Panel */}
        {isScannerOpen && (
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                <QrCode className="w-4 h-4" />
                {lang === 'my' ? 'ကင်မရာ / Barcode Scanner အသုံးပြုခြင်း' : 'Live Camera / Barcode Scanner'}
              </span>
              <span className="text-slate-400 text-[11px]">
                {lang === 'my' ? 'ဘောင်ချာ QR Code ကို ချိန်ပါ' : 'Align parcel QR code in frame'}
              </span>
            </div>

            {/* Simulated viewfinder */}
            <div className="h-32 rounded-lg border-2 border-dashed border-amber-500/40 bg-slate-900/60 flex flex-col items-center justify-center p-3 relative overflow-hidden">
              <div className="w-24 h-24 border border-amber-400/70 rounded flex items-center justify-center relative">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-400 animate-pulse" />
                <span className="text-[10px] text-amber-300">Aim QR</span>
              </div>
              {scannedResult && (
                <div className="absolute inset-0 bg-emerald-950/90 flex items-center justify-center font-bold text-emerald-400 text-xs">
                  {scannedResult}
                </div>
              )}
            </div>

            {/* Quick click to test scan */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-400">
                {lang === 'my' ? 'လျင်မြန်စွာ စမ်းသပ်စကင်ဖတ်ရန်:' : 'Sample barcode test:'}
              </span>
              {parcels.slice(0, 3).map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSimulateScan(p.id)}
                  className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-amber-300 hover:bg-slate-700"
                >
                  {p.id}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter Tabs: Status & Payment */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/80 text-xs">
          {/* Status segmented buttons */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <span className="text-slate-500 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>{lang === 'my' ? 'အခြေအနေ:' : 'Status:'}</span>
            </span>
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
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap text-xs ${
                  statusFilter === tab.key
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-950'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Payment filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium mr-1">{lang === 'my' ? 'ငွေရှင်း:' : 'Pay:'}</span>
            {[
              { key: 'ALL', label: 'All' },
              { key: 'PAID', label: 'Paid' },
              { key: 'COD', label: 'COD' },
              { key: 'UNPAID', label: 'Unpaid' },
            ].map((pTab) => (
              <button
                key={pTab.key}
                onClick={() => setPaymentFilter(pTab.key)}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  paymentFilter === pTab.key
                    ? 'bg-slate-700 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {pTab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Parcel Cards List */}
      <div className="space-y-3">
        {filteredParcels.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
            <Package className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-slate-300 font-medium">
              {lang === 'my' ? 'ကုန်စည်မှတ်တမ်း မတွေ့ရှိပါ' : 'No Parcels Found'}
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'my'
                ? 'ရှာဖွေမှု စာသား သို့မဟုတ် Filter ကို ပြောင်းလဲ စစ်ဆေးကြည့်ပါ။'
                : 'Try adjusting your search query or status filter.'}
            </p>
          </div>
        ) : (
          filteredParcels.map((parcel) => {
            const nextStatus = getNextStatus(parcel.status);

            return (
              <div
                key={parcel.id}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-700/80 transition-all space-y-4"
              >
                {/* Row 1: ID, Date, Status, Payment */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 text-sm">{parcel.id}</span>
                    <span className="text-slate-500 text-xs">·</span>
                    <span className="text-slate-400 text-xs">
                      {new Date(parcel.createdAt).toLocaleDateString('my-MM')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Payment tag */}
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        parcel.paymentStatus === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : parcel.paymentStatus === 'COD'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {parcel.paymentStatus === 'PAID'
                        ? 'ငွေရှင်းပြီး (Paid)'
                        : parcel.paymentStatus === 'COD'
                        ? 'ကလေးရောက်ငွေချေ (COD)'
                        : 'မရှင်းရသေး (Unpaid)'}
                    </span>

                    {/* Status tag */}
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded font-bold ${
                        parcel.status === 'DELIVERED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : parcel.status === 'IN_TRANSIT'
                          ? 'bg-sky-500/20 text-sky-300'
                          : parcel.status === 'ARRIVED_KALAY'
                          ? 'bg-purple-500/20 text-purple-300'
                          : parcel.status === 'CLAIMED_LOST'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {getStatusBurmese(parcel.status)}
                    </span>
                  </div>
                </div>

                {/* Row 2: Sender & Receiver Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Sender (Mandalay) */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 space-y-1">
                    <span className="text-slate-400 block font-medium">
                      📤 {lang === 'my' ? 'ပို့သူ (မန္တလေးဂိတ်)' : 'Sender (Mandalay):'}
                    </span>
                    <div className="font-bold text-white text-sm">{parcel.senderName}</div>
                    <div className="font-mono text-slate-300">{parcel.senderPhone}</div>
                    <div className="text-slate-400 truncate">{parcel.senderAddress}</div>
                  </div>

                  {/* Receiver (Kalay) */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 space-y-1">
                    <span className="text-slate-400 block font-medium">
                      📥 {lang === 'my' ? 'လက်ခံသူ (ကလေးမြို့)' : 'Receiver (Kalay):'}
                    </span>
                    <div className="font-bold text-white text-sm">{parcel.receiverName}</div>
                    <div className="font-mono text-slate-300">{parcel.receiverPhone}</div>
                    <div className="text-slate-400 truncate">{parcel.receiverAddress}</div>
                  </div>
                </div>

                {/* Row 3: Weight, Rate & Delivery Fee */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block">{lang === 'my' ? 'အမျိုးအစား' : 'Item'}</span>
                      <span className="font-medium text-slate-200">{parcel.itemType}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{lang === 'my' ? 'အလေးချိန်' : 'Weight'}</span>
                      <span className="font-bold font-mono text-amber-400 text-sm">
                        {parcel.weightViss} ပိသာ
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{lang === 'my' ? 'နှုန်းထား' : 'Rate'}</span>
                      <span className="font-mono text-slate-300">1,200 MMK/ပိသာ</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">
                      {lang === 'my' ? 'စုစုပေါင်း ဝန်ဆောင်ခ' : 'Total Delivery Fee'}
                    </span>
                    <span className="text-lg font-bold font-mono text-emerald-400">
                      {formatMMK(parcel.totalDeliveryFee)}
                    </span>
                  </div>
                </div>

                {/* Row 4: Action Buttons (Receipt, Advance Status, File Claim) */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    {/* View Digital Receipt & QR */}
                    <button
                      onClick={() => onSelectParcelForReceipt(parcel)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'my' ? 'ဘောင်ချာ / Viber ပို့မည်' : 'Viber Receipt'}</span>
                    </button>

                    {/* Report Claim / Damage (if not already claimed) */}
                    {parcel.status !== 'CLAIMED_LOST' && (
                      <button
                        onClick={() => onOpenClaimModal(parcel)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 border border-rose-900/40 text-xs transition-colors"
                        title="Report lost or damaged cargo for compensation"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{lang === 'my' ? 'ပျောက်ဆုံး/ပျက်စီး လျော်ကြေးတင်' : 'Report Loss'}</span>
                      </button>
                    )}
                  </div>

                  {/* Next Step Workflow Action Button */}
                  {nextStatus && (
                    <button
                      onClick={() => onUpdateStatus(parcel.id, nextStatus)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm active:scale-95 transition-all"
                    >
                      <span>{getNextStatusLabel(nextStatus)}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
