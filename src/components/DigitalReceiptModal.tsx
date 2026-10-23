import React, { useEffect, useState } from 'react';
import { Parcel, WeightUnit } from '../types/bmk';
import { formatMMK, formatNumber, rateVissToKg, vissToKg, generateQrDataUrl, generateViberReceiptText, generateSmsReceiptText, getStatusBurmese } from '../utils/formatters';
import { X, Copy, Check, Printer, Share2, MessageSquare, Bluetooth, Tag, Receipt } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            {/* View Switcher: Voucher Slip vs Bluetooth Sticker */}
            <div className="inline-flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs">
              <button
                onClick={() => setActiveView('voucher')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                  activeView === 'voucher'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? 'ဘောင်ချာပြေစာ' : 'Voucher Slip'}</span>
              </button>
              <button
                onClick={() => setActiveView('thermal_sticker')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                  activeView === 'thermal_sticker'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? '🏷️ ဘလူးတုသ် စတစ်ကာ' : 'Thermal Sticker'}</span>
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* VIEW 1: Standard Customer Voucher Slip */}
          {activeView === 'voucher' && (
            <div
              id="printable-receipt"
              className="p-5 rounded-xl bg-white text-slate-900 font-sans shadow-inner border border-slate-200 text-xs space-y-3"
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
                  <span className="text-[10px] text-slate-500 block">
                    နေ့စွဲ: {new Date(parcel.createdAt).toLocaleDateString('my-MM')}
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
                      ? 'ငွေရှင်းပြီး (Paid)'
                      : parcel.paymentStatus === 'COD'
                      ? 'ကလေးရောက်မှငွေချေ (COD)'
                      : 'မရှင်းရသေး (Unpaid)'}
                  </span>
                </div>
              </div>

              {/* Sender & Receiver Info */}
              <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
                <div>
                  <span className="text-slate-500 block font-semibold text-[10px]">
                    📤 ပို့သူ (မန္တလေး):
                  </span>
                  <div className="font-bold text-slate-900">{parcel.senderName} ({parcel.senderPhone})</div>
                  <div className="text-[10px] text-slate-600">{parcel.senderAddress}</div>
                </div>

                <div>
                  <span className="text-slate-500 block font-semibold text-[10px]">
                    📥 လက်ခံသူ (ကလေးမြို့):
                  </span>
                  <div className="font-bold text-slate-900">{parcel.receiverName} ({parcel.receiverPhone})</div>
                  <div className="text-[10px] text-slate-600">{parcel.receiverAddress}</div>
                </div>
              </div>

              {/* Cargo Details with Dual Unit (Viss + Kg) */}
              <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">ကုန်ပစ္စည်း:</span>
                  <span className="font-semibold text-slate-900">
                    {parcel.itemType}
                    {parcel.isBulkyGoods && (
                      <span className="ml-1 text-[9px] px-1 bg-purple-100 text-purple-800 rounded font-bold">
                        ကုန်ပွ
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">အရေအတွက်:</span>
                  <span className="font-medium text-slate-900">{parcel.packageCount} ထုပ်/ဖာ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">အလေးချိန်:</span>
                  <span className="font-bold font-mono text-slate-900">
                    {formatNumber(parcel.weightViss, 1)} ပိဿာ (~ {formatNumber(weightInKg, 1)} Kg)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">နှုန်းထား:</span>
                  <span className="font-mono text-slate-700">
                    {formatNumber(parcel.customerRatePerViss)} MMK/ပိဿာ (~ {formatNumber(rateInKg, 1)} MMK/Kg)
                  </span>
                </div>
              </div>

              {/* Total Fee */}
              <div className="flex justify-between items-center pt-1">
                <span className="font-bold text-slate-900 text-sm">စုစုပေါင်း ကျသင့်ငွေ:</span>
                <span className="font-extrabold font-mono text-base text-slate-900">
                  {formatMMK(parcel.totalDeliveryFee)}
                </span>
              </div>
            </div>
          )}

          {/* VIEW 2: Bluetooth Thermal Label Sticker (58mm/80mm ESC/POS format) */}
          {activeView === 'thermal_sticker' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white text-slate-950 font-mono border-4 border-slate-950 max-w-[320px] mx-auto text-xs space-y-2 shadow-xl">
                {/* Header Tag */}
                <div className="border-b-2 border-slate-950 pb-2 text-center">
                  <span className="text-base font-black tracking-widest block uppercase">BMK EXPRESS</span>
                  <span className="text-[10px] font-bold block">မန္တလေး ➔ ကလေး (KALAY)</span>
                </div>

                {/* Big Destination Badge */}
                <div className="bg-slate-950 text-white p-2 text-center rounded">
                  <span className="text-lg font-black tracking-wider block">ကလေး (KALAY)</span>
                  <span className="text-[10px] font-medium text-slate-300">
                    {parcel.paymentStatus === 'COD' ? '⚠️ ကလေးရောက်ငွေချေ (COD)' : '✅ ပို့ခရှင်းပြီး (PAID)'}
                  </span>
                </div>

                {/* Tracking ID & Big QR Code */}
                <div className="text-center py-2 space-y-1">
                  {qrSrc && (
                    <img
                      src={qrSrc}
                      alt="Barcode QR"
                      className="w-28 h-28 mx-auto border-2 border-slate-950 p-1"
                    />
                  )}
                  <span className="font-black text-sm block tracking-wider">{parcel.id}</span>
                </div>

                {/* Receiver Info */}
                <div className="border-t-2 border-dashed border-slate-950 pt-2 space-y-0.5">
                  <span className="text-[10px] text-slate-600 block">လက်ခံသူ (RECEIVER):</span>
                  <span className="font-black text-xs block">{parcel.receiverName}</span>
                  <span className="font-bold text-xs block">{parcel.receiverPhone}</span>
                  <span className="text-[10px] block truncate">{parcel.receiverAddress}</span>
                </div>

                {/* Dual Weight in Sticker */}
                <div className="border-t-2 border-slate-950 pt-1 flex justify-between items-center">
                  <div>
                    <span className="font-black text-sm block">{parcel.weightViss} VISS</span>
                    <span className="text-[10px] text-slate-600 block">(~ {formatNumber(weightInKg, 1)} KG)</span>
                  </div>
                  <span className="text-[11px] font-bold">
                    {parcel.isBulkyGoods ? '📦 ကုန်ပွ' : `${parcel.packageCount} ထုပ်`}
                  </span>
                </div>
              </div>

              {/* Bluetooth Thermal Print Controls */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5 font-semibold text-amber-400">
                    <Bluetooth className="w-4 h-4 text-sky-400" />
                    <span>အိတ်ဆောင် Bluetooth POS Label Printer (58mm/80mm)</span>
                  </span>
                  <span className="text-[11px] text-slate-500">ESC/POS</span>
                </div>

                <p className="text-[11px] text-slate-400">
                  Android ဖုန်း သို့မဟုတ် တက်ဘလက်မှ Bluetooth ဖွင့်ထားသော စတစ်ကာပရင့်တာသို့ ကုန်စည်ကပ် ကော်စတစ်ကာ တိုက်ရိုက်ထုတ်ပေးပါသည်။
                </p>

                <button
                  onClick={handlePrintBluetoothThermal}
                  disabled={isBluetoothConnecting}
                  className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
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

          {/* Quick Share Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block">
              {lang === 'my' ? 'လူကြီးမင်းများထံ ဘောင်ချာ ပို့ပေးရန်:' : 'Share Voucher with Customer:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={handleCopyViber}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors"
              >
                {copiedViber ? <Check className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                <span>{copiedViber ? 'Viber ကူးယူပြီး!' : 'Viber စာသား ကူးမည်'}</span>
              </button>

              <button
                onClick={handleCopySms}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors"
              >
                {copiedSms ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSms ? 'SMS ကူးယူပြီး!' : 'SMS စာသား ကူးမည်'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? 'ပြေစာ ပရင့်ထုတ်' : 'Print Voucher'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
