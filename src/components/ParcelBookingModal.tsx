import React, { useState } from 'react';
import { Parcel, Trip, BMK_PRICING, PaymentStatus, FrequentCustomer } from '../types/bmk';
import { FREQUENT_CUSTOMERS } from '../data/mockData';
import { formatMMK, formatNumber } from '../utils/formatters';
import { X, Check, Calculator, Sparkles, Box, Phone, MapPin, User } from 'lucide-react';

interface ParcelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookParcel: (parcel: Parcel) => void;
  trips: Trip[];
  lang: 'my' | 'en';
}

export const ParcelBookingModal: React.FC<ParcelBookingModalProps> = ({
  isOpen,
  onClose,
  onBookParcel,
  trips,
  lang,
}) => {
  if (!isOpen) return null;

  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderAddress, setSenderAddress] = useState('မန္တလေး၊ ၈၄ လမ်း');

  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('ကလေးမြို့၊ တာဟန်းရပ်ကွက်');

  const [itemType, setItemType] = useState('ကုန်ခြောက် / စားသောက်ကုန်');
  const [itemDescription, setItemDescription] = useState('');
  const [packageCount, setPackageCount] = useState(1);
  const [weightInput, setWeightInput] = useState('20');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PAID');
  const [selectedTripId, setSelectedTripId] = useState(trips[0]?.id || '');
  const [notes, setNotes] = useState('');

  // Upgrade: Bulky Goods Rate (ကုန်ပွစျေး)
  const [isBulkyGoods, setIsBulkyGoods] = useState(false);
  const [customBulkyRate, setCustomBulkyRate] = useState<string>('1600');
  const [bulkyNote, setBulkyNote] = useState('');

  // Auto-complete suggestion state
  const [showSenderSuggestions, setShowSenderSuggestions] = useState(false);
  const [showReceiverSuggestions, setShowReceiverSuggestions] = useState(false);

  // Calculations
  const weightViss = Math.max(0.1, parseFloat(weightInput) || 0);
  const effectiveRate = isBulkyGoods
    ? (parseFloat(customBulkyRate) || BMK_PRICING.DEFAULT_BULKY_RATE)
    : BMK_PRICING.CUSTOMER_RATE_PER_VISS;

  const totalCustomerFee = weightViss * effectiveRate;
  const truckExpense = weightViss * BMK_PRICING.TRUCK_RATE_PER_VISS;
  const mdyLabor = weightViss * BMK_PRICING.MDY_LABOR_PER_VISS;
  const kalayLabor = weightViss * BMK_PRICING.KALAY_LABOR_PER_VISS;
  // Net Profit: Revenue - (Truck 1100 + MDY labor 25 + Kalay labor 25)
  const baseProfit = totalCustomerFee - (truckExpense + mdyLabor + kalayLabor);

  // Smart suggestions
  const senderSuggestions = FREQUENT_CUSTOMERS.filter(
    (c) =>
      c.city === 'MANDALAY' &&
      (c.phone.includes(senderPhone) || c.name.toLowerCase().includes(senderName.toLowerCase()))
  );

  const receiverSuggestions = FREQUENT_CUSTOMERS.filter(
    (c) =>
      c.city === 'KALAY' &&
      (c.phone.includes(receiverPhone) || c.name.toLowerCase().includes(receiverName.toLowerCase()))
  );

  const handleSelectSender = (customer: FrequentCustomer) => {
    setSenderName(customer.name);
    setSenderPhone(customer.phone);
    setSenderAddress(customer.address);
    if (!itemDescription) setItemType(customer.defaultItemType);
    setShowSenderSuggestions(false);
  };

  const handleSelectReceiver = (customer: FrequentCustomer) => {
    setReceiverName(customer.name);
    setReceiverPhone(customer.phone);
    setReceiverAddress(customer.address);
    setShowReceiverSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !receiverName.trim() || weightViss <= 0) return;

    const newId = `BMK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    const newParcel: Parcel = {
      id: newId,
      qrCode: `${newId}|MDY-KLY|${weightViss}VISS${isBulkyGoods ? '|BULKY' : ''}`,
      senderName,
      senderPhone,
      senderAddress,
      receiverName,
      receiverPhone,
      receiverAddress,
      itemType,
      itemDescription: itemDescription || `${itemType} (${packageCount} ထုပ်)`,
      packageCount,
      weightViss,
      customerRatePerViss: effectiveRate,
      isBulkyGoods,
      bulkyNote: isBulkyGoods ? (bulkyNote || 'ကုန်ပွစျေး သတ်မှတ်ထားသည်') : undefined,
      totalDeliveryFee: totalCustomerFee,
      paymentStatus,
      paymentCollectedAt: paymentStatus === 'COD' ? 'KALAY' : 'MANDALAY',
      truckExpense,
      mandalayLaborFee: mdyLabor,
      kalayLaborFee: kalayLabor,
      baseNetProfit: baseProfit,
      status: selectedTripId ? 'LOADED' : 'BOOKED',
      tripId: selectedTripId || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bookedByStaff: 'မောင်ဇော် (MDY Gate Staff)',
      notes,
    };

    onBookParcel(newParcel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{lang === 'my' ? 'ကုန်စည်လက်ခံ ဘောင်ချာဖွင့်ခြင်း' : 'Book Cargo Voucher'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                Mandalay ➔ Kalay
              </span>
            </h2>
            <span className="text-xs text-slate-400">
              {lang === 'my'
                ? 'စမတ်အကြံပြုချက် (Auto-fill) နှင့် ကုန်ပွစျေး စိတ်ကြိုက်သတ်မှတ်စနစ်'
                : 'Smart Auto-Complete & Custom Bulky Goods Pricing'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Real-time Calculation Sticky Banner */}
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" />
                <span>
                  {isBulkyGoods
                    ? (lang === 'my' ? 'ကုန်ပွစျေးနှုန်း တွက်ချက်မှု (Bulky Rate Applied)' : 'Bulky Rate Calculation')
                    : (lang === 'my' ? 'စံနှုန်းထား တွက်ချက်မှု (Standard 1,200/Viss)' : 'Standard Calculation')}
                </span>
              </span>
              <span className="text-slate-300 font-mono font-bold">
                {weightViss} ပိသာ @ {formatNumber(effectiveRate)} MMK/ပိသာ
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">
                {lang === 'my' ? 'လူကြီးမင်း ပေးဆောင်ရမည့် ပို့ဆောင်ခ စုစုပေါင်း:' : 'Total Customer Charge:'}
              </span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {formatMMK(totalCustomerFee)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
              <div className="text-slate-400">
                <span>၁၂ ဘီးကားခ (1,100):</span>
                <span className="block font-mono text-slate-200 mt-0.5">{formatMMK(truckExpense)}</span>
              </div>
              <div className="text-slate-400">
                <span>အလုပ်သမား (25+25):</span>
                <span className="block font-mono text-slate-200 mt-0.5">{formatMMK(mdyLabor + kalayLabor)}</span>
              </div>
              <div className="text-amber-400">
                <span>ဂိတ်အသားတင်အမြတ်:</span>
                <span className="block font-mono font-bold text-amber-400 mt-0.5">+{formatMMK(baseProfit)}</span>
              </div>
            </div>
          </div>

          {/* Section 1: Weight & Bulky Goods Feature (ကုန်ပွစျေး) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                {lang === 'my' ? '၁။ ကုန်စည်အမျိုးအစားနှင့် အလေးချိန် (ပိသာ)' : '1. Item Category & Weight'}
              </label>

              {/* Bulky Goods Toggle Button */}
              <button
                type="button"
                onClick={() => setIsBulkyGoods(!isBulkyGoods)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                  isBulkyGoods
                    ? 'bg-purple-900/60 text-purple-200 border-purple-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Box className="w-3.5 h-3.5 text-purple-400" />
                <span>{lang === 'my' ? '📦 ကုန်ပွစျေး သတ်မှတ်မည်' : 'Bulky Goods Mode'}</span>
              </button>
            </div>

            {/* Bulky Goods Custom Pricing Strip */}
            {isBulkyGoods && (
              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-purple-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    {lang === 'my'
                      ? 'ထုထည်ကြီးပြီး ပေါ့သော ပစ္စည်း (ကုန်ပွစျေး စိတ်ကြိုက်သတ်မှတ်ရန်)'
                      : 'Volumetric / Bulky Goods Custom Rate'}
                  </span>
                  <span className="text-[11px] text-purple-400">
                    {lang === 'my' ? 'ပုံမှန် ၁,၂၀၀ ထက် တိုး၍ကောက်နိုင်သည်' : 'Higher rate for space-consuming items'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-300 block mb-1">
                      {lang === 'my' ? 'စိတ်ကြိုက်နှုန်းထား (ကျပ် / ပိသာ)' : 'Custom Rate (MMK / Viss)'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1200"
                        step="100"
                        value={customBulkyRate}
                        onChange={(e) => setCustomBulkyRate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-purple-500/60 rounded-lg text-white font-mono font-bold focus:outline-none"
                      />
                      <span className="absolute right-3 top-2 text-xs text-purple-400">MMK / ပိသာ</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">
                      {lang === 'my' ? 'ကုန်ပွ မှတ်ချက် (ဥပမာ မွေ့ရာ၊ ပေါင်မုန့်ဖာ)' : 'Bulky Note'}
                    </label>
                    <input
                      type="text"
                      value={bulkyNote}
                      onChange={(e) => setBulkyNote(e.target.value)}
                      placeholder="ဥပမာ- ရေမြှုပ်မွေ့ရာ၊ ပလတ်စတစ်ခွက်ဖာ"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'my' ? 'အလေးချိန် (ပိသာ) *' : 'Weight in Viss *'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-amber-400 focus:outline-none"
                    placeholder="20"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">ပိသာ</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'my' ? 'ကုန်စည်အမျိုးအစား' : 'Item Category'}
                </label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:border-amber-400 focus:outline-none"
                >
                  <option value="ကုန်ခြောက် / စားသောက်ကုန်">ကုန်ခြောက် / စားသောက်ကုန်</option>
                  <option value="အထည်အလိပ် / ဖက်ရှင်">အထည်အလိပ် / ဖက်ရှင်</option>
                  <option value="ဆေးဝါးနှင့် ကျန်းမာရေး">ဆေးဝါးနှင့် ကျန်းမာရေး</option>
                  <option value="စက်ပစ္စည်း အပိုပစ္စည်း">စက်ပစ္စည်း အပိုပစ္စည်း</option>
                  <option value="အလှကုန်နှင့် လူသုံးကုန်">အလှကုန်နှင့် လူသုံးကုန်</option>
                  <option value="ကုန်ပွ (မွေ့ရာ/ရေမြှုပ်/မုန့်)">ကုန်ပွ (မွေ့ရာ/ရေမြှုပ်/မုန့်)</option>
                  <option value="အခြား အထွေထွေ">အခြား အထွေထွေ</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'my' ? 'ထုပ်ပိုးအရေအတွက်' : 'Package Count'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={packageCount}
                  onChange={(e) => setPackageCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {lang === 'my' ? 'ကုန်ပစ္စည်းအသေးစိတ် ဖော်ပြချက်' : 'Item Description'}
              </label>
              <input
                type="text"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                placeholder="ဥပမာ- ဆွယ်တာအထည် ၅ ထုပ်၊ မိုးရေမစိုစေရန် တာပေါ်လင်အုပ်"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Sender (Mandalay) with Smart Auto-Complete */}
          <div className="space-y-3 pt-2 border-t border-slate-800 relative">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                {lang === 'my' ? '၂။ ပို့သူ အချက်အလက် (မန္တလေးဂိတ်)' : '2. Sender Details (Mandalay)'}
              </label>
              <span className="text-[11px] text-amber-400/80 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{lang === 'my' ? 'အမြဲပို့နေကျ ဖောက်သည် အလိုအလျောက်ဖြည့်' : 'Smart Auto-fill'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
              <div className="relative">
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'my' ? 'ပို့သူအမည် *' : 'Sender Name *'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => {
                      setSenderName(e.target.value);
                      setShowSenderSuggestions(true);
                    }}
                    onFocus={() => setShowSenderSuggestions(true)}
                    placeholder="ဦးသန်းထွန်း (ရွှေစင်ကုန်မာ)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <User className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-500" />
                </div>
              </div>

              <div className="relative">
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'my' ? 'ပို့သူဖုန်းနံပါတ် *' : 'Sender Phone *'}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={senderPhone}
                    onChange={(e) => {
                      setSenderPhone(e.target.value);
                      setShowSenderSuggestions(true);
                    }}
                    onFocus={() => setShowSenderSuggestions(true)}
                    placeholder="09-450012345"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <Phone className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-500" />
                </div>
              </div>

              {/* Sender Auto-Complete Dropdown */}
              {showSenderSuggestions && senderSuggestions.length > 0 && (
                <div className="absolute top-[68px] left-0 right-0 z-20 bg-slate-950 border border-amber-500/50 rounded-xl shadow-2xl p-1.5 space-y-1">
                  <span className="text-[10px] text-amber-400 font-semibold px-2 block">
                    {lang === 'my' ? 'အမြဲပို့နေကျ ဖောက်သည်များ (ကလစ်နှိပ်ပါ):' : 'Frequent Senders (Click to fill):'}
                  </span>
                  {senderSuggestions.map((cust) => (
                    <button
                      key={cust.id}
                      type="button"
                      onClick={() => handleSelectSender(cust)}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <span className="font-bold text-white block">{cust.name}</span>
                        <span className="text-[10px] text-slate-400">{cust.address}</span>
                      </div>
                      <span className="font-mono text-amber-300 text-xs">{cust.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {lang === 'my' ? 'မန္တလေးနေရပ်လိပ်စာ' : 'Mandalay Address'}
              </label>
              <input
                type="text"
                value={senderAddress}
                onChange={(e) => setSenderAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 3: Receiver (Kalay) with Smart Auto-Complete */}
          <div className="space-y-3 pt-2 border-t border-slate-800 relative">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                {lang === 'my' ? '၃။ လက်ခံသူ အချက်အလက် (ကလေးမြို့)' : '3. Receiver Details (Kalay)'}
              </label>
              <span className="text-[11px] text-amber-400/80 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{lang === 'my' ? 'ကလေးဖောက်သည် အလိုအလျောက်ဖြည့်' : 'Kalay Auto-fill'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
              <div className="relative">
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'my' ? 'လက်ခံသူအမည် *' : 'Receiver Name *'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={receiverName}
                    onChange={(e) => {
                      setReceiverName(e.target.value);
                      setShowReceiverSuggestions(true);
                    }}
                    onFocus={() => setShowReceiverSuggestions(true)}
                    placeholder="ဒေါ်အေးသီတာ (တာဟန်း ကုန်စုံ)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <User className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-500" />
                </div>
              </div>

              <div className="relative">
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'my' ? 'လက်ခံသူဖုန်းနံပါတ် *' : 'Receiver Phone *'}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={receiverPhone}
                    onChange={(e) => {
                      setReceiverPhone(e.target.value);
                      setShowReceiverSuggestions(true);
                    }}
                    onFocus={() => setShowReceiverSuggestions(true)}
                    placeholder="09-256123456"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <Phone className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-500" />
                </div>
              </div>

              {/* Receiver Auto-Complete Dropdown */}
              {showReceiverSuggestions && receiverSuggestions.length > 0 && (
                <div className="absolute top-[68px] left-0 right-0 z-20 bg-slate-950 border border-amber-500/50 rounded-xl shadow-2xl p-1.5 space-y-1">
                  <span className="text-[10px] text-amber-400 font-semibold px-2 block">
                    {lang === 'my' ? 'အမြဲလက်ခံနေကျ ကလေးဖောက်သည်များ:' : 'Frequent Kalay Receivers:'}
                  </span>
                  {receiverSuggestions.map((cust) => (
                    <button
                      key={cust.id}
                      type="button"
                      onClick={() => handleSelectReceiver(cust)}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <span className="font-bold text-white block">{cust.name}</span>
                        <span className="text-[10px] text-slate-400">{cust.address}</span>
                      </div>
                      <span className="font-mono text-amber-300 text-xs">{cust.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {lang === 'my' ? 'ကလေးမြို့ ပို့ဆောင်ရမည့်လိပ်စာ *' : 'Kalay Town Address *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={receiverAddress}
                  onChange={(e) => setReceiverAddress(e.target.value)}
                  placeholder="ကလေးမြို့၊ တာဟန်းရပ်ကွက်၊ ဗိုလ်ချုပ်လမ်း"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:border-amber-400 focus:outline-none"
                />
                <MapPin className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-500" />
              </div>
            </div>
          </div>

          {/* Section 4: Payment Status & 12-Wheel Truck Assignment */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              {lang === 'my' ? '၄။ ငွေပေးချေမှုနှင့် ၁၂ ဘီးကားခရီးစဉ်သတ်မှတ်ချက်' : '4. Payment & Truck Assignment'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'my' ? 'ငွေပေးချေမှု အခြေအနေ' : 'Payment Status'}
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:border-amber-400 focus:outline-none"
                >
                  <option value="PAID">မန္တလေးဂိတ်တွင် ရှင်းပြီး (Paid)</option>
                  <option value="COD">ကလေးရောက်မှ ငွေချေမည် (COD)</option>
                  <option value="UNPAID">မရှင်းရသေး (Unpaid)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'my' ? '၁၂ ဘီး ကုန်တင်ကား ရွေးချယ်ရန်' : 'Assign 12-Wheel Truck'}
                </label>
                <select
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:border-amber-400 focus:outline-none"
                >
                  <option value="">ကားမတင်ရသေး (ဂိတ်တွင်ခေတ္တထားမည်)</option>
                  {trips.map((trip) => (
                    <option key={trip.id} value={trip.id}>
                      {trip.truckNumber} ({trip.driverName})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-800"
            >
              {lang === 'my' ? 'ပယ်ဖျက်မည်' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 active:scale-95 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{lang === 'my' ? 'ဘောင်ချာထုတ်ပြီး ဂိတ်သွင်းမည်' : 'Save & Generate Voucher'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
