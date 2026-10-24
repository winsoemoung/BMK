import React, { useState } from 'react';
import { Parcel, WeightUnit } from '../types/bmk';
import { 
  formatMMK, 
  formatNumber, 
  vissToKg, 
  generateIntakeNotificationText, 
  generateArrivalNotificationText, 
  generateSmsReceiptText,
  generateSmsArrivalText,
  openViberShare, 
  openSmsApp, 
  shareNativeOrFallback,
  cleanPhoneNumber 
} from '../utils/formatters';
import { 
  X, 
  Check, 
  MessageSquare, 
  PhoneCall, 
  Send, 
  Share2, 
  Copy, 
  Clock, 
  CheckCircle2, 
  BellRing, 
  ExternalLink,
  MapPin,
  Truck
} from 'lucide-react';

export type NotificationMode = 'INTAKE' | 'ARRIVAL';

interface CustomerNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcel: Parcel | null;
  mode: NotificationMode;
  weightUnit?: WeightUnit;
  lang: 'my' | 'en';
  onMarkNotified?: (parcelId: string, type: 'INTAKE' | 'ARRIVAL') => void;
}

export const CustomerNotificationModal: React.FC<CustomerNotificationModalProps> = ({
  isOpen,
  onClose,
  parcel,
  mode,
  weightUnit = 'VISS',
  lang,
  onMarkNotified,
}) => {
  if (!isOpen || !parcel) return null;

  // Selected recipient: for INTAKE, staff can send to Sender or Receiver; for ARRIVAL, receiver is default.
  const [targetParty, setTargetParty] = useState<'RECEIVER' | 'SENDER'>(
    mode === 'ARRIVAL' ? 'RECEIVER' : 'RECEIVER'
  );
  const [channelType, setChannelType] = useState<'VIBER' | 'SMS'>('VIBER');
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const targetName = targetParty === 'RECEIVER' ? parcel.receiverName : parcel.senderName;
  const targetPhone = targetParty === 'RECEIVER' ? parcel.receiverPhone : parcel.senderPhone;

  // Generate appropriate message
  const fullMessage = mode === 'ARRIVAL'
    ? generateArrivalNotificationText(parcel, weightUnit)
    : generateIntakeNotificationText(parcel, weightUnit);

  const smsMessage = mode === 'ARRIVAL'
    ? generateSmsArrivalText(parcel)
    : generateSmsReceiptText(parcel);

  const activeMessage = channelType === 'VIBER' ? fullMessage : smsMessage;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeMessage);
    setCopied(true);
    setStatusMessage('စာသား မိတ္တူကူးယူပြီးပါပြီ!');
    setTimeout(() => {
      setCopied(false);
      setStatusMessage('');
    }, 2500);
  };

  const handleSendViber = () => {
    openViberShare(activeMessage);
    if (onMarkNotified) {
      onMarkNotified(parcel.id, mode);
    }
    setStatusMessage('Viber အက်ပ်ကို ဖွင့်လှစ်ပြီး အကြောင်းကြားပြီးကြောင်း မှတ်တမ်းတင်ပါသည်');
  };

  const handleSendSms = () => {
    openSmsApp(targetPhone, activeMessage);
    if (onMarkNotified) {
      onMarkNotified(parcel.id, mode);
    }
    setStatusMessage('SMS အက်ပ်သို့ ပို့ဆောင်ပြီး မှတ်တမ်းတင်ပါသည်');
  };

  const handleNativeShare = async () => {
    const success = await shareNativeOrFallback(
      mode === 'ARRIVAL' ? 'BMK ကလေးဂိတ် ဆိုက်ရောက်သတိပေးချက်' : 'BMK ဘောင်ချာပြေစာ',
      activeMessage
    );
    if (success) {
      if (onMarkNotified) {
        onMarkNotified(parcel.id, mode);
      }
      setStatusMessage('အောင်မြင်စွာ မျှဝေပြီးပါပြီ');
    }
  };

  const weightKg = vissToKg(parcel.weightViss);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className={`px-6 py-4 border-b border-slate-800 flex items-center justify-between ${
          mode === 'ARRIVAL' 
            ? 'bg-gradient-to-r from-purple-950/80 to-slate-950' 
            : 'bg-gradient-to-r from-amber-950/70 to-slate-950'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${
              mode === 'ARRIVAL' ? 'bg-purple-500/20 text-purple-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>
                  {mode === 'ARRIVAL'
                    ? (lang === 'my' ? 'ကလေးဂိတ် ဆိုက်ရောက် အသိပေးစနစ်' : 'Kalay Arrival Notification')
                    : (lang === 'my' ? 'မန္တလေးဂိတ် လက်ခံ ဘောင်ချာ အသိပေးစနစ်' : 'Mandalay Gate Intake Notification')}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {parcel.id}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'ARRIVAL'
                  ? 'လက်ခံသူထံသို့ "ပစ္စည်းကလေးဂိတ်သို့ ရောက်ရှိပါပြီ၊ လာရောက်ထုတ်ယူနိုင်ပါသည်" ဟု သတိပေးစာ ပို့ပါမည်'
                  : 'ပို့သူနှင့် လက်ခံသူထံသို့ ဘောင်ချာဖွင့်လှစ်ပြီးစီးကြောင်း အလိုအလျောက် သတိပေးစာ ပို့ပါမည်'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[78vh] overflow-y-auto text-xs">
          {/* Status Feedback banner */}
          {statusMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Quick Info Strip */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px]">လက်ခံသူ (Receiver):</span>
              <span className="font-bold text-white">{parcel.receiverName}</span>
              <span className="font-mono text-slate-400 block text-[11px]">{parcel.receiverPhone}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ကုန်စည်:</span>
              <span className="font-medium text-amber-300 truncate block">{parcel.itemType}</span>
              <span className="text-slate-400 text-[11px]">{formatNumber(parcel.weightViss, 1)} ပိသာ (~{formatNumber(weightKg, 1)} Kg)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ပို့ဆောင်ခ:</span>
              <span className="font-mono font-bold text-emerald-400">{formatMMK(parcel.totalDeliveryFee)}</span>
              <span className="text-slate-400 block text-[10px]">
                {parcel.paymentStatus === 'PAID' ? 'ရှင်းပြီး' : parcel.paymentStatus === 'COD' ? 'ကလေး COD' : 'မရှင်းရသေး'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">သတိပေးမှတ်တမ်း:</span>
              {mode === 'ARRIVAL' ? (
                parcel.notifiedArrivalAt ? (
                  <span className="text-purple-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-purple-400" />
                    <span>ပို့ပြီး ({new Date(parcel.notifiedArrivalAt).toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit' })})</span>
                  </span>
                ) : (
                  <span className="text-slate-500">မပို့ရသေးပါ</span>
                )
              ) : parcel.notifiedIntakeAt ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>ပို့ပြီး</span>
                </span>
              ) : (
                <span className="text-slate-500">မပို့ရသေးပါ</span>
              )}
            </div>
          </div>

          {/* Select Recipient & Channel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Target Person */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium block">
                {lang === 'my' ? 'မက်ဆေ့ခ်ျ ပေးပို့မည့်သူ ရွေးရန်:' : 'Select Recipient:'}
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setTargetParty('RECEIVER')}
                  className={`py-1.5 px-2 rounded-lg font-semibold transition-colors text-center ${
                    targetParty === 'RECEIVER'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>📥 လက်ခံသူ (ကလေး)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetParty('SENDER')}
                  className={`py-1.5 px-2 rounded-lg font-semibold transition-colors text-center ${
                    targetParty === 'SENDER'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>📤 ပို့သူ (မန္တလေး)</span>
                </button>
              </div>
            </div>

            {/* Target Format */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium block">
                {lang === 'my' ? 'မက်ဆေ့ခ်ျ ပုံစံ ရွေးရန်:' : 'Message Format:'}
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setChannelType('VIBER')}
                  className={`py-1.5 px-2 rounded-lg font-semibold transition-colors text-center ${
                    channelType === 'VIBER'
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>💜 Viber အပြည့်အစုံ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannelType('SMS')}
                  className={`py-1.5 px-2 rounded-lg font-semibold transition-colors text-center ${
                    channelType === 'SMS'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>💬 SMS တိုတိုရှင်းရှင်း</span>
                </button>
              </div>
            </div>
          </div>

          {/* Message Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-400 font-medium">
                {lang === 'my' ? 'ပေးပို့မည့် မက်ဆေ့ခ်ျ နမူနာ:' : 'Message Content Preview:'}
              </label>
              <span className="text-[11px] font-mono text-slate-500">
                To: {targetName} ({targetPhone})
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-sans text-slate-200 leading-relaxed whitespace-pre-line text-xs max-h-48 overflow-y-auto selection:bg-purple-500">
              {activeMessage}
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-slate-400 font-semibold block text-[11px]">
              {lang === 'my' ? 'ဖောက်သည်ထံသို့ ၁-ချက်နှိပ် အမြန်ပို့ရန်:' : 'Instant 1-Click Send:'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Viber 1-Click */}
              <button
                type="button"
                onClick={handleSendViber}
                className="py-3 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Viber သို့ ပို့မည်</span>
              </button>

              {/* SMS 1-Click */}
              <button
                type="button"
                onClick={handleSendSms}
                className="py-3 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>SMS စာတို ပို့မည်</span>
              </button>

              {/* Copy / Native Share */}
              <button
                type="button"
                onClick={handleCopy}
                className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'ကူးယူပြီး!' : 'စာသား ကူးယူမည်'}</span>
              </button>
            </div>

            {/* Direct Phone Call Button */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span>ဖုန်းတိုက်ရိုက်ခေါ်ဆိုလိုပါက:</span>
                <a
                  href={`tel:${cleanPhoneNumber(targetPhone)}`}
                  className="font-mono text-amber-400 hover:underline font-bold flex items-center gap-1"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>{targetPhone}</span>
                </a>
              </span>

              <button
                type="button"
                onClick={handleNativeShare}
                className="text-slate-400 hover:text-white flex items-center gap-1 underline underline-offset-2"
              >
                <Share2 className="w-3 h-3" />
                <span>အခြားအက်ပ်များဖြင့် မျှဝေရန်</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
          >
            {lang === 'my' ? 'ပိတ်မည်' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
