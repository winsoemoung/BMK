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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div 
        className="relative w-full max-w-xl rounded-2xl border border-[#e4e6eb] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Facebook-style Modal Header */}
        <div className="relative flex items-center justify-between p-4 sm:p-5 border-b border-[#e4e6eb] bg-[#f0f2f5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-black shadow-sm">
              <Shield className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1877F2]/10 text-[#1877F2]">
                  SINGLE APK ARCHITECTURE
                </span>
                <span className="text-[#65676b] text-xs">·</span>
                <span className="text-[#65676b] text-xs font-medium">BMK Express</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#050505]">
                {lang === 'my' ? 'အကောင့်ပြောင်းလဲခြင်း & လော့ဂ်အင် (One App)' : 'Switch Account & Staff Login (Single APK)'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] flex items-center justify-center text-[#050505] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Banner */}
        <div className="px-5 py-3 bg-[#e7f3ff] border-b border-[#1877F2]/20 text-xs text-[#1877F2] flex items-start gap-2">
          <Info className="w-4 h-4 text-[#1877F2] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-[#1877F2]">
              {lang === 'my' ? 'APK တစ်ခုတည်းဖြင့် အလုပ်လုပ်ပုံ: ' : 'How Single APK Works: '}
            </span>
            <span className="text-[#050505]">
              {lang === 'my'
                ? 'ဖုန်းအားလုံးတွင် BMK App တစ်ခုတည်းကိုသာ သွင်းထားပြီး မိမိဂိတ်အကောင့် (သို့မဟုတ်) ၄ လုံး PIN ဖြင့် ဝင်လိုက်သည်နှင့် သက်ဆိုင်ရာ ဂိတ်လုပ်ငန်းဆောင်တာများသာ အလိုအလျောက် ပေါ်လာမည် ဖြစ်ပါသည်။'
                : 'All staff install the exact same BMK app. Logging in via Account or 4-digit PIN instantly unlocks role-specific screens.'}
            </span>
          </div>
        </div>

        {/* Tab switch between Quick Switch and PIN Entry */}
        <div className="flex items-center gap-2 px-5 pt-3 pb-2 border-b border-[#e4e6eb] text-xs bg-white">
          <button
            onClick={() => setAuthMode('quick')}
            className={`px-3.5 py-1.5 rounded-lg transition-all font-bold flex items-center gap-1.5 cursor-pointer ${
              authMode === 'quick'
                ? 'bg-[#1877F2] text-white shadow-xs'
                : 'text-[#65676b] hover:text-[#050505] bg-[#f0f2f5]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{lang === 'my' ? 'အကောင့်တိုက်ရိုက်ရွေးချယ်မည် (Fast Switch)' : '1-Click Fast Switch'}</span>
          </button>
          <button
            onClick={() => setAuthMode('pin')}
            className={`px-3.5 py-1.5 rounded-lg transition-all font-bold flex items-center gap-1.5 cursor-pointer ${
              authMode === 'pin'
                ? 'bg-[#1877F2] text-white shadow-xs'
                : 'text-[#65676b] hover:text-[#050505] bg-[#f0f2f5]'
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
              <span className="text-xs font-bold text-[#65676b] block">
                {lang === 'my' ? 'အသုံးပြုလိုသော ဂိတ်တာဝန်ခံ အကောင့်ကို ရွေးချယ်ပါ:' : 'Select an authorized staff account:'}
              </span>

              <div className="grid grid-cols-1 gap-2.5">
                {BMK_STAFF_ACCOUNTS.map((account) => {
                  const isCurrent = currentUser.id === account.id;

                  return (
                    <div
                      key={account.id}
                      onClick={() => handleQuickSwitch(account)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'border-[#1877F2] bg-[#e7f3ff]/40 shadow-xs ring-1 ring-[#1877F2]'
                          : 'border-[#e4e6eb] bg-[#f0f2f5]/40 hover:bg-[#f0f2f5] hover:border-[#ccd0d5]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${account.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0`}>
                          {account.role === 'ADMIN' && <Shield className="w-5 h-5" />}
                          {account.role === 'MANDALAY_STAFF' && 'MDY'}
                          {account.role === 'KALAY_STAFF' && 'KLY'}
                          {account.role === 'DRIVER' && <Truck className="w-5 h-5" />}
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#050505]">{account.name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#e4e6eb] text-[#050505]">
                              PIN: {account.pin}
                            </span>
                          </div>
                          <div className="text-xs text-[#1877F2] font-semibold">
                            {lang === 'my' ? account.roleTitleMy : account.roleTitleEn}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#65676b]">
                            <MapPin className="w-3 h-3 text-[#65676b]" />
                            <span>{lang === 'my' ? account.gateLocationNameMy : account.gateLocation}</span>
                            <span className="text-[#ccd0d5]">·</span>
                            <span className="font-mono">{account.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isCurrent ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-[#1877F2] bg-white px-2.5 py-1 rounded-lg border border-[#1877F2]/30 shadow-xs">
                            <Check className="w-3.5 h-3.5 text-[#1877F2]" />
                            <span>{lang === 'my' ? 'လက်ရှိဝင်ထားဆဲ' : 'Active'}</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-bold text-[#050505] bg-[#e4e6eb] hover:bg-[#d8dadf] px-2.5 py-1 rounded-lg transition-colors">
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
                <span className="text-xs text-[#65676b] font-semibold">
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
                  className="w-full bg-[#f0f2f5] border border-[#e4e6eb] rounded-xl px-3 py-2 text-xs font-bold text-[#050505] focus:bg-white focus:ring-2 focus:ring-[#1877F2] text-center"
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
                        ? 'bg-[#1877F2] border-[#1877F2] scale-110 shadow-md shadow-[#1877F2]/40'
                        : 'border-[#ccd0d5] bg-[#f0f2f5]'
                    }`}
                  />
                ))}
              </div>

              {pinError && (
                <div className="flex items-center justify-center gap-1 text-xs text-rose-600 font-bold text-center">
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
                    className="h-12 rounded-xl bg-[#f0f2f5] hover:bg-[#e4e6eb] border border-[#e4e6eb] text-base font-bold text-[#050505] transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  onClick={() => setEnteredPin('')}
                  className="h-12 rounded-xl bg-white hover:bg-[#f0f2f5] border border-[#e4e6eb] text-xs font-bold text-[#65676b] transition-all flex items-center justify-center cursor-pointer"
                >
                  Clear
                </button>
                <button
                  onClick={() => handlePinDigit('0')}
                  className="h-12 rounded-xl bg-[#f0f2f5] hover:bg-[#e4e6eb] border border-[#e4e6eb] text-base font-bold text-[#050505] transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                >
                  0
                </button>
                <button
                  onClick={handlePinDelete}
                  className="h-12 rounded-xl bg-white hover:bg-[#f0f2f5] border border-[#e4e6eb] text-xs font-bold text-[#65676b] transition-all flex items-center justify-center cursor-pointer"
                >
                  ⌫ Del
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-[#f0f2f5] border border-[#e4e6eb] text-[11px] text-[#65676b] text-center">
                စမ်းသပ်ရန် PIN: Admin=<strong className="text-[#1877F2]">1234</strong>, Mandalay=<strong className="text-[#1877F2]">2222</strong>, Kalay=<strong className="text-[#1877F2]">3333</strong>
              </div>
            </div>
          )}
        </div>

        {/* Facebook Modal Footer */}
        <div className="p-4 border-t border-[#e4e6eb] bg-[#f0f2f5] flex items-center justify-between text-xs text-[#65676b]">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#31a24c]" />
            <span className="font-medium">Role-Based Access Control (RBAC) Enforced</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#e4e6eb] hover:bg-[#d8dadf] text-[#050505] font-bold transition-colors cursor-pointer"
          >
            {lang === 'my' ? 'ပိတ်မည်' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
