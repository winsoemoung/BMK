import React, { useEffect, useState } from 'react';
import { Parcel } from '../types/bmk';
import { formatMMK, generateQrDataUrl, generateViberReceiptText, generateSmsReceiptText, getStatusBurmese } from '../utils/formatters';
import { X, Copy, Check, Printer, Share2, MessageSquare, PhoneCall } from 'lucide-react';

interface DigitalReceiptModalProps {
  parcel: Parcel | null;
  onClose: () => void;
  lang: 'my' | 'en';
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  parcel,
  onClose,
  lang,
}) => {
  if (!parcel) return null;

  const [qrSrc, setQrSrc] = useState<string>('');
  const [copiedViber, setCopiedViber] = useState(false);
  const [copiedSms, setCopiedSms] = useState(false);

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
    const text = generateViberReceiptText(parcel);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-sm text-white">
              {lang === 'my' ? 'ဒစ်ဂျစ်တယ် ဘောင်ချာ နှင့် QR Code' : 'Digital Receipt & QR Code'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt Container */}
        <div className="p-6 space-y-4">
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

            {/* Cargo Details & Rate */}
            <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between">
                <span className="text-slate-600">ကုန်ပစ္စည်း:</span>
                <span className="font-semibold text-slate-900">{parcel.itemType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">အရေအတွက်:</span>
                <span className="font-medium text-slate-900">{parcel.packageCount} ထုပ်/ဖာ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">အလေးချိန်:</span>
                <span className="font-bold font-mono text-slate-900">{parcel.weightViss} ပိသာ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">ဝန်ဆောင်ခနှုန်းထား:</span>
                <span className="font-mono text-slate-700">1,200 MMK / ပိသာ</span>
              </div>
            </div>

            {/* Total Fee */}
            <div className="flex justify-between items-center pt-1">
              <span className="font-bold text-slate-900 text-sm">စုစုပေါင်း ကျသင့်ငွေ:</span>
              <span className="font-extrabold font-mono text-base text-slate-900">
                {formatMMK(parcel.totalDeliveryFee)}
              </span>
            </div>

            {/* Footer note */}
            <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-200">
              ကုန်စည်လက်ခံရန် ဘောင်ချာ (သို့) ဖုန်းနံပါတ် ပြသပေးပါ။ ကျေးဇူးတင်ပါသည်။
            </div>
          </div>

          {/* Quick Share Buttons */}
          <div className="space-y-2 pt-2">
            <span className="text-xs text-slate-400 font-semibold block">
              {lang === 'my' ? 'လူကြီးမင်းများထံ ဘောင်ချာ ပို့ပေးရန်:' : 'Share Voucher with Customer:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Copy Viber */}
              <button
                onClick={handleCopyViber}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors"
              >
                {copiedViber ? <Check className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                <span>{copiedViber ? 'Viber ကူးယူပြီး!' : 'Viber စာသား ကူးမည်'}</span>
              </button>

              {/* Copy SMS */}
              <button
                onClick={handleCopySms}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors"
              >
                {copiedSms ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSms ? 'SMS ကူးယူပြီး!' : 'SMS စာသား ကူးမည်'}</span>
              </button>

              {/* Print */}
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? 'ဘောင်ချာ ပရင့်ထုတ်' : 'Print Slip'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
