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
  ArrowRight,
  MessageCircle
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
        ? `မင်္ဂလာပါ ${currentUser.name} ခင်ဗျာ။ ကျွန်တော်က BMK Express ဂိတ်လုပ်ငန်းများအတွက် အထူးကူညီပေးမည့် Gemini AI Assistant ဖြစ်ပါသည်။\n\n📌 မန္တလေး-ကလေး ကုန်စည်ပို့ဆောင်ခ တွက်ချက်ခြင်း\n⚖️ ပိဿာ (Viss) နှင့် ကီလို (Kg) အပြန်အလှန်တွက်ချက်ခြင်း\n🚛 ၁၂ ဘီး ကုန်တင်ကားကြီးများ စရိတ်ရှင်းတမ်းနှင့် ကုန်စည်စာရင်းချုပ် (Manifest)\n📦 ကုန်ပွစျေး (Bulky Goods Rate) နှင့် လမ်းခရီးလျော်ကြေး ကိစ္စရပ်များကို မေးမြန်းနိုင်ပါသည်!`
        : `Hello ${currentUser.name}! I am your BMK Express Gemini AI Assistant.\n\nI can calculate customer delivery fees, convert Viss ⇄ Kg in real time, help with 12-wheel truck driver advances & road settlements, explain Bulky Goods rates, and guide through cargo claims!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 100);
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            currentUserRole: currentUser.role,
            currentUserName: currentUser.name,
            gateLocation: currentUser.gateLocation,
            pricingConfig,
            defaultWeightUnit: weightUnit,
            parcelsCount,
            tripsCount,
            lang,
          },
        }),
      });

      let reply = '';
      if (response.ok) {
        const data = await response.json();
        reply = data.reply;
      }

      if (!reply) {
        reply = lang === 'my'
          ? `လက်ရှိ မန္တလေး ⇄ ကလေး ကုန်စည်ပို့ဆောင်ခနှုန်းထားမှာ ၁ ပိဿာလျှင် ${pricingConfig.customerRatePerViss.toLocaleString()} ကျပ် (၁၂ ဘီးကားခ: ${pricingConfig.truckRatePerViss.toLocaleString()} ကျပ်၊ မန္တလေးကူလီ: ${pricingConfig.mdyLaborPerViss} ကျပ်၊ ကလေးကူလီ: ${pricingConfig.kalayLaborPerViss} ကျပ်၊ ဂိတ်အသားတင်အမြတ်: ၅၀ ကျပ်) ဖြစ်ပါသည်။ ၁ ပိဿာ = ၁.၆၃၂၉ ကီလို (1 Kg = 0.612 ပိဿာ) ဖြစ်ပါသည်။`
          : `Current Rates: Standard customer rate is ${pricingConfig.customerRatePerViss.toLocaleString()} MMK/viss (Truck fee: ${pricingConfig.truckRatePerViss.toLocaleString()}, MDY labor: ${pricingConfig.mdyLaborPerViss}, Kalay labor: ${pricingConfig.kalayLaborPerViss}, Gate profit: 50 MMK/viss). Conversion: 1 Viss = 1.6329 Kg.`;
      }

      const botMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.warn('Chat request notice:', err?.message || err);
      // Helpful fallback
      const fallbackReply = lang === 'my'
        ? `လက်ရှိ မန္တလေး-ကလေး ကုန်စည်ပို့ဆောင်ခနှုန်းထားမှာ ၁ ပိဿာလျှင် ${pricingConfig.customerRatePerViss.toLocaleString()} ကျပ် (၁၂ ဘီးကားခ: ${pricingConfig.truckRatePerViss.toLocaleString()} ကျပ်၊ မန္တလေးကူလီ: ${pricingConfig.mdyLaborPerViss} ကျပ်၊ ကလေးကူလီ: ${pricingConfig.kalayLaborPerViss} ကျပ်၊ ဂိတ်အသားတင်အမြတ်: ၅၀ ကျပ်) ဖြစ်ပါသည်။ ၁ ပိဿာ = ၁.၆၃၂၉ ကီလို (1 Kg = 0.612 ပိဿာ) ဖြစ်ပါသည်။`
        : `Current Rates: Standard customer rate is ${pricingConfig.customerRatePerViss.toLocaleString()} MMK/viss (Truck fee: ${pricingConfig.truckRatePerViss.toLocaleString()}, MDY labor: ${pricingConfig.mdyLaborPerViss}, Kalay labor: ${pricingConfig.kalayLaborPerViss}, Gate profit: 50 MMK/viss). Conversion: 1 Viss = 1.6329 Kg.`;

      const botMessage: ChatMessage = {
        id: `assistant-fallback-${Date.now()}`,
        role: 'assistant',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMessage]);
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
        id: 'welcome-reset',
        role: 'assistant',
        content: lang === 'my' ? 'စကားဝိုင်းအသစ် စတင်ပါပြီ။ မည်သည့်အရာများ ကူညီပေးရမလဲခင်ဗျာ?' : 'Chat history reset. How can I help you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const suggestions = lang === 'my' ? QUICK_SUGGESTIONS_MY : QUICK_SUGGESTIONS_EN;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div 
        className={`relative w-full ${isExpanded ? 'max-w-4xl h-[92vh]' : 'max-w-xl h-[82vh] sm:h-[680px]'} rounded-2xl border border-[#e4e6eb] bg-white shadow-2xl flex flex-col overflow-hidden transition-all duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Facebook Messenger Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e4e6eb] bg-white shadow-xs">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0084ff] via-[#1877F2] to-[#a033ff] flex items-center justify-center text-white shadow-sm">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#31a24c] border-2 border-white ring-1 ring-[#31a24c]/40" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#050505] text-sm sm:text-base">
                  BMK Messenger AI Copilot
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#e7f3ff] text-[#1877F2] font-mono text-[10px] font-bold">
                  Gemini 2.5
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#65676b]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#31a24c]" />
                <span>{lang === 'my' ? 'လက်ရှိ တိုက်ရိုက်ကူညီနေပါသည်' : 'Active now'}</span>
                <span>·</span>
                <span>{lang === 'my' ? 'မန္တလေး ⇄ ကလေး' : 'MDY ⇄ KLY'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearHistory}
              className="w-8 h-8 rounded-full bg-[#f0f2f5] hover:bg-[#e4e6eb] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
              title="Clear chat"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="hidden sm:flex w-8 h-8 rounded-full bg-[#f0f2f5] hover:bg-[#e4e6eb] text-[#050505] items-center justify-center transition-colors cursor-pointer"
              title={isExpanded ? 'Minimize' : 'Expand'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#f0f2f5] hover:bg-[#e4e6eb] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Gate Rates Micro Bar (Messenger Info Strip) */}
        <div className="px-4 py-2 bg-[#f0f2f5] border-b border-[#e4e6eb] text-xs text-[#65676b] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span>Customer: <strong className="text-[#1877F2] font-mono">{pricingConfig.customerRatePerViss.toLocaleString()}</strong> MMK/viss</span>
            <span>·</span>
            <span>12-Wheel Truck: <strong className="text-[#050505] font-mono">{pricingConfig.truckRatePerViss.toLocaleString()}</strong> MMK</span>
            <span>·</span>
            <span>Profit: <strong className="text-[#31a24c] font-mono">50</strong> MMK/viss</span>
          </div>
          <span className="text-[11px] font-semibold text-[#1877F2]">1 Viss = 1.63 Kg</span>
        </div>

        {/* Chat Message Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#ffffff]">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`relative max-w-[85%] group ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#0084ff] text-white font-medium rounded-br-xs shadow-xs'
                        : 'bg-[#f0f2f5] text-[#050505] rounded-bl-xs border border-[#e4e6eb]/60'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>

                  {/* Message Meta & Copy button */}
                  <div className={`flex items-center gap-2 mt-1 px-1 text-[10px] text-[#65676b] ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#050505] flex items-center gap-0.5 cursor-pointer"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-[#31a24c]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#e4e6eb] text-[#050505] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-[#f0f2f5] rounded-bl-xs border border-[#e4e6eb] text-xs text-[#65676b] flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#1877F2] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#1877F2] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#1877F2] animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-[11px] font-semibold text-[#050505]">Gemini AI စဉ်းစားနေပါသည်...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Questions */}
        {messages.length <= 3 && !isLoading && (
          <div className="px-4 py-2.5 bg-[#f0f2f5] border-t border-[#e4e6eb] space-y-1.5">
            <span className="text-[10px] font-bold text-[#65676b] uppercase tracking-wider block">
              {lang === 'my' ? 'အမေးများသော ဂိတ်လုပ်ငန်း မေးခွန်းများ:' : 'Suggested Questions:'}
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {suggestions.map((sug, idx) => {
                const IconComponent = sug.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(sug.text)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#e4e6eb] border border-[#e4e6eb] text-xs text-[#050505] font-semibold transition-all whitespace-nowrap shrink-0 text-left active:scale-95 cursor-pointer shadow-xs"
                  >
                    <IconComponent className="w-3.5 h-3.5 text-[#1877F2] shrink-0" />
                    <span>{sug.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Messenger Input Bar */}
        <div className="p-3 border-t border-[#e4e6eb] bg-white flex items-center gap-2">
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
                ? 'မန္တလေး-ကလေး ကုန်စည်နှုန်းထား၊ ကားခ၊ အလုပ်သမားခများ မေးမြန်းပါ...'
                : 'Ask Gemini about rates, viss calculations, trips...'
            }
            disabled={isLoading}
            className="flex-1 bg-[#f0f2f5] border border-transparent rounded-full px-4 py-2.5 text-xs sm:text-sm text-[#050505] placeholder-[#65676b] focus:outline-none focus:bg-white focus:border-[#1877F2] transition-colors"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-full bg-[#0084ff] hover:bg-[#0073e6] text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
