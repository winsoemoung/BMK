import React, { useEffect, useState } from 'react';
import { Parcel, WeightUnit } from '../types/bmk';
import { formatMMK, formatNumber, rateVissToKg, vissToKg, generateQrDataUrl, generateViberReceiptText, generateSmsReceiptText, getStatusBurmese, openViberShare, openSmsApp } from '../utils/formatters';
import { X, Copy, Check, Printer, Share2, MessageSquare, Bluetooth, Tag, Receipt, Send, BellRing } from 'lucide-react';

interface DigitalReceiptModalProps {
  parcel: Parcel | null;
  onClose: () => void;
  weightUnit?: WeightUnit;
  lang: 'my' | 'en';
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  parcel,
  onClose,
  weightUnit = 'VISS',
  lang,
}) => {
  if (!parcel) return null;

  const [activeView, setActiveView] = useState<'voucher' | 'thermal_sticker'>('voucher');
  const [qrSrc, setQrSrc] = useState<string>('');
  const [copiedViber, setCopiedViber] = useState(false);
  const [copiedSms, setCopiedSms] = useState(false);
  const [isBluetoothConnecting, setIsBluetoothConnecting] = useState(false);
  const [bluetoothSuccess, setBluetoothSuccess] = useState(false);

  const weightInKg = vissToKg(parcel.weightViss);
  const rateInKg = rateVissToKg(parcel.customerRatePerViss);

  useEffect(() => {
    let isMounted = true;
    generateQrDataUrl(parcel.qrCode || parcel.id).then((url) => {
      if (isMounted) setQrSrc(url);
    });
    return () => {
      isMounted = false;
    };
  }, [parcel]);

  const handleCopyViber = () => {
    const text = generateViberReceiptText(parcel, weightUnit);
    navigator.clipboard.writeText(text);
    setCopiedViber(true);
    setTimeout(() => setCopiedViber(false), 2500);
  };

  const handleCopySms = () => {
    const text = generateSmsReceiptText(parcel);
    navigator.clipboard.writeText(text);
    setCopiedSms(true);
    setTimeout(() => setCopiedSms(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePrintBluetoothThermal = () => {
    setIsBluetoothConnecting(true);
    setTimeout(() => {
      setIsBluetoothConnecting(false);
      setBluetoothSuccess(true);
      setTimeout(() => setBluetoothSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto font-sans">
      <div className="relative w-full max-w-lg bg-white border border-[#e4e6eb] rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Facebook Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e4e6eb] bg-[#f0f2f5]">
          <div className="flex items-center gap-2">
            {/* View Switcher: Voucher Slip vs Bluetooth Sticker */}
            <div className="inline-flex rounded-lg bg-white border border-[#e4e6eb] p-0.5 text-xs shadow-xs">
              <button
                onClick={() => setActiveView('voucher')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  activeView === 'voucher'
                    ? 'bg-[#1877F2] text-white shadow-xs'
                    : 'text-[#65676b] hover:text-[#050505]'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? 'ဘောင်ချာပြေစာ' : 'Voucher Slip'}</span>
              </button>
              <button
                onClick={() => setActiveView('thermal_sticker')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  activeView === 'thermal_sticker'
                    ? 'bg-[#1877F2] text-white shadow-xs'
                    : 'text-[#65676b] hover:text-[#050505]'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? '🏷️ ဘလူးတုသ် စတစ်ကာ' : 'Thermal Sticker'}</span>
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] text-[#050505] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* VIEW 1: Standard Customer Voucher Slip */}
          {activeView === 'voucher' && (
            <div
              id="printable-receipt"
              className="p-5 rounded-xl bg-white text-slate-900 font-sans shadow-xs border border-[#ccd0d5] text-xs space-y-3"
            >
              {/* Header */}
              <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-1">
                <div className="font-extrabold text-base tracking-tight text-slate-900">
                  BMK EXPRESS LOGISTICS
                </div>
                <div className="text-slate-600 font-medium">
                  မန္တလေး ⇄ ကလေး အမြန်ကုန်စည်ပို့ဆောင်ရေး
                </div>
                <div className="text-[10px] text-slate-500">
                  မန္တလေးဂိတ်: ၈၄ လမ်း · ကလေးဂိတ်: တာဟန်းရပ်ကွက်
                </div>
                <div className="font-mono text-[11px] font-bold text-slate-800 pt-1">
                  ဘောင်ချာအမှတ်: {parcel.id}
                </div>
              </div>

              {/* QR Code & Status */}
              <div className="flex items-center justify-center gap-4 py-2 border-b border-dashed border-slate-300">
                {qrSrc ? (
                  <img
                    src={qrSrc}
                    alt="QR Code"
                    className="w-24 h-24 rounded border border-slate-200"
                  />
                ) : (
                  <div className="w-24 h-24 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                    QR Code
                  </div>
                )}
                <div className="space-y-1 text-left">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
                    ပို့ဆောင်မှုအခြေအနေ
                  </span>
                  <span className="font-bold text-slate-900 block text-xs">
                    {getStatusBurmese(parcel.status)}
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      parcel.paymentStatus === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : parcel.paymentStatus === 'COD'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {parcel.paymentStatus === 'PAID'
                      ? 'ငွေရှင်းပြီး (PAID)'
                      : parcel.paymentStatus === 'COD'
                      ? 'ကလေးရောက်မှငွေချေ (COD)'
                      : 'မရှင်းရသေး'}
                  </span>
                </div>
              </div>

              {/* Sender & Receiver Info */}
              <div className="grid grid-cols-2 gap-3 py-2 border-b border-dashed border-slate-300 text-[11px]">
                <div className="space-y-0.5">
                  <span className="text-slate-500 block font-semibold">ပို့သူ (မန္တလေး):</span>
                  <div className="font-bold text-slate-900">{parcel.senderName}</div>
                  <div className="font-mono text-slate-700">{parcel.senderPhone}</div>
                  <div className="text-[10px] text-slate-500">{parcel.senderAddress}</div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-500 block font-semibold">လက်ခံသူ (ကလေး):</span>
                  <div className="font-bold text-slate-900">{parcel.receiverName}</div>
                  <div className="font-mono text-slate-700">{parcel.receiverPhone}</div>
                  <div className="text-[10px] text-slate-500">{parcel.receiverAddress}</div>
                </div>
              </div>

              {/* Goods Details */}
              <div className="space-y-1 py-1 border-b border-dashed border-slate-300 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">ကုန်စည်အမျိုးအစား:</span>
                  <span className="font-semibold text-slate-900">{parcel.itemType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">အရေအတွက်:</span>
                  <span className="font-semibold text-slate-900">{parcel.packageCount} ထုပ်</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">အလေးချိန်:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatNumber(parcel.weightViss, 1)} ပိဿာ (~ {formatNumber(weightInKg, 1)} Kg)
                  </span>
                </div>
                {parcel.isBulkyGoods && (
                  <div className="flex justify-between items-center text-purple-700 font-semibold">
                    <span>ကုန်ပွအထူးနှုန်း:</span>
                    <span>{formatNumber(parcel.customerRatePerViss)} ကျပ်/ပိဿာ</span>
                  </div>
                )}
                {parcel.itemDescription && (
                  <div className="text-[10px] text-slate-500 italic pt-0.5">
                    မှတ်ချက်: {parcel.itemDescription}
                  </div>
                )}
              </div>

              {/* Financial Calculation */}
              <div className="pt-2 space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-900">
                  <span>ပို့ဆောင်ခ စုစုပေါင်း:</span>
                  <span className="font-mono text-sm text-[#1877F2]">
                    {formatMMK(parcel.totalDeliveryFee)}
                  </span>
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-center pt-3 text-[10px] text-slate-500 border-t border-slate-200">
                BMK Express အား ရွေးချယ်အသုံးပြုမှုအတွက် အထူးပင် ကျေးဇူးတင်ရှိပါသည်။
              </div>
            </div>
          )}

          {/* VIEW 2: Bluetooth 58mm / 80mm Thermal Barcode Sticker */}
          {activeView === 'thermal_sticker' && (
            <div className="space-y-4">
              <div
                id="thermal-sticker"
                className="w-full max-w-[320px] mx-auto p-4 bg-white text-black font-mono border-2 border-black rounded-lg text-xs space-y-2.5 shadow-sm"
              >
                {/* Sticker Header */}
                <div className="text-center border-b-2 border-black pb-2">
                  <div className="font-black text-sm tracking-tighter">BMK EXPRESS CAR GATE</div>
                  <div className="text-[10px] font-bold">မန္တလေး ➔ ကလေး အမြန်ကုန်တင်</div>
                </div>

                {/* Big Route Stamp */}
                <div className="flex items-center justify-between border-b-2 border-black py-1.5 font-bold">
                  <span className="text-base bg-black text-white px-2 py-0.5 rounded">MDY ➔ KLY</span>
                  <span className="text-xs">{parcel.paymentStatus}</span>
                </div>

                {/* Receiver Focus */}
                <div className="space-y-1 border-b border-black pb-2">
                  <div className="text-[10px] text-gray-600">လက်ခံသူ (ကလေးမြို့):</div>
                  <div className="font-black text-sm">{parcel.receiverName}</div>
                  <div className="font-bold text-xs">{parcel.receiverPhone}</div>
                  <div className="text-[10px] truncate">{parcel.receiverAddress}</div>
                </div>

                {/* Goods & Weight */}
                <div className="grid grid-cols-2 gap-1 text-[11px] border-b border-black pb-1.5 font-bold">
                  <div>
                    <span className="block text-[9px] text-gray-600">အလေးချိန်:</span>
                    <span>{formatNumber(parcel.weightViss, 1)} ပိဿာ</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-600">အရေအတွက်:</span>
                    <span>{parcel.packageCount} ထုပ်</span>
                  </div>
                </div>

                {/* Barcode & ID */}
                <div className="text-center pt-1">
                  {qrSrc && <img src={qrSrc} alt="QR" className="w-20 h-20 mx-auto" />}
                  <div className="font-black text-xs mt-1 tracking-widest">{parcel.id}</div>
                </div>
              </div>

              {/* Thermal Print Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePrintBluetoothThermal}
                  disabled={isBluetoothConnecting}
                  className="w-full py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bluetooth className="w-4 h-4" />
                  <span>
                    {isBluetoothConnecting
                      ? 'Bluetooth ပရင့်တာသို့ ပို့နေပါသည်...'
                      : bluetoothSuccess
                      ? 'စတစ်ကာ ထုတ်ပြီးပါပြီ! (Printed)'
                      : 'ဘလူးတုသ်ဖြင့် စတစ်ကာထုတ်မည် (Print Sticker)'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Customer Experience Auto Notification Section */}
          <div className="space-y-2.5 pt-2 border-t border-[#e4e6eb]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#050505] font-bold flex items-center gap-1.5">
                <BellRing className="w-4 h-4 text-[#1877F2]" />
                <span>{lang === 'my' ? 'ဖောက်သည်ထံသို့ ဘောင်ချာ အသိပေးစာ ပို့ရန် (Viber / SMS):' : 'Instant Customer Notification:'}</span>
              </span>
              <span className="text-[11px] text-[#65676b] font-mono font-semibold">
                {parcel.receiverPhone}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const text = generateViberReceiptText(parcel, weightUnit);
                  openViberShare(text);
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#7360f2] hover:bg-[#624ee0] text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Viber အက်ပ်ဖြင့် တိုက်ရိုက်ပို့မည်</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const text = generateSmsReceiptText(parcel);
                  openSmsApp(parcel.receiverPhone, text);
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>SMS စာတို တိုက်ရိုက်ပို့မည်</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyViber}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-[#f0f2f5] hover:bg-[#e4e6eb] text-[#050505] font-semibold text-xs border border-[#e4e6eb] transition-colors cursor-pointer"
              >
                {copiedViber ? <Check className="w-3.5 h-3.5 text-purple-600" /> : <Copy className="w-3.5 h-3.5 text-purple-600" />}
                <span>{copiedViber ? 'Viber ကူးယူပြီး!' : 'Viber စာသားကူး'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopySms}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-[#f0f2f5] hover:bg-[#e4e6eb] text-[#050505] font-semibold text-xs border border-[#e4e6eb] transition-colors cursor-pointer"
              >
                {copiedSms ? <Check className="w-3.5 h-3.5 text-[#1877F2]" /> : <Copy className="w-3.5 h-3.5 text-[#1877F2]" />}
                <span>{copiedSms ? 'SMS ကူးယူပြီး!' : 'SMS စာသားကူး'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-[#f0f2f5] hover:bg-[#e4e6eb] text-[#050505] font-semibold text-xs border border-[#e4e6eb] transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#65676b]" />
                <span>{lang === 'my' ? 'ပြေစာ ပရင့်ထုတ်' : 'Print Voucher'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
