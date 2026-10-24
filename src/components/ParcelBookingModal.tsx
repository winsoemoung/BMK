import React, { useState } from 'react';
import { Parcel, Trip, GatePricingConfig, PaymentStatus, FrequentCustomer, WeightUnit, VISS_TO_KG_RATIO, KG_TO_VISS_RATIO } from '../types/bmk';
import { FREQUENT_CUSTOMERS } from '../data/mockData';
import { formatMMK, formatNumber, rateVissToKg, vissToKg, kgToViss } from '../utils/formatters';
import { X, Check, Calculator, Sparkles, Box, Phone, MapPin, User, Scale, Tag, Edit3, Globe, Truck } from 'lucide-react';

interface ParcelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookParcel: (parcel: Parcel) => void;
  trips: Trip[];
  pricingConfig: GatePricingConfig;
  defaultWeightUnit: WeightUnit;
  lang: 'my' | 'en';
}

export const ParcelBookingModal: React.FC<ParcelBookingModalProps> = ({
  isOpen,
  onClose,
  onBookParcel,
  trips,
  pricingConfig,
  defaultWeightUnit,
  lang,
}) => {
  if (!isOpen) return null;

  const [inputUnit, setInputUnit] = useState<WeightUnit>(defaultWeightUnit);

  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderAddress, setSenderAddress] = useState('မန္တလေး၊ ၈၄ လမ်း');

  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('ကလေးမြို့၊ တာဟန်းရပ်ကွက်');

  const [itemType, setItemType] = useState('ကုန်ခြောက် / စားသောက်ကုန်');
  const [itemDescription, setItemDescription] = useState('');
  const [packageCount, setPackageCount] = useState(1);

  // Weight input in current selected unit
  const [weightInputValue, setWeightInputValue] = useState(inputUnit === 'KG' ? '32.6' : '20');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PAID');
  const [selectedTripId, setSelectedTripId] = useState(trips[0]?.id || '');
  const [notes, setNotes] = useState('');

  // Bulky Goods Rate (ကုန်ပွစျေး)
  const [isBulkyGoods, setIsBulkyGoods] = useState(false);
  const [customBulkyRate, setCustomBulkyRate] = useState<string>(pricingConfig.defaultBulkyRate.toString());
  const [bulkyNote, setBulkyNote] = useState('');

  // Auto-complete suggestion state
  const [showSenderSuggestions, setShowSenderSuggestions] = useState(false);
  const [showReceiverSuggestions, setShowReceiverSuggestions] = useState(false);

  // Parse raw input number
  const parsedInput = Math.max(0.1, parseFloat(weightInputValue) || 0);

  // Normalized weight in Viss & Kg
  const weightViss = inputUnit === 'KG' ? kgToViss(parsedInput) : parsedInput;
  const weightKg = inputUnit === 'KG' ? parsedInput : vissToKg(parsedInput);

  // Effective rate per viss
  const effectiveRatePerViss = isBulkyGoods
    ? (parseFloat(customBulkyRate) || pricingConfig.defaultBulkyRate)
    : pricingConfig.customerRatePerViss;

  // Effective rate per kg
  const effectiveRatePerKg = rateVissToKg(effectiveRatePerViss);

  const totalCustomerFee = weightViss * effectiveRatePerViss;
  const truckExpense = weightViss * pricingConfig.truckRatePerViss;
  const mdyLabor = weightViss * pricingConfig.mdyLaborPerViss;
  const kalayLabor = weightViss * pricingConfig.kalayLaborPerViss;
  const baseProfit = totalCustomerFee - (truckExpense + mdyLabor + kalayLabor);

  // Suggestions
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

  const handleToggleUnit = (unit: WeightUnit) => {
    if (unit === inputUnit) return;
    if (unit === 'KG') {
      const convertedKg = vissToKg(parsedInput);
      setWeightInputValue(convertedKg.toFixed(1));
    } else {
      const convertedViss = kgToViss(parsedInput);
      setWeightInputValue(convertedViss.toFixed(1));
    }
    setInputUnit(unit);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const timestamp = new Date();
    const parcelId = `BMK-${timestamp.toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    const newParcel: Parcel = {
      id: parcelId,
      qrCode: parcelId,
      senderName,
      senderPhone,
      senderAddress,
      receiverName,
      receiverPhone,
      receiverAddress,
      itemType: isBulkyGoods && bulkyNote ? `${itemType} (${bulkyNote})` : itemType,
      itemDescription,
      packageCount: Number(packageCount) || 1,
      weightViss,
      customerRatePerViss: effectiveRatePerViss,
      totalDeliveryFee: totalCustomerFee,
      paymentStatus,
      paymentCollectedAt: paymentStatus === 'PAID' ? 'MANDALAY' : 'KALAY',
      isBulkyGoods,
      bulkyNote: isBulkyGoods ? bulkyNote : undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto font-sans">
      <div className="relative w-full max-w-2xl bg-white border border-[#e4e6eb] rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Facebook-style Modal Header */}
        <div className="relative flex items-center justify-center px-4 py-3.5 border-b border-[#e4e6eb]">
          <h2 className="text-base sm:text-lg font-bold text-[#050505] text-center">
            {lang === 'my' ? 'ကုန်စည်လက်ခံ ဘောင်ချာအသစ်ဖွင့်ရန်' : 'Create Cargo Voucher'}
          </h2>
          <button
            onClick={onClose}
            className="absolute right-3.5 top-3 w-9 h-9 rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] flex items-center justify-center text-[#050505] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Facebook Post Author Row */}
        <div className="px-5 pt-4 pb-2 flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              BMK
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#31a24c] border-2 border-white"></span>
          </div>
          <div>
            <div className="font-bold text-sm text-[#050505] flex items-center gap-2">
              <span>{lang === 'my' ? 'မန္တလေးဂိတ် ကုန်လက်ခံဌာန' : 'Mandalay Cargo Hub'}</span>
              <span className="text-[11px] font-semibold text-[#1877F2] bg-[#e7f3ff] px-2 py-0.5 rounded-full">
                Mandalay ➔ Kalay
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#65676b] mt-0.5">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>{lang === 'my' ? 'အားလုံးမြင်သာ' : 'Public'}</span>
              </span>
              <span>·</span>
              <span>{lang === 'my' ? '၁၂ ဘီး ပုံမှန်ခရီးစဉ်' : '12-Wheeler Direct'}</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* Live Calculation Banner (Facebook Highlight Card) */}
          <div className="p-4 rounded-xl bg-[#f0f2f5] border border-[#1877F2]/30 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#1877F2] font-bold flex items-center gap-1.5">
                <Calculator className="w-4 h-4" />
                <span>
                  {isBulkyGoods
                    ? (lang === 'my' ? 'ကုန်ပွစျေးနှုန်း တွက်ချက်မှု (Bulky Rate)' : 'Bulky Rate')
                    : (lang === 'my' ? 'စံနှုန်းထား တွက်ချက်မှု' : 'Standard Rate')}
                </span>
              </span>
              <span className="text-[#050505] font-mono font-bold bg-white px-2.5 py-0.5 rounded-md border border-[#e4e6eb]">
                {formatNumber(weightViss, 1)} ပိဿာ (~ {formatNumber(weightKg, 1)} Kg)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-[#65676b] block">
                  {lang === 'my' ? 'လူကြီးမင်း ပေးဆောင်ရမည့် ပို့ဆောင်ခ စုစုပေါင်း:' : 'Total Customer Charge:'}
                </span>
                <span className="text-xs font-semibold text-[#050505] font-mono">
                  {formatNumber(effectiveRatePerViss)} ကျပ်/ပိဿာ (~ {formatNumber(effectiveRatePerKg, 1)} ကျပ်/Kg)
                </span>
              </div>
              <span className="text-2xl font-black font-mono text-[#1877F2]">
                {formatMMK(totalCustomerFee)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#e4e6eb] text-xs">
              <div className="text-[#65676b]">
                <span>၁၂ ဘီးကားခ ({pricingConfig.truckRatePerViss}):</span>
                <span className="block font-mono font-semibold text-[#050505] mt-0.5">{formatMMK(truckExpense)}</span>
              </div>
              <div className="text-[#65676b]">
                <span>အလုပ်သမား ({pricingConfig.mdyLaborPerViss}+{pricingConfig.kalayLaborPerViss}):</span>
                <span className="block font-mono font-semibold text-[#050505] mt-0.5">{formatMMK(mdyLabor + kalayLabor)}</span>
              </div>
              <div className="text-[#31a24c]">
                <span className="font-semibold">ဂိတ်အသားတင်အမြတ်:</span>
                <span className="block font-mono font-bold text-[#31a24c] mt-0.5">+{formatMMK(baseProfit)}</span>
              </div>
            </div>
          </div>

          {/* Section 1: Weight Input (Viss vs Kg selector) & Bulky Goods Feature */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold text-[#050505] uppercase tracking-wide block">
                {lang === 'my' ? '၁။ အလေးချိန် (ပိဿာ / ကီလို) နှင့် ကုန်စည်' : '1. Weight Unit & Item Category'}
              </label>

              <div className="flex items-center gap-2">
                {/* Weight Unit Toggle for input */}
                <div className="inline-flex rounded-lg bg-[#f0f2f5] border border-[#e4e6eb] p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => handleToggleUnit('VISS')}
                    className={`px-3 py-1 rounded font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      inputUnit === 'VISS'
                        ? 'bg-[#1877F2] text-white shadow-sm'
                        : 'text-[#65676b] hover:text-[#050505]'
                    }`}
                  >
                    <Scale className="w-3 h-3" />
                    <span>ပိဿာ (Viss)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleUnit('KG')}
                    className={`px-3 py-1 rounded font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      inputUnit === 'KG'
                        ? 'bg-[#1877F2] text-white shadow-sm'
                        : 'text-[#65676b] hover:text-[#050505]'
                    }`}
                  >
                    <span>ကီလို (Kg)</span>
                  </button>
                </div>

                {/* Bulky Goods Toggle */}
                <button
                  type="button"
                  onClick={() => setIsBulkyGoods(!isBulkyGoods)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    isBulkyGoods
                      ? 'bg-purple-100 text-purple-800 border-purple-300'
                      : 'bg-[#f0f2f5] text-[#65676b] border-[#e4e6eb] hover:bg-[#e4e6eb] hover:text-[#050505]'
                  }`}
                >
                  <Box className="w-3.5 h-3.5 text-purple-600" />
                  <span>{lang === 'my' ? 'ကုန်ပွစျေး' : 'Bulky Mode'}</span>
                </button>
              </div>
            </div>

            {/* Bulky Goods Custom Pricing Strip */}
            {isBulkyGoods && (
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    {lang === 'my'
                      ? 'ထုထည်ကြီးပြီး ပေါ့သော ပစ္စည်း (ကုန်ပွစျေး စိတ်ကြိုက်သတ်မှတ်ရန်)'
                      : 'Volumetric / Bulky Goods Custom Rate'}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-purple-700">
                    ~ {formatNumber(rateVissToKg(parseFloat(customBulkyRate) || 0), 1)} ကျပ်/Kg
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-purple-900 font-semibold block mb-1">
                      {lang === 'my' ? 'စိတ်ကြိုက်နှုန်းထား (ကျပ် / ပိဿာ)' : 'Custom Rate (MMK / Viss)'}
                    </label>
                    <input
                      type="number"
                      min="1000"
                      step="50"
                      value={customBulkyRate}
                      onChange={(e) => setCustomBulkyRate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-[#050505] font-mono font-bold focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-purple-900 font-semibold block mb-1">
                      {lang === 'my' ? 'ကုန်ပွ မှတ်ချက် (ဥပမာ မွေ့ရာ၊ ပေါင်မုန့်ဖာ)' : 'Bulky Note'}
                    </label>
                    <input
                      type="text"
                      value={bulkyNote}
                      onChange={(e) => setBulkyNote(e.target.value)}
                      placeholder="ဥပမာ- ရေမြှုပ်မွေ့ရာ၊ ပလတ်စတစ်ခွက်ဖာ"
                      className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-[#050505] text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Weight Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-[#050505]">
                    {lang === 'my' ? 'အလေးချိန်' : 'Weight'} ({inputUnit === 'KG' ? 'Kg' : 'ပိဿာ'}) *
                  </label>
                  <span className="text-[11px] font-mono font-semibold text-[#1877F2]">
                    {inputUnit === 'KG'
                      ? `~ ${formatNumber(weightViss, 1)} ပိဿာ`
                      : `~ ${formatNumber(weightKg, 1)} Kg`}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={weightInputValue}
                    onChange={(e) => setWeightInputValue(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg text-[#050505] font-mono font-bold focus:bg-white focus:ring-2 focus:ring-[#1877F2] focus:outline-none"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-[#65676b]">
                    {inputUnit === 'KG' ? 'Kg' : 'ပိဿာ'}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#050505] flex items-center gap-1">
                    <Edit3 className="w-3.5 h-3.5 text-[#1877F2]" />
                    <span>{lang === 'my' ? 'ကုန်စည်အမျိုးအစား (စိတ်ကြိုက်ရေးနိုင်)' : 'Item Category (Custom)'} *</span>
                  </label>
                  <span className="text-[10px] text-[#1877F2] font-semibold">
                    {lang === 'my' ? 'တိုက်ရိုက်ရိုက်ထည့်ပါ' : 'Editable'}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    list="item-category-suggestions"
                    value={itemType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setItemType(val);
                      if (val.includes('ကုန်ပွ') || val.includes('မွေ့ရာ') || val.includes('ရေမြှုပ်')) {
                        setIsBulkyGoods(true);
                      }
                    }}
                    placeholder="ဥပမာ- ဆေးဝါး၊ သီးနှံ၊ ဆိုင်ကယ်အပိုပစ္စည်း"
                    className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#1877F2]/50 rounded-lg text-[#050505] text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#1877F2] focus:outline-none placeholder-[#65676b]"
                  />
                  <datalist id="item-category-suggestions">
                    <option value="ကုန်ခြောက် / စားသောက်ကုန်" />
                    <option value="အထည်အလိပ် / ဖက်ရှင်" />
                    <option value="ဆေးဝါးနှင့် ကျန်းမာရေးသုံးပစ္စည်း" />
                    <option value="စက်ပစ္စည်း အပိုပစ္စည်း" />
                    <option value="အလှကုန်နှင့် လူသုံးကုန်" />
                    <option value="လျှပ်စစ်နှင့် ဖုန်းဆက်စပ်ပစ္စည်း" />
                    <option value="သီးနှံနှင့် ပဲမျိုးစုံ" />
                    <option value="စာရွက်စာတမ်း / စာအုပ်" />
                    <option value="ကုန်ပွ (မွေ့ရာ/ရေမြှုပ်/မုန့်)" />
                    <option value="အခြား အထွေထွေ" />
                  </datalist>
                </div>

                {/* Quick Selection Chips */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[
                    'ကုန်ခြောက်',
                    'အထည်အလိပ်',
                    'ဆေးဝါး',
                    'စက်ပစ္စည်း',
                    'အလှကုန်',
                    'လျှပ်စစ်',
                    'သီးနှံ/ပဲ',
                    'ကုန်ပွ',
                  ].map((catName) => (
                    <button
                      key={catName}
                      type="button"
                      onClick={() => {
                        if (catName === 'ကုန်ခြောက်') setItemType('ကုန်ခြောက် / စားသောက်ကုန်');
                        else if (catName === 'အထည်အလိပ်') setItemType('အထည်အလိပ် / ဖက်ရှင်');
                        else if (catName === 'ဆေးဝါး') setItemType('ဆေးဝါးနှင့် ကျန်းမာရေး');
                        else if (catName === 'စက်ပစ္စည်း') setItemType('စက်ပစ္စည်း အပိုပစ္စည်း');
                        else if (catName === 'အလှကုန်') setItemType('အလှကုန်နှင့် လူသုံးကုန်');
                        else if (catName === 'လျှပ်စစ်') setItemType('လျှပ်စစ်နှင့် ဖုန်းပစ္စည်း');
                        else if (catName === 'သီးနှံ/ပဲ') setItemType('သီးနှံနှင့် ပဲမျိုးစုံ');
                        else if (catName === 'ကုန်ပွ') {
                          setItemType('ကုန်ပွ (မွေ့ရာ/ရေမြှုပ်/မုန့်)');
                          setIsBulkyGoods(true);
                        }
                      }}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#f0f2f5] hover:bg-[#e4e6eb] text-[#65676b] hover:text-[#050505] border border-[#e4e6eb] font-medium transition-colors cursor-pointer"
                    >
                      {catName}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#050505] block mb-1">
                  {lang === 'my' ? 'ထုပ်ပိုးအရေအတွက်' : 'Package Count'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={packageCount}
                  onChange={(e) => setPackageCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg text-[#050505] font-mono font-bold focus:bg-white focus:ring-2 focus:ring-[#1877F2] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#050505] block mb-1">
                {lang === 'my' ? 'ကုန်ပစ္စည်းအသေးစိတ် ဖော်ပြချက်' : 'Item Description'}
              </label>
              <input
                type="text"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                placeholder="ဥပမာ- ဆွယ်တာအထည် ၅ ထုပ်၊ မိုးရေမစိုစေရန် တာပေါ်လင်အုပ်"
                className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg text-[#050505] text-xs focus:bg-white focus:ring-2 focus:ring-[#1877F2] focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Sender (Mandalay) with Smart Auto-Complete */}
          <div className="space-y-3 pt-2 border-t border-[#e4e6eb] relative">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#050505] uppercase tracking-wide block">
                {lang === 'my' ? '၂။ ပို့သူ အချက်အလက် (မန္တလေးဂိတ်)' : '2. Sender Details (Mandalay)'}
              </label>
              <span className="text-[11px] text-[#1877F2] font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? 'ဖောက်သည် အလိုအလျောက်ဖြည့်' : 'Smart Auto-fill'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
              <div className="relative">
                <label className="text-xs font-semibold text-[#65676b] block mb-1">
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
                    className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg text-[#050505] text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#1877F2] focus:outline-none"
                  />
                  <User className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-[#65676b]" />
                </div>
              </div>

              <div className="relative">
                <label className="text-xs font-semibold text-[#65676b] block mb-1">
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
                    className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg text-[#050505] font-mono text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#1877F2] focus:outline-none"
                  />
                  <Phone className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-[#65676b]" />
                </div>
              </div>

              {/* Sender Suggestions */}
              {showSenderSuggestions && senderSuggestions.length > 0 && (
                <div className="absolute top-[68px] left-0 right-0 z-20 bg-white border border-[#1877F2]/40 rounded-xl shadow-xl p-1.5 space-y-1">
                  <span className="text-[10px] text-[#1877F2] font-bold px-2 block">
                    {lang === 'my' ? 'အမြဲပို့နေကျ ဖောက်သည်များ:' : 'Frequent Senders:'}
                  </span>
                  {senderSuggestions.map((cust) => (
                    <button
                      key={cust.id}
                      type="button"
                      onClick={() => handleSelectSender(cust)}
                      className="w-full text-left p-2 rounded-lg hover:bg-[#f0f2f5] text-xs text-[#050505] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-[#050505] block">{cust.name}</span>
                        <span className="text-[10px] text-[#65676b]">{cust.address}</span>
                      </div>
                      <span className="font-mono text-[#1877F2] font-bold text-xs">{cust.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#65676b] block mb-1">
                {lang === 'my' ? 'မန္တလေးနေရပ်လိပ်စာ' : 'Mandalay Address'}
              </label>
              <input
                type="text"
                value={senderAddress}
                onChange={(e) => setSenderAddress(e.target.value)}
                className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg text-[#050505] text-xs focus:bg-white focus:ring-2 focus:ring-[#1877F2] focus:outline-none"
              />
            </div>
          </div>

          {/* Section 3: Receiver (Kalay) with Smart Auto-Complete */}
          <div className="space-y-3 pt-2 border-t border-[#e4e6eb] relative">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#050505] uppercase tracking-wide block">
                {lang === 'my' ? '၃။ လက်ခံသူ အချက်အလက် (ကလေးမြို့)' : '3. Receiver Details (Kalay)'}
              </label>
              <span className="text-[11px] text-[#1877F2] font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'my' ? 'ကလေးဖောက်သည် အလိုအလျောက်ဖြည့်' : 'Kalay Auto-fill'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
              <div className="relative">
                <label className="text-xs font-semibold text-[#65676b] block mb-1">
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
                    className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg text-[#050505] text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#1877F2] focus:outline-none"
                  />
                  <User className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-[#65676b]" />
                </div>
              </div>

              <div className="relative">
                <label className="text-xs font-semibold text-[#65676b] block mb-1">
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
                    className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg text-[#050505] font-mono text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#1877F2] focus:outline-none"
                  />
                  <Phone className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-[#65676b]" />
                </div>
              </div>

              {/* Receiver Suggestions */}
              {showReceiverSuggestions && receiverSuggestions.length > 0 && (
                <div className="absolute top-[68px] left-0 right-0 z-20 bg-white border border-[#1877F2]/40 rounded-xl shadow-xl p-1.5 space-y-1">
                  <span className="text-[10px] text-[#1877F2] font-bold px-2 block">
                    {lang === 'my' ? 'အမြဲလက်ခံနေကျ ကလေးဖောက်သည်များ:' : 'Frequent Kalay Receivers:'}
                  </span>
                  {receiverSuggestions.map((cust) => (
                    <button
                      key={cust.id}
                      type="button"
                      onClick={() => handleSelectReceiver(cust)}
                      className="w-full text-left p-2 rounded-lg hover:bg-[#f0f2f5] text-xs text-[#050505] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-[#050505] block">{cust.name}</span>
                        <span className="text-[10px] text-[#65676b]">{cust.address}</span>
                      </div>
                      <span className="font-mono text-[#1877F2] font-bold text-xs">{cust.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#65676b] block mb-1">
                {lang === 'my' ? 'ကလေးမြို့ ပို့ဆောင်ရမည့်လိပ်စာ *' : 'Kalay Town Address *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={receiverAddress}
                  onChange={(e) => setReceiverAddress(e.target.value)}
                  placeholder="ကလေးမြို့၊ တာဟန်းရပ်ကွက်၊ ဗိုလ်ချုပ်လမ်း"
                  className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg text-[#050505] text-xs focus:bg-white focus:ring-2 focus:ring-[#1877F2] focus:outline-none"
                />
                <MapPin className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-[#65676b]" />
              </div>
            </div>
          </div>

          {/* Section 4: Payment Status & 12-Wheel Truck Assignment */}
          <div className="space-y-3 pt-2 border-t border-[#e4e6eb]">
            <label className="text-xs font-bold text-[#050505] uppercase tracking-wide block">
              {lang === 'my' ? '၄။ ငွေပေးချေမှုနှင့် ၁၂ ဘီးကားခရီးစဉ်သတ်မှတ်ချက်' : '4. Payment & Truck Assignment'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#65676b] block mb-1">
                  {lang === 'my' ? 'ငွေပေးချေမှု အခြေအနေ' : 'Payment Status'}
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg text-[#050505] text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#1877F2] focus:outline-none"
                >
                  <option value="PAID">မန္တလေးဂိတ်တွင် ရှင်းပြီး (Paid)</option>
                  <option value="COD">ကလေးရောက်မှ ငွေချေမည် (COD)</option>
                  <option value="UNPAID">မရှင်းရသေး (Unpaid)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#65676b] block mb-1">
                  {lang === 'my' ? '၁၂ ဘီး ကုန်တင်ကား ရွေးချယ်ရန်' : 'Assign 12-Wheel Truck'}
                </label>
                <select
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg text-[#050505] text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#1877F2] focus:outline-none"
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

          {/* Facebook-style Modal Footer Actions */}
          <div className="pt-4 border-t border-[#e4e6eb] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-[#e4e6eb] hover:bg-[#d8dadf] text-[#050505] text-xs font-bold transition-all cursor-pointer"
            >
              {lang === 'my' ? 'ပယ်ဖျက်မည်' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs shadow-sm active:scale-95 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{lang === 'my' ? 'ဘောင်ချာဖွင့်ပြီး ဂိတ်သွင်းမည်' : 'Publish Cargo Voucher'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
