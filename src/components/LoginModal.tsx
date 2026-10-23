import React, { useState } from 'react';
import { AppUserAccount } from '../types/bmk';
import { BMK_STAFF_ACCOUNTS } from '../data/mockUsers';
import { 
  X, 
  Shield, 
  UserCheck, 
  KeyRound, 
  Smartphone, 
  MapPin, 
  Check, 
  Lock, 
  AlertCircle,
  Truck,
  ArrowRight,
  Info
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUserAccount;
  onSelectUser: (user: AppUserAccount) => void;
  lang: 'my' | 'en';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  lang,
}) => {
  const [authMode, setAuthMode] = useState<'quick' | 'pin'>('quick');
  const [enteredPin, setEnteredPin] = useState('');
  const [selectedTargetUser, setSelectedTargetUser] = useState<AppUserAccount>(currentUser);
  const [pinError, setPinError] = useState('');

  if (!isOpen) return null;

  const handleQuickSwitch = (user: AppUserAccount) => {
    onSelectUser(user);
    onClose();
  };

  const handlePinDigit = (digit: string) => {
    if (enteredPin.length < 4) {
      const newPin = enteredPin + digit;
      setEnteredPin(newPin);
      setPinError('');

      if (newPin.length === 4) {
        // Validate PIN
        if (newPin === selectedTargetUser.pin) {
          onSelectUser(selectedTargetUser);
          onClose();
        } else {
          setPinError(lang === 'my' ? 'PIN နံပါတ် မှားယွင်းနေပါသည်။' : 'Invalid PIN code. Try again.');
          setTimeout(() => setEnteredPin(''), 800);
        }
      }
    }
  };

  const handlePinDelete = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setPinError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
              <Shield className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300">
                  SINGLE APK ARCHITECTURE
                </span>
                <span className="text-slate-500 text-xs">·</span>
                <span className="text-slate-400 text-xs font-mono">BMK Express</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {lang === 'my' ? 'အကောင့်ပြောင်းလဲခြင်း & လော့ဂ်အင် (One App)' : 'Switch Account & Staff Login (Single APK)'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational banner about Single APK */}
        <div className="px-5 py-3 bg-amber-950/30 border-b border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-amber-300">
              {lang === 'my' ? 'APK တစ်ခုတည်းဖြင့် အလုပ်လုပ်ပုံ: ' : 'How Single APK Works: '}
            </span>
            {lang === 'my'
              ? 'ဖုန်းအားလုံးတွင် BMK App တစ်ခုတည်းကိုသာ သွင်းထားပြီး မိမိဂိတ်အကောင့် (သို့မဟုတ်) ၄ လုံး PIN ဖြင့် ဝင်လိုက်သည်နှင့် သက်ဆိုင်ရာ ဂိတ်လုပ်ငန်းဆောင်တာများသာ အလိုအလျောက် ပေါ်လာမည် ဖြစ်ပါသည်။'
              : 'All staff install the exact same BMK app. Logging in via Account or 4-digit PIN instantly unlocks role-specific screens.'}
          </div>
        </div>

        {/* Tab switch between Quick Switch and PIN Entry */}
        <div className="flex items-center gap-2 px-5 pt-3 pb-1 border-b border-slate-800 text-xs">
          <button
            onClick={() => setAuthMode('quick')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
              authMode === 'quick'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white bg-slate-950'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{lang === 'my' ? 'အကောင့်တိုက်ရိုက်ရွေးချယ်မည် (Fast Switch)' : '1-Click Fast Switch'}</span>
          </button>
          <button
            onClick={() => setAuthMode('pin')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
              authMode === 'pin'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white bg-slate-950'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{lang === 'my' ? '၄ လုံး PIN နံပါတ်ဖြင့် ဝင်ရောက်မည်' : '4-Digit PIN Pad Login'}</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {authMode === 'quick' ? (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 block">
                {lang === 'my' ? 'အသုံးပြုလိုသော ဂိတ်တာဝန်ခံ အကောင့်ကို ရွေးချယ်ပါ:' : 'Select an authorized staff account:'}
              </span>

              <div className="grid grid-cols-1 gap-3">
                {BMK_STAFF_ACCOUNTS.map((account) => {
                  const isCurrent = currentUser.id === account.id;

                  return (
                    <div
                      key={account.id}
                      onClick={() => handleQuickSwitch(account)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'border-amber-400 bg-amber-500/10 ring-1 ring-amber-400/40'
                          : 'border-slate-800 bg-slate-950/80 hover:bg-slate-800/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${account.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                          {account.role === 'ADMIN' && <Shield className="w-5 h-5" />}
                          {account.role === 'MANDALAY_STAFF' && 'MDY'}
                          {account.role === 'KALAY_STAFF' && 'KLY'}
                          {account.role === 'DRIVER' && <Truck className="w-5 h-5" />}
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{account.name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                              PIN: {account.pin}
                            </span>
                          </div>
                          <div className="text-xs text-amber-400/90 font-medium">
                            {lang === 'my' ? account.roleTitleMy : account.roleTitleEn}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{lang === 'my' ? account.gateLocationNameMy : account.gateLocation}</span>
                            <span className="text-slate-600">·</span>
                            <span className="font-mono">{account.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isCurrent ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30">
                            <Check className="w-3.5 h-3.5" />
                            <span>{lang === 'my' ? 'လက်ရှိဝင်ထားဆဲ' : 'Active'}</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-800 hover:text-white px-2.5 py-1 rounded-lg transition-colors">
                            <span>{lang === 'my' ? 'ဝင်ရောက်မည်' : 'Switch'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* PIN Mode (Simulating Android Gate Phone PIN Entry) */
            <div className="space-y-4 max-w-sm mx-auto py-2">
              <div className="text-center space-y-1">
                <span className="text-xs text-slate-400">
                  {lang === 'my' ? 'လော့ဂ်အင်ဝင်မည့် အကောင့်:' : 'Logging in as:'}
                </span>
                <select
                  value={selectedTargetUser.id}
                  onChange={(e) => {
                    const found = BMK_STAFF_ACCOUNTS.find((a) => a.id === e.target.value);
                    if (found) {
                      setSelectedTargetUser(found);
                      setEnteredPin('');
                      setPinError('');
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 text-center"
                >
                  {BMK_STAFF_ACCOUNTS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({lang === 'my' ? a.roleTitleMy : a.roleTitleEn}) - PIN: {a.pin}
                    </option>
                  ))}
                </select>
              </div>

              {/* PIN Bubbles */}
              <div className="flex items-center justify-center gap-3 py-2">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      idx < enteredPin.length
                        ? 'bg-amber-400 border-amber-400 scale-110 shadow-lg shadow-amber-400/40'
                        : 'border-slate-700 bg-slate-950'
                    }`}
                  />
                ))}
              </div>

              {pinError && (
                <div className="flex items-center justify-center gap-1 text-xs text-rose-400 text-center">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{pinError}</span>
                </div>
              )}

              {/* PIN Keypad */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handlePinDigit(digit)}
                    className="h-12 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-base font-bold text-white transition-all active:scale-95 flex items-center justify-center"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  onClick={() => setEnteredPin('')}
                  className="h-12 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-400 transition-all flex items-center justify-center"
                >
                  Clear
                </button>
                <button
                  onClick={() => handlePinDigit('0')}
                  className="h-12 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-base font-bold text-white transition-all active:scale-95 flex items-center justify-center"
                >
                  0
                </button>
                <button
                  onClick={handlePinDelete}
                  className="h-12 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-400 transition-all flex items-center justify-center"
                >
                  ⌫ Del
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 text-center">
                စမ်းသပ်ရန် PIN: Admin=<strong className="text-amber-400">1234</strong>, Mandalay=<strong className="text-sky-400">2222</strong>, Kalay=<strong className="text-purple-400">3333</strong>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Role-Based Access Control (RBAC) Enforced</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            {lang === 'my' ? 'ပိတ်မည်' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
