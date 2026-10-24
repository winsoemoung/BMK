import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  User, 
  Copy, 
  Check, 
  RefreshCw, 
  Minimize2, 
  Maximize2,
  HelpCircle,
  Truck,
  Scale,
  Calculator,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { AppUserAccount, GatePricingConfig, WeightUnit, Parcel, Trip } from '../types/bmk';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface GeminiChatBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUserAccount;
  pricingConfig: GatePricingConfig;
  weightUnit: WeightUnit;
  parcelsCount: number;
  tripsCount: number;
  lang: 'my' | 'en';
}

const QUICK_SUGGESTIONS_MY = [
  { icon: Calculator, text: 'မန္တလေးမှ ကလေးသို့ ၁၅ ပိဿာ ကုန်ကျစရိတ် တွက်ပြပါ' },
  { icon: Scale, text: '၂၅ ကီလို (Kg) ဆိုရင် ပိဿာ ဘယ်လောက်ရှိပြီး ကားခ ဘယ်လောက်ကျမလဲ' },
  { icon: Truck, text: '၁၂ ဘီးကား ယာဉ်မောင်း စရိတ်ရှင်းတမ်း (Advance & Settlement) တွက်နည်း' },
  { icon: HelpCircle, text: 'ကုန်ပွစျေး (Bulky Goods Rate) ကို ဘယ်လိုပစ္စည်းတွေမှာ သတ်မှတ်ရမလဲ' },
  { icon: ShieldAlert, text: 'လမ်းခရီး ပစ္စည်းပျောက်ဆုံး/ပျက်စီးပါက လျော်ကြေး လုပ်ထုံးလုပ်နည်း' },
];

const QUICK_SUGGESTIONS_EN = [
  { icon: Calculator, text: 'Calculate delivery fee for 15 viss from Mandalay to Kalay' },
  { icon: Scale, text: 'Convert 25 kg to viss and calculate delivery fee' },
  { icon: Truck, text: 'How does 12-wheel truck driver advance & settlement work?' },
  { icon: HelpCircle, text: 'When should we apply the Bulky Goods Rate (ကုန်ပွစျေး)?' },
  { icon: ShieldAlert, text: 'What is the claims procedure for lost or damaged cargo?' },
];

export const GeminiChatBotModal: React.FC<GeminiChatBotModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  pricingConfig,
  weightUnit,
  parcelsCount,
  tripsCount,
  lang,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: lang === 'my'
        ? `မင်္ဂလာပါ ${currentUser.name} ခင်ဗျာ။ ကျွန်တော်က BMK Express (မန္တလေး ⇄ ကလေး) ရဲ့ **Gemini AI ကုန်စည်ပို့ဆောင်ရေး လက်ထောက်** ဖြစ်ပါတယ်။\n\nဂိတ်နှုန်းထားများ၊ ပိဿာ ⇄ ကီလို တွက်ချက်မှု၊ ၁၂ ဘီးကား ခရီးစဉ်၊ ယာဉ်မောင်းစရိတ်နှင့် လမ်းခရီး စစ်ဆေးရေးဂိတ်ဆိုင်ရာ မေးခွန်းများကို မေးမြန်းနိုင်ပါပြီ။`
        : `Hello ${currentUser.name}! I am your **BMK Express Gemini AI Assistant** for the Mandalay ⇄ Kalay route.\n\nAsk me about rates, viss ⇄ kg fee calculations, 12-wheel truck settlements, or gate procedures.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Build live gate operational context
      const gateContext = {
        activeUserRole: currentUser.role,
        activeUserName: currentUser.name,
        gateLocation: currentUser.gateLocation,
        currentRates: {
          customerRatePerViss: pricingConfig.customerRatePerViss,
          truckRatePerViss: pricingConfig.truckRatePerViss,
          mdyLaborPerViss: pricingConfig.mdyLaborPerViss,
          kalayLaborPerViss: pricingConfig.kalayLaborPerViss,
          baseNetProfitPerViss: pricingConfig.customerRatePerViss - (pricingConfig.truckRatePerViss + pricingConfig.mdyLaborPerViss + pricingConfig.kalayLaborPerViss),
          bulkyRatePerViss: pricingConfig.defaultBulkyRate,
        },
        currentWeightUnit: weightUnit,
        stats: {
          parcelsInSystem: parcelsCount,
          activeTrips: tripsCount,
        },
      };

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          gateContext,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const aiReply = data.reply || (lang === 'my' ? 'တောင်းပန်ပါသည်။ အချက်အလက် မရရှိနိုင်ပါ။' : 'Sorry, could not generate response.');

      setMessages((prev) => [
        ...prev,
        {
          id: 'ai_' + Date.now(),
          role: 'assistant',
          content: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      console.error('Failed to get Gemini response:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'error_' + Date.now(),
          role: 'assistant',
          content: lang === 'my'
            ? '⚠️ Gemini AI ဆာဗာနှင့် ချိတ်ဆက်ရာတွင် အခက်အခဲရှိနေပါသည်။ ခေတ္တစောင့်ဆိုင်းပြီး ထပ်မံကြိုးစားပေးပါ။'
            : '⚠️ Could not connect to the Gemini AI server. Please try again shortly.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome_' + Date.now(),
        role: 'assistant',
        content: lang === 'my'
          ? `စကားပြောမှတ်တမ်းကို ရှင်းလင်းပြီးပါပြီ။ မင်္ဂလာပါ ${currentUser.name} ခင်ဗျာ၊ မည်သည်ကို ကူညီပေးရမလဲ။`
          : `Chat history cleared. How can I help you, ${currentUser.name}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const suggestions = lang === 'my' ? QUICK_SUGGESTIONS_MY : QUICK_SUGGESTIONS_EN;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className={`relative w-full ${isExpanded ? 'max-w-4xl h-[92vh]' : 'max-w-xl h-[80vh] sm:h-[680px]'} rounded-2xl border border-amber-500/30 bg-slate-900 shadow-2xl flex flex-col overflow-hidden transition-all duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-amber-950/40">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
                <Sparkles className="w-5 h-5 font-bold" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm sm:text-base">
                  BMK Gemini AI Assistant
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold">
                  gemini-3.8-flash
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                {lang === 'my' ? 'မန္တလေး ⇄ ကလေး ဂိတ်လုပ်ငန်း အထောက်အကူ' : 'Logistics Intelligence Copilot'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearHistory}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Clear chat history"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="hidden sm:block p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isExpanded ? 'Minimize' : 'Expand'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Gate Rates Micro Bar */}
        <div className="px-4 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span>Customer: <strong className="text-amber-400">{pricingConfig.customerRatePerViss.toLocaleString()}</strong> MMK/viss</span>
            <span className="text-slate-600">·</span>
            <span>Truck: <strong className="text-sky-400">{pricingConfig.truckRatePerViss.toLocaleString()}</strong> MMK</span>
            <span className="text-slate-600">·</span>
            <span>Profit: <strong className="text-emerald-400">50</strong> MMK/viss</span>
          </div>
          <span className="text-[10px] text-slate-500">Live Context Enabled</span>
        </div>

        {/* Chat Message Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`relative max-w-[85%] group ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-md shadow-amber-500/10'
                        : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-none shadow-md'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>

                  {/* Message Meta & Copy button */}
                  <div className={`flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white flex items-center gap-0.5"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-400 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-[11px] font-mono">Gemini စဉ်းစားနေပါသည်...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Questions */}
        {messages.length <= 3 && !isLoading && (
          <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 space-y-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              {lang === 'my' ? 'မေးမြန်းနိုင်သော အချက်အလက်များ:' : 'Suggested Questions:'}
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {suggestions.map((sug, idx) => {
                const IconComponent = sug.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(sug.text)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-amber-400/40 text-[11px] text-slate-300 hover:text-white transition-all whitespace-nowrap shrink-0 text-left active:scale-95"
                  >
                    <IconComponent className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{sug.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              lang === 'my'
                ? 'ကုန်စည်နှုန်းထား၊ ကားခ၊ အလုပ်သမားခများ မေးမြန်းပါ...'
                : 'Ask Gemini about rates, viss calculations, trips...'
            }
            disabled={isLoading}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md shadow-amber-500/10"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
