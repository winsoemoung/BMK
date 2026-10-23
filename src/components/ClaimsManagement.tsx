import React, { useState } from 'react';
import { Claim, Parcel, UserRole, IncidentType, ClaimStatus } from '../types/bmk';
import { formatMMK, formatNumber } from '../utils/formatters';
import { AlertTriangle, ShieldCheck, CheckCircle2, XCircle, Plus, FileText, Camera } from 'lucide-react';

interface ClaimsManagementProps {
  claims: Claim[];
  parcels: Parcel[];
  onAddClaim: (claim: Claim) => void;
  onUpdateClaimStatus: (claimId: string, status: ClaimStatus, approvedAmount?: number) => void;
  userRole: UserRole;
  lang: 'my' | 'en';
  preselectedParcel?: Parcel | null;
}

export const ClaimsManagement: React.FC<ClaimsManagementProps> = ({
  claims,
  parcels,
  onAddClaim,
  onUpdateClaimStatus,
  userRole,
  lang,
  preselectedParcel,
}) => {
  const [isFilingClaim, setIsFilingClaim] = useState(!!preselectedParcel);
  const [selectedParcelId, setSelectedParcelId] = useState(preselectedParcel?.id || parcels[0]?.id || '');
  const [incidentType, setIncidentType] = useState<IncidentType>('LOST');
  const [description, setDescription] = useState('');
  const [claimedAmount, setClaimedAmount] = useState('50000');
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const isAdmin = userRole === 'ADMIN';

  const totalCompensationPaid = claims
    .filter((c) => c.status === 'APPROVED_PAID')
    .reduce((sum, c) => sum + c.approvedCompensation, 0);

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const targetParcel = parcels.find((p) => p.id === selectedParcelId);
    if (!targetParcel) return;

    const claimId = `CLM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    const newClaim: Claim = {
      id: claimId,
      parcelId: targetParcel.id,
      parcelCode: targetParcel.id,
      customerName: `${targetParcel.senderName} / ${targetParcel.receiverName}`,
      customerPhone: targetParcel.senderPhone || targetParcel.receiverPhone,
      incidentType,
      description: description || 'လမ်းခရီးတွင် ပစ္စည်း ပျောက်ဆုံး/ပျက်စီးမှု ဖြစ်ပေါ်ခဲ့သည်',
      claimedAmount: parseFloat(claimedAmount) || 0,
      approvedCompensation: isAdmin ? parseFloat(claimedAmount) || 0 : 0,
      status: isAdmin ? 'APPROVED_PAID' : 'PENDING',
      reportedDate: new Date().toISOString(),
      reportedBy: userRole === 'KALAY_STAFF' ? 'ကလေးဂိတ် ဝန်ထမ်း' : 'မန္တလေးဂိတ် ဝန်ထမ်း',
      photoUrl: photoPreview,
    };

    onAddClaim(newClaim);
    setIsFilingClaim(false);
    setDescription('');
  };

  const handleSimulatePhoto = () => {
    // Simulated road incident photo
    setPhotoPreview('/src/assets/images/bmk_truck_highway_1792773077830.jpg');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-bold text-white">
              {lang === 'my' ? 'လမ်းခရီး ပျောက်ဆုံး/ပျက်စီးမှု လျော်ကြေးစနစ်' : 'Claims & Road Loss Management'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'my'
              ? 'မန္တလေး-ကလေး တောင်တက်လမ်းကြမ်းတွင် ကုန်ပစ္စည်း ပျောက်ဆုံး/ပျက်စီးပါက လျော်ကြေးငွေကို ဂိတ်အသားတင်အမြတ်ငွေ (Net Profit) မှ ချက်ချင်းနုတ်ယူ ရှင်းတမ်းထုတ်ပေးခြင်း'
              : 'Deducts approved compensation claims directly from BMK Gate Net Profit to maintain transparent books.'}
          </p>
        </div>

        <button
          onClick={() => setIsFilingClaim(!isFilingClaim)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-md transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'my' ? 'လျော်ကြေးအသစ် တင်ပြမည်' : 'File Damage/Loss Report'}</span>
        </button>
      </div>

      {/* Compensation Impact Banner */}
      <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block">
            {lang === 'my' ? 'ဂိတ်အမြတ်မှ စုစုပေါင်း နုတ်ယူပေးလျော်ပြီးငွေ (Total Compensation Deducted)' : 'Total Deducted Compensation'}
          </span>
          <div className="text-2xl font-extrabold font-mono text-rose-300">
            -{formatMMK(totalCompensationPaid)}
          </div>
          <p className="text-xs text-slate-300">
            {lang === 'my'
              ? 'အထက်ပါငွေပမာဏသည် ဂိတ်၏ စုစုပေါင်းအသားတင်အမြတ်ငွေ (Net Profit) မှ တိုက်ရိုက် လျှော့ချထားပြီးဖြစ်ပါသည်။'
              : 'This total is directly subtracted from gate gross base profit in real time.'}
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <span className="text-slate-400 block text-[11px]">{lang === 'my' ? 'အမှုတွဲအရေအတွက်:' : 'Filed Cases:'}</span>
          <span className="font-bold text-white font-mono text-sm">{claims.length} Cases</span>
        </div>
      </div>

      {/* File Incident Form */}
      {isFilingClaim && (
        <form
          onSubmit={handleSubmitClaim}
          className="p-5 rounded-2xl border border-rose-500/40 bg-slate-950 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-rose-400 text-sm">
              {lang === 'my' ? 'ကုန်စည် ပျောက်ဆုံး/ပျက်စီးမှု အစီရင်ခံစာ တင်သွင်းရန်' : 'Submit Damage or Lost Cargo Claim'}
            </h3>
            <button
              type="button"
              onClick={() => setIsFilingClaim(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">
                {lang === 'my' ? 'သက်ဆိုင်ရာ ဘောင်ချာ ရွေးပါ' : 'Select Parcel'}
              </label>
              <select
                value={selectedParcelId}
                onChange={(e) => setSelectedParcelId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              >
                {parcels.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} - {p.receiverName} ({p.itemType}, {p.weightViss} ပိသာ)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                {lang === 'my' ? 'ဖြစ်စဉ်အမျိုးအစား' : 'Incident Type'}
              </label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              >
                <option value="LOST">လမ်းခရီး ပျောက်ဆုံးမှု (Lost on Road)</option>
                <option value="DAMAGED">မိုးရေစို / ကွဲအက် ပျက်စီးမှု (Damaged)</option>
                <option value="SHORTAGE">ပစ္စည်း အရေအတွက် လျော့နည်းမှု (Shortage)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                {lang === 'my' ? 'တောင်းခံသည့် လျော်ကြေးငွေ (MMK)' : 'Claim Amount (MMK)'}
              </label>
              <input
                type="number"
                required
                value={claimedAmount}
                onChange={(e) => setClaimedAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 text-xs">
              {lang === 'my' ? 'ဖြစ်စဉ် အကြောင်းအရာ အသေးစိတ်' : 'Incident Description & Road Section'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ဥပမာ- မုံရွာနှင့်ဂန့်ဂေါကြား တောင်တက်လမ်းတွင် မိုးသည်းထန်စွာရွာသဖြင့် တာပေါ်လင်ပေါက်ပြီး ရေစိုပျက်စီးခဲ့သည်"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
            />
          </div>

          {/* Photo evidence upload simulation */}
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={handleSimulatePhoto}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'my' ? 'သက်သေဓာတ်ပုံ ပူးတွဲတင်ရန်' : 'Attach Photo Evidence'}</span>
            </button>
            {photoPreview && (
              <span className="text-emerald-400 text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Photo Attached
              </span>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsFilingClaim(false)}
              className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs"
            >
              {isAdmin ? 'လျော်ကြေးအတည်ပြုပြီး အမြတ်မှနုတ်မည်' : 'လျော်ကြေးတင်ပြမည် (Submit)'}
            </button>
          </div>
        </form>
      )}

      {/* Claims List */}
      <div className="space-y-3">
        {claims.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-slate-800 bg-slate-900/50 space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-slate-300 font-medium">
              {lang === 'my' ? 'ပျောက်ဆုံး/ပျက်စီးမှု မှတ်တမ်း မရှိပါ' : 'No Damage or Loss Claims Recorded'}
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'my' ? 'ကုန်စည်များ အားလုံး အဆင်ပြေချောမွေ့စွာ ရောက်ရှိနေပါသည်။' : 'All shipments are in good condition.'}
            </p>
          </div>
        ) : (
          claims.map((claim) => (
            <div
              key={claim.id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-rose-400 text-sm">{claim.id}</span>
                  <span className="text-slate-500 text-xs">·</span>
                  <span className="font-mono text-slate-300 text-xs">ဘောင်ချာ: {claim.parcelCode}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded font-bold ${
                      claim.status === 'APPROVED_PAID'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : claim.status === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {claim.status === 'APPROVED_PAID'
                      ? 'လျော်ကြေးထုတ်ပေးပြီး (ဂိတ်အမြတ်မှ နုတ်ပြီး)'
                      : claim.status === 'PENDING'
                      ? 'စိစစ်ဆဲ (Pending)'
                      : 'ငြင်းပယ်သည်'}
                  </span>
                </div>
              </div>

              {/* Customer & Incident Description */}
              <div className="text-xs space-y-1.5">
                <div className="text-slate-300">
                  <span className="text-slate-500">{lang === 'my' ? 'ကာစတန်မာ:' : 'Customer:'}</span>{' '}
                  <strong className="text-white">{claim.customerName}</strong> ({claim.customerPhone})
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 text-slate-300 leading-relaxed">
                  <span className="text-rose-400 font-semibold mr-1">
                    [{claim.incidentType === 'LOST' ? 'ပျောက်ဆုံးမှု' : 'ပျက်စီးမှု'}]:
                  </span>
                  {claim.description}
                </div>
              </div>

              {/* Financial Deductions */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block">{lang === 'my' ? 'တောင်းခံသည့် လျော်ကြေး:' : 'Claimed:'}</span>
                  <span className="font-mono font-semibold text-slate-200">{formatMMK(claim.claimedAmount)}</span>
                </div>

                <div>
                  <span className="text-slate-400 block">
                    {lang === 'my' ? 'အတည်ပြုပေးလျော်ငွေ (ဂိတ်အမြတ်မှနုတ်):' : 'Approved Deduction:'}
                  </span>
                  <span className="font-mono font-bold text-rose-400 text-sm">
                    {claim.status === 'APPROVED_PAID' ? `-${formatMMK(claim.approvedCompensation)}` : 'စိစစ်ဆဲ'}
                  </span>
                </div>

                {/* Admin Actions */}
                {claim.status === 'PENDING' && isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateClaimStatus(claim.id, 'APPROVED_PAID', claim.claimedAmount)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs"
                    >
                      အတည်ပြုပြီး အမြတ်မှနုတ်မည်
                    </button>
                    <button
                      onClick={() => onUpdateClaimStatus(claim.id, 'REJECTED', 0)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    >
                      ငြင်းပယ်မည်
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
