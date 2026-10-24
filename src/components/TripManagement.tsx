import React, { useState } from 'react';
import { Trip, TripStatus, UserRole, Parcel, BMK_PRICING, DriverExpenseEntry } from '../types/bmk';
import { formatMMK, formatNumber, generateArrivalNotificationText, generateSmsArrivalText, openViberShare, openSmsApp, cleanPhoneNumber } from '../utils/formatters';
import { 
  Truck, 
  Plus, 
  Calendar, 
  MapPin, 
  FileText, 
  DollarSign, 
  Printer, 
  CheckCircle2, 
  X, 
  Fuel, 
  Receipt,
  ShieldCheck,
  ArrowRight,
  BellRing,
  MessageSquare,
  Send,
  PhoneCall,
  Check
} from 'lucide-react';

interface TripManagementProps {
  trips: Trip[];
  parcels: Parcel[];
  onAddTrip: (trip: Trip) => void;
  onUpdateTripStatus: (tripId: string, status: TripStatus) => void;
  onUpdateTripSettlement: (tripId: string, advanceMdy: number, isSettled: boolean) => void;
  onAddTripExpense: (tripId: string, expense: DriverExpenseEntry) => void;
  userRole: UserRole;
  lang: 'my' | 'en';
  onMarkParcelNotified?: (parcelId: string, type: 'INTAKE' | 'ARRIVAL') => void;
}

export const TripManagement: React.FC<TripManagementProps> = ({
  trips,
  parcels,
  onAddTrip,
  onUpdateTripStatus,
  onUpdateTripSettlement,
  onAddTripExpense,
  userRole,
  lang,
  onMarkParcelNotified,
}) => {
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [truckNumber, setTruckNumber] = useState('7A-1088 (Nissan Diesel 12-Wheeler)');
  const [driverName, setDriverName] = useState('ကိုတင်အေး');
  const [driverPhone, setDriverPhone] = useState('09-790112233');
  const [maxCapacity, setMaxCapacity] = useState('8000');
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().slice(0, 10));
  const [initialAdvance, setInitialAdvance] = useState('250000');

  // Modals
  const [manifestTrip, setManifestTrip] = useState<Trip | null>(null);
  const [settlementTrip, setSettlementTrip] = useState<Trip | null>(null);
  const [arrivalNotifyTrip, setArrivalNotifyTrip] = useState<Trip | null>(null);

  // New Expense entry state
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseLocation, setExpenseLocation] = useState('မုံရွာ');
  const [expenseCategory, setExpenseCategory] = useState<'FUEL' | 'TOLL_GATE' | 'CHECKPOINT' | 'ALLOWANCE'>('FUEL');

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const cap = parseFloat(maxCapacity) || 8000;
    const advance = parseFloat(initialAdvance) || 0;
    const newTripId = `TRIP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      10 + Math.random() * 90
    )}`;

    const newTrip: Trip = {
      id: newTripId,
      truckNumber,
      driverName,
      driverPhone,
      departureDate,
      expectedArrivalDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      route: 'Mandalay -> Monywa -> Gangaw -> Kalay (မန္တလေး - မုံရွာ - ဂန့်ဂေါ - ကလေး)',
      status: 'LOADING',
      maxCapacityViss: cap,
      currentLoadedViss: 0,
      parcelIds: [],
      totalTruckRentFee: 0,
      totalMdyLabor: 0,
      totalKalayLabor: 0,
      advancePaymentMdy: advance,
      roadExpensesAllowance: 50000,
      expenses: [],
      remainingSettlementKalay: 0,
      isDriverSettled: false,
      notes: '၁၂ ဘီး ကုန်တင်ကားသစ် ဂိတ်တွင် စတင်တင်ဆောင်နေသည်',
    };

    onAddTrip(newTrip);
    setIsCreatingTrip(false);
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlementTrip || !expenseAmount) return;

    const newExpense: DriverExpenseEntry = {
      id: `EXP-${Date.now().toString().slice(-4)}`,
      category: expenseCategory,
      description: expenseDesc || `${expenseCategory} စရိတ်`,
      amount: parseFloat(expenseAmount) || 0,
      date: new Date().toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit' }),
      location: expenseLocation,
    };

    onAddTripExpense(settlementTrip.id, newExpense);
    setExpenseDesc('');
    setExpenseAmount('');
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Top Banner (Facebook Group / Fleet Header) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl border border-[#e4e6eb] bg-white shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#050505]">
              {lang === 'my' ? '၁၂ ဘီး ကုန်တင်ကားကြီးများ စီမံခန့်ခွဲမှု' : '12-Wheel Truck Fleet'}
            </h2>
          </div>
          <p className="text-xs text-[#65676b] mt-1">
            {lang === 'my'
              ? 'ခရီးစဉ်အလိုက် ၁၂ ဘီးကားခ (၁,၁၀၀/ပိသာ)၊ ယာဉ်မောင်း ဆီဖိုး/လမ်းစရိတ် ကြိုထုတ်ငွေ၊ ကလေးဂိတ်ကျန်ငွေရှင်းတမ်းနှင့် ကုန်စည်စာရင်းချုပ် (Manifest)'
              : '12-Wheel Truck chartering, driver advance, Kalay final settlement ledger, and Cargo Manifest.'}
          </p>
        </div>

        <button
          onClick={() => setIsCreatingTrip(!isCreatingTrip)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs shadow-sm transition-all whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'my' ? '၁၂ ဘီးကား ခရီးစဉ်သစ်ဖွင့်' : 'New Trip'}</span>
        </button>
      </div>

      {/* New Trip Form */}
      {isCreatingTrip && (
        <form
          onSubmit={handleCreateTrip}
          className="p-5 rounded-xl border border-[#e4e6eb] bg-white shadow-md space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#1877F2] text-sm">
              {lang === 'my' ? '၁၂ ဘီး ကားသစ် ခရီးစဉ်စာချုပ်သွင်းခြင်း' : 'Charter New 12-Wheel Truck Trip'}
            </h3>
            <button
              type="button"
              onClick={() => setIsCreatingTrip(false)}
              className="text-xs text-[#65676b] hover:text-[#050505] cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="text-[#65676b] block mb-1">
                {lang === 'my' ? '၁၂ ဘီး ကားနံပါတ် / အမျိုးအစား' : 'Truck ID / Model'}
              </label>
              <input
                type="text"
                required
                value={truckNumber}
                onChange={(e) => setTruckNumber(e.target.value)}
                className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg text-[#050505] focus:bg-white focus:ring-2 focus:ring-[#1877F2]"
                placeholder="7A-1088 (Nissan Diesel)"
              />
            </div>

            <div>
              <label className="text-[#65676b] block mb-1">
                {lang === 'my' ? 'ယာဉ်မောင်းအမည်' : 'Driver Name'}
              </label>
              <input
                type="text"
                required
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg text-[#050505] focus:bg-white focus:ring-2 focus:ring-[#1877F2]"
              />
            </div>

            <div>
              <label className="text-[#65676b] block mb-1">
                {lang === 'my' ? 'ယာဉ်မောင်းဖုန်းနံပါတ်' : 'Driver Phone'}
              </label>
              <input
                type="tel"
                required
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg text-[#050505] font-mono focus:bg-white focus:ring-2 focus:ring-[#1877F2]"
              />
            </div>

            <div>
              <label className="text-[#65676b] block mb-1">
                {lang === 'my' ? 'အများဆုံး တင်နိုင်သော ပိသာ' : 'Max Viss Capacity'}
              </label>
              <input
                type="number"
                required
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg text-[#050505] font-mono focus:bg-white focus:ring-2 focus:ring-[#1877F2]"
              />
            </div>

            <div>
              <label className="text-[#1877F2] block mb-1 font-semibold">
                {lang === 'my' ? 'မန္တလေးထွက်ခွာချိန် ကြိုထုတ်ငွေ' : 'Mandalay Advance (MMK)'}
              </label>
              <input
                type="number"
                value={initialAdvance}
                onChange={(e) => setInitialAdvance(e.target.value)}
                className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#1877F2]/40 rounded-lg text-[#050505] font-mono font-bold focus:bg-white focus:ring-2 focus:ring-[#1877F2]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#e4e6eb]">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs cursor-pointer"
            >
              {lang === 'my' ? 'ခရီးစဉ် စာရင်းသွင်းမည်' : 'Save Trip'}
            </button>
          </div>
        </form>
      )}

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trips.map((trip) => {
          const loadPct = Math.min(100, Math.round((trip.currentLoadedViss / trip.maxCapacityViss) * 100));
          const remainingToSettle = Math.max(0, trip.totalTruckRentFee - trip.advancePaymentMdy);

          return (
            <div
              key={trip.id}
              className="p-4 sm:p-5 rounded-xl border border-[#e4e6eb] bg-white shadow-sm hover:shadow-md transition-shadow space-y-3.5 text-[#050505]"
            >
              {/* Trip Header */}
              <div className="flex items-center justify-between border-b border-[#e4e6eb] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#1877F2] text-sm">{trip.id}</span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        trip.status === 'IN_TRANSIT'
                          ? 'bg-amber-100 text-amber-800'
                          : trip.status === 'ARRIVED'
                          ? 'bg-purple-100 text-purple-800'
                          : trip.status === 'LOADING'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-[#f0f2f5] text-[#65676b]'
                      }`}
                    >
                      {trip.status === 'LOADING'
                        ? 'မန္တလေးဂိတ်တွင် ကားပေါ်တင်ဆဲ'
                        : trip.status === 'IN_TRANSIT'
                        ? 'လမ်းခရီးတွင် (ဂန့်ဂေါလမ်းပိုင်း)'
                        : trip.status === 'ARRIVED'
                        ? 'ကလေးဂိတ်သို့ ရောက်ရှိ'
                        : 'ပြီးစီး'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#050505] mt-1">{trip.truckNumber}</h3>
                </div>

                <div className="text-right text-xs text-[#65676b] space-y-0.5">
                  <div className="flex items-center gap-1 justify-end">
                    <Calendar className="w-3.5 h-3.5 text-[#65676b]" />
                    <span>{trip.departureDate}</span>
                  </div>
                  <div className="text-[#050505] font-semibold">{trip.driverName}</div>
                  <div className="font-mono text-[#1877F2]">{trip.driverPhone}</div>
                </div>
              </div>

              {/* Route */}
              <div className="p-2.5 rounded-lg bg-[#f0f2f5] border border-[#e4e6eb] text-xs flex items-center gap-2 text-[#050505]">
                <MapPin className="w-4 h-4 text-[#1877F2] shrink-0" />
                <span className="truncate">{trip.route}</span>
              </div>

              {/* Capacity Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#65676b]">
                    {lang === 'my' ? 'တင်ဆောင်ပြီး ပိသာ:' : 'Loaded Capacity:'}
                  </span>
                  <span className="font-mono font-bold text-[#050505]">
                    {formatNumber(trip.currentLoadedViss)} / {formatNumber(trip.maxCapacityViss)} ပိသာ ({loadPct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#e4e6eb] overflow-hidden">
                  <div
                    className="h-full bg-[#1877F2] rounded-full transition-all duration-300"
                    style={{ width: `${loadPct}%` }}
                  />
                </div>
              </div>

              {/* Driver Trip Advance & Settlement Strip */}
              <div className="p-3 rounded-lg bg-[#f0f2f5] border border-[#e4e6eb] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#050505] flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === 'my' ? 'ယာဉ်မောင်း စာရင်းရှင်းတမ်း' : 'Driver Settlement Ledger'}</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      trip.isDriverSettled
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {trip.isDriverSettled ? 'ရှင်းတမ်းပြီးစီး' : 'ကျန်ငွေရှင်းရန်ရှိ'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#e4e6eb]">
                  <div>
                    <span className="text-[#65676b] block text-[10px]">ကားခ စုစုပေါင်း:</span>
                    <span className="font-mono font-bold text-[#050505]">
                      {formatMMK(trip.totalTruckRentFee)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#65676b] block text-[10px]">ကြိုထုတ်ငွေ:</span>
                    <span className="font-mono text-amber-600 font-bold">
                      {formatMMK(trip.advancePaymentMdy)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#65676b] block text-[10px]">ကလေးတွင်ရှင်းရန်:</span>
                    <span
                      className={`font-mono font-bold ${
                        trip.isDriverSettled ? 'text-[#65676b] line-through' : 'text-emerald-600'
                      }`}
                    >
                      {formatMMK(remainingToSettle)}
                    </span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-end">
                  <button
                    onClick={() => setSettlementTrip(trip)}
                    className="text-[11px] text-[#1877F2] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>{lang === 'my' ? 'ဆီဖိုး/လမ်းစရိတ် ရှင်းတမ်း' : 'Manage Driver Ledger'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Action Buttons: Manifest, Status update */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#e4e6eb]">
                <button
                  onClick={() => setManifestTrip(trip)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f0f2f5] hover:bg-[#e4e6eb] text-[#050505] font-semibold text-xs border border-[#e4e6eb] transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#1877F2]" />
                  <span>{lang === 'my' ? 'ကုန်စည်စာရင်းချုပ် (Manifest)' : 'Cargo Manifest'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {trip.status === 'LOADING' && (
                    <button
                      onClick={() => onUpdateTripStatus(trip.id, 'IN_TRANSIT')}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs"
                    >
                      {lang === 'my' ? 'မန္တလေးမှ ထွက်ခွာမည်' : 'Depart Mandalay'}
                    </button>
                  )}
                  {trip.status === 'IN_TRANSIT' && (
                    <button
                      onClick={() => {
                        onUpdateTripStatus(trip.id, 'ARRIVED');
                        setArrivalNotifyTrip(trip);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{lang === 'my' ? 'ကလေးဂိတ်သို့ ရောက်ရှိ' : 'Arrived at Kalay'}</span>
                    </button>
                  )}
                  {trip.status === 'ARRIVED' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setArrivalNotifyTrip(trip)}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all"
                        title="Send arrival notification to all customers"
                      >
                        <BellRing className="w-3.5 h-3.5" />
                        <span>{lang === 'my' ? 'ဖောက်သည်များထံ အသိပေးစာပို့' : 'Notify Customers'}</span>
                      </button>
                      <button
                        onClick={() => onUpdateTripStatus(trip.id, 'COMPLETED')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                      >
                        {lang === 'my' ? 'ခရီးစဉ် ပြီးစီးကြောင်း အတည်ပြု' : 'Mark Completed'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Cargo Manifest (ကားပေါ်တင် ကုန်စည်စာရင်းချုပ် / Consignment Note) */}
      {manifestTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  {lang === 'my' ? '၁၂ ဘီးကား ကုန်စည်စာရင်းချုပ် (Trip Cargo Manifest)' : '12-Wheel Cargo Manifest'}
                </h3>
              </div>
              <button
                onClick={() => setManifestTrip(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Manifest Sheet */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div
                id="printable-manifest"
                className="p-6 rounded-xl bg-white text-slate-900 font-sans shadow-md border border-slate-200 text-xs space-y-4"
              >
                {/* Official Header */}
                <div className="border-b-2 border-slate-800 pb-3 flex items-start justify-between">
                  <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
                      BMK EXPRESS CAR GATE (မန္တလေး ⇄ ကလေး)
                    </h1>
                    <div className="text-xs text-slate-700 font-semibold">
                      ၁၂ ဘီး ကုန်တင်ယာဉ် ကုန်စည်စာရင်းချုပ် နှင့် လမ်းခရီး ခွင့်ပြုမိတ္တူ (Consignment Manifest)
                    </div>
                    <div className="text-[11px] text-slate-500 pt-0.5">
                      စစ်ဆေးရေးဂိတ်များနှင့် လမ်းကြောင်းအာဏာပိုင်များထံ ပြသရန် တရားဝင် ကုန်စည်စာရင်း
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <div className="font-bold text-slate-900">စာရင်းအမှတ်: {manifestTrip.id}</div>
                    <div className="text-slate-600">နေ့စွဲ: {manifestTrip.departureDate}</div>
                    <div className="text-slate-600">ယာဉ်နံပါတ်: {manifestTrip.truckNumber}</div>
                  </div>
                </div>

                {/* Logistics Meta Box */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-100 rounded-lg text-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">ယာဉ်မောင်း:</span>
                    <span className="font-bold">{manifestTrip.driverName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">ဖုန်းနံပါတ်:</span>
                    <span className="font-mono font-bold">{manifestTrip.driverPhone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">ခရီးစဉ်လမ်းကြောင်း:</span>
                    <span className="font-medium">မန္တလေး - မုံရွာ - ဂန့်ဂေါ - ကလေး</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">တင်ဆောင်ပိသာ / ဘောင်ချာ:</span>
                    <span className="font-bold text-slate-900">
                      {formatNumber(manifestTrip.currentLoadedViss)} ပိသာ ({manifestTrip.parcelIds.length} ဘောင်ချာ)
                    </span>
                  </div>
                </div>

                {/* Table of Onboard Parcels */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-300 bg-slate-50 text-slate-700">
                        <th className="py-2 px-2 font-bold">စဉ်</th>
                        <th className="py-2 px-2 font-bold">ဘောင်ချာအမှတ်</th>
                        <th className="py-2 px-2 font-bold">ပို့သူ (မန္တလေး)</th>
                        <th className="py-2 px-2 font-bold">လက်ခံသူ (ကလေး)</th>
                        <th className="py-2 px-2 font-bold">ကုန်စည်အမျိုးအစား</th>
                        <th className="py-2 px-2 font-bold text-right">အလေးချိန်</th>
                        <th className="py-2 px-2 font-bold text-right">ငွေပေးချေမှု</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {parcels
                        .filter((p) => manifestTrip.parcelIds.includes(p.id))
                        .map((p, index) => (
                          <tr key={p.id} className="hover:bg-slate-50/80">
                            <td className="py-2 px-2 font-mono">{index + 1}</td>
                            <td className="py-2 px-2 font-mono font-semibold">{p.id}</td>
                            <td className="py-2 px-2">{p.senderName}</td>
                            <td className="py-2 px-2">
                              {p.receiverName} ({p.receiverPhone})
                            </td>
                            <td className="py-2 px-2">
                              {p.itemType}
                              {p.isBulkyGoods && (
                                <span className="ml-1 text-[9px] px-1 bg-purple-100 text-purple-800 rounded font-semibold">
                                  ကုန်ပွ
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-right font-mono font-bold">
                              {p.weightViss} ပိသာ
                            </td>
                            <td className="py-2 px-2 text-right">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  p.paymentStatus === 'PAID'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : p.paymentStatus === 'COD'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {p.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Strip */}
                <div className="flex justify-between items-center pt-3 border-t-2 border-slate-800 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">
                      အထက်ဖော်ပြပါ ကုန်စည်များအား မန္တလေးဂိတ်မှ စနစ်တကျ စစ်ဆေးတင်ပို့လိုက်ပါသည်။
                    </span>
                    <span className="text-[10px] text-slate-500">
                      BMK EXPRESS CAR GATE · MANDALAY WAREHOUSE
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-600 block text-[11px]">စုစုပေါင်း ပိသာအလေးချိန်:</span>
                    <span className="text-base font-extrabold font-mono text-slate-900">
                      {formatNumber(manifestTrip.currentLoadedViss)} ပိသာ
                    </span>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-4 pt-8 text-center text-[11px] text-slate-600">
                  <div className="border-t border-slate-300 pt-1">မန္တလေးဂိတ်မှူး လက်မှတ်</div>
                  <div className="border-t border-slate-300 pt-1">ယာဉ်မောင်း လက်မှတ်</div>
                  <div className="border-t border-slate-300 pt-1">ကလေးဂိတ် လက်ခံသူ လက်မှတ်</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>စာရင်းချုပ် ပရင့်ထုတ်မည် (Print Manifest)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Driver Advance & Settlement Ledger (ယာဉ်မောင်း လမ်းစရိတ်နှင့် ကြိုထုတ်ငွေ စာရင်းရှင်းတမ်း) */}
      {settlementTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-white text-base">
                    {lang === 'my' ? 'ယာဉ်မောင်း လမ်းစရိတ်နှင့် ငွေရှင်းတမ်း' : 'Driver Advance & Settlement Ledger'}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {settlementTrip.truckNumber} ({settlementTrip.driverName})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSettlementTrip(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Financial Balance Summary */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">၁၂ ဘီးကား စုစုပေါင်း ကားငှါးခ (1,100 x {settlementTrip.currentLoadedViss} ပိသာ):</span>
                  <span className="font-mono font-bold text-slate-100 text-sm">
                    {formatMMK(settlementTrip.totalTruckRentFee)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-amber-400 font-medium">မန္တလေးမှ ထွက်ခွာချိန် ဆီဖိုး/လမ်းစရိတ် ကြိုထုတ်ငွေ:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    -{formatMMK(settlementTrip.advancePaymentMdy)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-850 flex justify-between items-center text-xs">
                  <span className="font-bold text-white">ကလေးဂိတ်ဆိုက်ရောက်ချိန် ရှင်းပေးရန် ကျန်ငွေ:</span>
                  <span
                    className={`font-mono text-base font-extrabold ${
                      settlementTrip.isDriverSettled ? 'text-slate-500 line-through' : 'text-emerald-400'
                    }`}
                  >
                    {formatMMK(Math.max(0, settlementTrip.totalTruckRentFee - settlementTrip.advancePaymentMdy))}
                  </span>
                </div>

                {settlementTrip.isDriverSettled ? (
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>ကလေးဂိတ်တွင် ယာဉ်မောင်းအား ငွေအကြေရှင်းတမ်း ပြီးစီးခဲ့ပါသည်။</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onUpdateTripSettlement(settlementTrip.id, settlementTrip.advancePaymentMdy, true);
                      setSettlementTrip({ ...settlementTrip, isDriverSettled: true });
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ကလေးဂိတ်တွင် ယာဉ်မောင်းအား ကျန်ငွေအကြေရှင်းပြီး (Mark Settled)</span>
                  </button>
                )}
              </div>

              {/* Log En-route Expense Form */}
              <form onSubmit={handleAddExpenseSubmit} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-300 block">
                  + လမ်းခရီး စရိတ်မှတ်တမ်း ဖြည့်သွင်းရန် (ဆီဖိုး / တိုးဂိတ် / စစ်ဆေးရေးဂိတ်)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value as any)}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="FUEL">ဒီဇယ်ဆီဖိုး (Fuel)</option>
                    <option value="TOLL_GATE">တိုးဂိတ် / တံတားကြေး</option>
                    <option value="CHECKPOINT">စစ်ဆေးရေးဂိတ် စရိတ်</option>
                    <option value="ALLOWANCE">ယာဉ်မောင်း နေ့တွက်စရိတ်</option>
                  </select>

                  <input
                    type="number"
                    required
                    placeholder="ကုန်ကျငွေ (MMK)"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />

                  <input
                    type="text"
                    placeholder="တည်နေရာ (ဥပမာ မုံရွာ၊ ဂန့်ဂေါ)"
                    value={expenseLocation}
                    onChange={(e) => setExpenseLocation(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs"
                  >
                    စာရင်းသွင်းမည်
                  </button>
                </div>
              </form>

              {/* Expenses List */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-semibold block">
                  ခရီးစဉ်အတွင်း ကုန်ကျစရိတ် မှတ်တမ်းများ:
                </span>
                {settlementTrip.expenses && settlementTrip.expenses.length > 0 ? (
                  settlementTrip.expenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-semibold text-white block">{exp.description}</span>
                        <span className="text-[10px] text-slate-500">
                          {exp.location} · {exp.date}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-200">
                        {formatMMK(exp.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 italic p-3 text-center">
                    လမ်းခရီး စရိတ်မှတ်တမ်း မရှိသေးပါ။
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Trip Kalay Arrival Auto-Notification (ကလေးဆိုက်ရောက် ကုန်စည်လက်ခံသူများထံ အသိပေးစာ ပေးပို့ခြင်း) */}
      {arrivalNotifyTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-purple-950 to-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <span>{lang === 'my' ? 'ကလေးဂိတ် ဆိုက်ရောက် ကုန်စည် အသိပေးစနစ်' : 'Kalay Arrival Notification'}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 font-mono">
                      {arrivalNotifyTrip.truckNumber}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    လက်ခံသူထံသို့ &quot;ပစ္စည်းကလေးဂိတ်သို့ ရောက်ရှိပါပြီ၊ လာရောက်ထုတ်ယူနိုင်ပါသည်&quot; ဟု Viber / SMS ပို့ပေးခြင်း
                  </p>
                </div>
              </div>
              <button
                onClick={() => setArrivalNotifyTrip(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Top Summary Banner */}
              <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">ဤ ၁၂ ဘီးကားပေါ်ပါ ကုန်စည်အရေအတွက်:</span>
                  <span className="text-base font-bold text-white font-mono">
                    {arrivalNotifyTrip.parcelIds.length} ဘောင်ချာ ({formatNumber(arrivalNotifyTrip.currentLoadedViss)} ပိဿာ)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">ကလေးဂိတ် ဆိုက်ရောက်နေ့စွဲ:</span>
                  <span className="text-amber-400 font-bold font-mono">
                    {new Date().toLocaleDateString('my-MM')} (ဒီနေ့)
                  </span>
                </div>
              </div>

              {/* Parcels Recipient List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">
                    ကလေးမြို့ လက်ခံသူဖောက်သည်များ စာရင်း ({arrivalNotifyTrip.parcelIds.length} ဦး):
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Viber သို့မဟုတ် SMS ခလုတ်ကို နှိပ်၍ တိုက်ရိုက် မက်ဆေ့ခ်ျ ပို့နိုင်ပါသည်
                  </span>
                </div>

                <div className="space-y-2.5">
                  {parcels
                    .filter((p) => arrivalNotifyTrip.parcelIds.includes(p.id))
                    .map((parcel, idx) => {
                      const arrivalText = generateArrivalNotificationText(parcel, 'VISS');
                      const smsText = generateSmsArrivalText(parcel);
                      const isNotified = !!parcel.notifiedArrivalAt;

                      return (
                        <div
                          key={parcel.id}
                          className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          {/* Parcel & Recipient Details */}
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-amber-400 text-xs">
                                #{idx + 1} {parcel.id}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  parcel.paymentStatus === 'PAID'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}
                              >
                                {parcel.paymentStatus === 'PAID'
                                  ? 'ရှင်းပြီး (PAID)'
                                  : `ကလေး COD (${formatMMK(parcel.totalDeliveryFee)})`}
                              </span>
                              {isNotified && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-semibold flex items-center gap-1">
                                  <Check className="w-3 h-3 text-purple-400" />
                                  <span>သတိပေးစာပို့ပြီး</span>
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs">
                              <span className="font-bold text-white">
                                📥 {parcel.receiverName}
                              </span>
                              <a
                                href={`tel:${cleanPhoneNumber(parcel.receiverPhone)}`}
                                className="font-mono text-slate-300 hover:text-amber-400 flex items-center gap-1"
                              >
                                <PhoneCall className="w-3 h-3 text-slate-500" />
                                <span>{parcel.receiverPhone}</span>
                              </a>
                              <span className="text-slate-400">
                                {parcel.itemType} ({parcel.packageCount} ထုပ် / {parcel.weightViss} ပိဿာ)
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              📍 {parcel.receiverAddress}
                            </div>
                          </div>

                          {/* Quick 1-Click Send Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Viber Button */}
                            <button
                              type="button"
                              onClick={() => {
                                openViberShare(arrivalText);
                                if (onMarkParcelNotified) {
                                  onMarkParcelNotified(parcel.id, 'ARRIVAL');
                                }
                              }}
                              className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                              title="Send Arrival Message via Viber"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Viber ပို့မည်</span>
                            </button>

                            {/* SMS Button */}
                            <button
                              type="button"
                              onClick={() => {
                                openSmsApp(parcel.receiverPhone, smsText);
                                if (onMarkParcelNotified) {
                                  onMarkParcelNotified(parcel.id, 'ARRIVAL');
                                }
                              }}
                              className="px-3 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                              title="Send SMS"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>SMS</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                ကလေးဂိတ် လာရောက်ထုတ်ယူရန် သတိပေးစာများ အောင်မြင်စွာ ပို့ဆောင်နိုင်ပါသည်
              </span>
              <button
                type="button"
                onClick={() => setArrivalNotifyTrip(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                {lang === 'my' ? 'ပြီးပါပြီ' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
