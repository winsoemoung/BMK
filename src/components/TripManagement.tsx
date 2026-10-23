import React, { useState } from 'react';
import { Trip, TripStatus, UserRole, BMK_PRICING } from '../types/bmk';
import { formatMMK, formatNumber } from '../utils/formatters';
import { Truck, Plus, Calendar, MapPin, CheckCircle, Navigation, Users, ShieldCheck } from 'lucide-react';

interface TripManagementProps {
  trips: Trip[];
  onAddTrip: (trip: Trip) => void;
  onUpdateTripStatus: (tripId: string, status: TripStatus) => void;
  userRole: UserRole;
  lang: 'my' | 'en';
}

export const TripManagement: React.FC<TripManagementProps> = ({
  trips,
  onAddTrip,
  onUpdateTripStatus,
  userRole,
  lang,
}) => {
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [truckNumber, setTruckNumber] = useState('7A-1088 (Nissan Diesel 12-Wheeler)');
  const [driverName, setDriverName] = useState('ကိုတင်အေး');
  const [driverPhone, setDriverPhone] = useState('09-790112233');
  const [maxCapacity, setMaxCapacity] = useState('8000');
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().slice(0, 10));

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const cap = parseFloat(maxCapacity) || 8000;
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
      notes: '၁၂ ဘီး ကုန်တင်ကားသစ် ဂိတ်တွင် စတင်တင်ဆောင်နေသည်',
    };

    onAddTrip(newTrip);
    setIsCreatingTrip(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">
              {lang === 'my' ? '၁၂ ဘီး ကုန်တင်ကားကြီးများ စီမံခန့်ခွဲမှု' : '12-Wheel Truck Logistics & Fleet'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'my'
              ? 'မန္တလေးမှ ကလေးသို့ ခရီးစဉ်အလိုက် ၁၂ ဘီးကား ငှါးရမ်းခ (တစ်ပိသာ ၁,၁၀၀ ကျပ်) နှင့် အလုပ်သမားခများ တွက်ချက်ခြင်း'
              : 'Trip dispatch, 1,100 MMK/viss truck rental ledger, and loading/unloading logistics.'}
          </p>
        </div>

        <button
          onClick={() => setIsCreatingTrip(!isCreatingTrip)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'my' ? '၁၂ ဘီးကား ခရီးစဉ်သစ်ဖွင့်မည်' : 'Charter New 12-Wheeler'}</span>
        </button>
      </div>

      {/* New Trip Form */}
      {isCreatingTrip && (
        <form
          onSubmit={handleCreateTrip}
          className="p-5 rounded-2xl border border-amber-500/30 bg-slate-950 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-amber-400 text-sm">
              {lang === 'my' ? '၁၂ ဘီး ကားအသစ် စာချုပ်သွင်းခြင်း' : 'Charter New 12-Wheel Truck Trip'}
            </h3>
            <button
              type="button"
              onClick={() => setIsCreatingTrip(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">
                {lang === 'my' ? '၁၂ ဘီး ကားနံပါတ် / အမျိုးအစား' : 'Truck ID / Model'}
              </label>
              <input
                type="text"
                required
                value={truckNumber}
                onChange={(e) => setTruckNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                placeholder="3B-4521 (Hino 12-Wheeler)"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                {lang === 'my' ? 'ယာဉ်မောင်းအမည်' : 'Driver Name'}
              </label>
              <input
                type="text"
                required
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                {lang === 'my' ? 'ယာဉ်မောင်းဖုန်းနံပါတ်' : 'Driver Phone'}
              </label>
              <input
                type="tel"
                required
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                {lang === 'my' ? 'အများဆုံး တင်နိုင်သော ပိသာ (Capacity)' : 'Max Viss Capacity'}
              </label>
              <input
                type="number"
                required
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs"
            >
              {lang === 'my' ? 'ခရီးစဉ် စာရင်းသွင်းမည်' : 'Save Trip'}
            </button>
          </div>
        </form>
      )}

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {trips.map((trip) => {
          const loadPct = Math.min(100, Math.round((trip.currentLoadedViss / trip.maxCapacityViss) * 100));

          return (
            <div
              key={trip.id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all space-y-4"
            >
              {/* Trip Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 text-sm">{trip.id}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold ${
                        trip.status === 'IN_TRANSIT'
                          ? 'bg-amber-500/20 text-amber-300'
                          : trip.status === 'ARRIVED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : trip.status === 'LOADING'
                          ? 'bg-sky-500/20 text-sky-300'
                          : 'bg-slate-800 text-slate-300'
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
                  <h3 className="text-base font-bold text-white mt-1">{trip.truckNumber}</h3>
                </div>

                <div className="text-right text-xs text-slate-400 space-y-0.5">
                  <div className="flex items-center gap-1 justify-end">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{trip.departureDate}</span>
                  </div>
                  <div className="text-slate-300 font-medium">{trip.driverName}</div>
                  <div className="font-mono text-slate-400">{trip.driverPhone}</div>
                </div>
              </div>

              {/* Route */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">{trip.route}</span>
              </div>

              {/* Capacity Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">
                    {lang === 'my' ? 'တင်ဆောင်ပြီး ပိသာ:' : 'Loaded Capacity:'}
                  </span>
                  <span className="font-mono font-bold text-white">
                    {formatNumber(trip.currentLoadedViss)} / {formatNumber(trip.maxCapacityViss)} ပိသာ ({loadPct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300"
                    style={{ width: `${loadPct}%` }}
                  />
                </div>
              </div>

              {/* Financial Costs Breakdown for this 12-Wheeler */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>၁၂ ဘီး ကားငှါးခ (1,100 MMK x {formatNumber(trip.currentLoadedViss)} ပိသာ):</span>
                  <span className="font-mono font-bold text-sky-400">
                    {formatMMK(trip.totalTruckRentFee)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>မန္တလေး တင်ခ အလုပ်သမား (25/ပိသာ):</span>
                  <span className="font-mono text-amber-300">{formatMMK(trip.totalMdyLabor)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ကလေး ချခ အလုပ်သမား (25/ပိသာ):</span>
                  <span className="font-mono text-amber-300">{formatMMK(trip.totalKalayLabor)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800 font-semibold text-slate-200">
                  <span>စုစုပေါင်း ကားနှင့် အလုပ်သမားကုန်ကျစရိတ်:</span>
                  <span className="font-mono text-white">
                    {formatMMK(trip.totalTruckRentFee + trip.totalMdyLabor + trip.totalKalayLabor)}
                  </span>
                </div>
              </div>

              {/* Trip Controls */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-xs text-slate-500">
                  {trip.parcelIds.length} parcels assigned
                </span>

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
                      onClick={() => onUpdateTripStatus(trip.id, 'ARRIVED')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs"
                    >
                      {lang === 'my' ? 'ကလေးဂိတ်သို့ ရောက်ရှိ' : 'Arrived at Kalay'}
                    </button>
                  )}
                  {trip.status === 'ARRIVED' && (
                    <button
                      onClick={() => onUpdateTripStatus(trip.id, 'COMPLETED')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                    >
                      {lang === 'my' ? 'ခရီးစဉ် ပြီးစီးကြောင်း အတည်ပြု' : 'Mark Completed'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
