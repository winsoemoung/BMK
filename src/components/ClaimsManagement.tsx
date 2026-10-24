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
    setPhotoPreview('/src/assets/images/bmk_truck_highway_1792773077830.jpg');
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl border border-[#e4e6eb] bg-white shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#050505]">
              {lang === 'my' ? 'လမ်းခရီး ပျောက်ဆုံး/ပျက်စီးမှု လျော်ကြေးစနစ်' : 'Claims & Road Loss Management'}
            </h2>
          </div>
          <p className="text-xs text-[#65676b] mt-1">
            {lang === 'my'
              ? 'မန္တလေး-ကလေး တောင်တက်လမ်းကြမ်းတွင် ကုန်ပစ္စည်း ပျောက်ဆုံး/ပျက်စီးပါက လျော်ကြေးငွေကို ဂိတ်အသားတင်အမြတ်ငွေ (Net Profit) မှ ချက်ချင်းနုတ်ယူ ရှင်းတမ်းထုတ်ပေးခြင်း'
              : 'Deducts approved compensation claims directly from BMK Gate Net Profit to maintain transparent books.'}
          </p>
        </div>

        <button
          onClick={() => setIsFilingClaim(!isFilingClaim)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition-all whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'my' ? 'လျော်ကြေးအသစ် တင်ပြမည်' : 'File Damage/Loss Report'}</span>
        </button>
      </div>

      {/* Compensation Impact Banner */}
      <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-rose-800 uppercase tracking-wide block">
            {lang === 'my' ? 'ဂိတ်အမြတ်မှ စုစုပေါင်း နုတ်ယူပေးလျော်ပြီးငွေ (Total Compensation Deducted)' : 'Total Deducted Compensation'}
          </span>
          <div className="text-2xl font-black font-mono text-rose-700">
            -{formatMMK(totalCompensationPaid)}
          </div>
          <p className="text-xs text-rose-900/80">
            {lang === 'my'
              ? 'အထက်ပါငွေပမာဏသည် ဂိတ်၏ စုစုပေါင်းအသားတင်အမြတ်ငွေ (Net Profit) မှ တိုက်ရိုက် လျှော့ချထားပြီးဖြစ်ပါသည်။'
              : 'This total is directly subtracted from gate gross base profit in real time.'}
          </p>
        </div>

        <div className="px-4 py-2 rounded-lg bg-white border border-rose-200 text-xs shadow-sm">
          <span className="text-[#65676b] block text-[11px]">{lang === 'my' ? 'အမှုတွဲအရေအတွက်:' : 'Filed Cases:'}</span>
          <span className="font-bold text-[#050505] font-mono text-sm">{claims.length} Cases</span>
        </div>
      </div>

      {/* File Incident Form */}
      {isFilingClaim && (
        <form
          onSubmit={handleSubmitClaim}
          className="p-5 rounded-xl border border-[#e4e6eb] bg-white shadow-md space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-rose-600 text-sm">
              {lang === 'my' ? 'ကုန်စည် ပျောက်ဆုံး/ပျက်စီးမှု အစီရင်ခံစာ တင်သွင်းရန်' : 'Submit Damage or Lost Cargo Claim'}
            </h3>
            <button
              type="button"
              onClick={() => setIsFilingClaim(false)}
              className="text-xs text-[#65676b] hover:text-[#050505] cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-[#65676b] block mb-1 font-semibold">
                {lang === 'my' ? 'သက်ဆိုင်ရာ ဘောင်ချာ ရွေးပါ' : 'Select Parcel'}
              </label>
              <select
                value={selectedParcelId}
                onChange={(e) => setSelectedParcelId(e.target.value)}
                className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg text-[#050505] focus:bg-white focus:ring-2 focus:ring-[#1877F2]"
              >
                {parcels.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} - {p.receiverName} ({p.itemType}, {p.weightViss} ပိသာ)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[#65676b] block mb-1 font-semibold">
                {lang === 'my' ? 'ဖြစ်စဉ်အမျိုးအစား' : 'Incident Type'}
              </label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg text-[#050505] focus:bg-white focus:ring-2 focus:ring-[#1877F2]"
              >
                <option value="LOST">လမ်းခရီး ပျောက်ဆုံးမှု (Lost on Road)</option>
                <option value="DAMAGED">မိုးရေစို / ကွဲအက် ပျက်စီးမှု (Damaged)</option>
                <option value="SHORTAGE">ပစ္စည်း အရေအတွက် လျော့နည်းမှု (Shortage)</option>
              </select>
            </div>

            <div>
              <label className="text-[#65676b] block mb-1 font-semibold">
                {lang === 'my' ? 'တောင်းခံသည့် လျော်ကြေးငွေ (MMK)' : 'Claim Amount (MMK)'}
              </label>
              <input
                type="number"
                required
                value={claimedAmount}
                onChange={(e) => setClaimedAmount(e.target.value)}
                className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg text-[#050505] font-mono font-bold focus:bg-white focus:ring-2 focus:ring-[#1877F2]"
              />
            </div>
          </div>

          <div>
            <label className="text-[#65676b] block mb-1 text-xs font-semibold">
              {lang === 'my' ? 'ဖြစ်စဉ် အကြောင်းအရာ အသေးစိတ်' : 'Incident Description & Road Section'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ဥပမာ- မုံရွာနှင့်ဂန့်ဂေါကြား တောင်တက်လမ်းတွင် မိုးသည်းထန်စွာရွာသဖြင့် တာပေါ်လင်ပေါက်ပြီး ရေစိုပျက်စီးခဲ့သည်"
              className="w-full px-3 py-2 bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg text-[#050505] text-xs focus:bg-white focus:ring-2 focus:ring-[#1877F2]"
            />
          </div>

          {/* Photo evidence upload simulation */}
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={handleSimulatePhoto}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#f0f2f5] border border-[#e4e6eb] text-[#050505] hover:bg-[#e4e6eb] font-semibold cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#1877F2]" />
              <span>{lang === 'my' ? 'သက်သေဓာတ်ပုံ ပူးတွဲတင်ရန်' : 'Attach Photo Evidence'}</span>
            </button>
            {photoPreview && (
              <span className="text-[#31a24c] text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Photo Attached
              </span>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#e4e6eb]">
            <button
              type="button"
              onClick={() => setIsFilingClaim(false)}
              className="px-4 py-2 rounded-lg bg-[#e4e6eb] hover:bg-[#d8dadf] text-[#050505] text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              {isAdmin ? 'လျော်ကြေးအတည်ပြုပြီး အမြတ်မှနုတ်မည်' : 'လျော်ကြေးတင်ပြမည် (Submit)'}
            </button>
          </div>
        </form>
      )}

      {/* Claims List */}
      <div className="space-y-3">
        {claims.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-[#e4e6eb] bg-white space-y-2 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-[#31a24c] mx-auto" />
            <div className="text-[#050505] font-bold">
              {lang === 'my' ? 'ပျောက်ဆုံး/ပျက်စီးမှု မှတ်တမ်း မရှိပါ' : 'No Damage or Loss Claims Recorded'}
            </div>
            <p className="text-xs text-[#65676b]">
              {lang === 'my' ? 'ကုန်စည်များ အားလုံး အဆင်ပြေချောမွေ့စွာ ရောက်ရှိနေပါသည်။' : 'All shipments are in good condition.'}
            </p>
          </div>
        ) : (
          claims.map((claim) => (
            <div
              key={claim.id}
              className="p-5 rounded-xl border border-[#e4e6eb] bg-white hover:border-[#ccd0d5] space-y-3 shadow-sm transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e4e6eb] pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-rose-600 text-sm">{claim.id}</span>
                  <span className="text-[#65676b] text-xs">·</span>
                  <span className="font-mono text-[#65676b] text-xs font-semibold">ဘောင်ချာ: {claim.parcelCode}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      claim.status === 'APPROVED_PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : claim.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
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
                <div className="text-[#65676b]">
                  <span className="text-[#65676b]">{lang === 'my' ? 'ကာစတန်မာ:' : 'Customer:'}</span>{' '}
                  <strong className="text-[#050505]">{claim.customerName}</strong> ({claim.customerPhone})
                </div>
                <div className="p-3 rounded-lg bg-[#f0f2f5] border border-[#e4e6eb] text-[#050505] leading-relaxed">
                  <span className="text-rose-600 font-bold mr-1">
                    [{claim.incidentType === 'LOST' ? 'ပျောက်ဆုံးမှု' : 'ပျက်စီးမှု'}]:
                  </span>
                  {claim.description}
                </div>
              </div>

              {/* Financial Deductions */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[#f0f2f5] border border-[#e4e6eb] text-xs">
                <div>
                  <span className="text-[#65676b] block">{lang === 'my' ? 'တောင်းခံသည့် လျော်ကြေး:' : 'Claimed:'}</span>
                  <span className="font-mono font-bold text-[#050505]">{formatMMK(claim.claimedAmount)}</span>
                </div>

                <div>
                  <span className="text-[#65676b] block">
                    {lang === 'my' ? 'အတည်ပြုပေးလျော်ငွေ (ဂိတ်အမြတ်မှနုတ်):' : 'Approved Deduction:'}
                  </span>
                  <span className="font-mono font-bold text-rose-600 text-sm">
                    {claim.status === 'APPROVED_PAID' ? `-${formatMMK(claim.approvedCompensation)}` : 'စိစစ်ဆဲ'}
                  </span>
                </div>

                {/* Admin Actions */}
                {claim.status === 'PENDING' && isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateClaimStatus(claim.id, 'APPROVED_PAID', claim.claimedAmount)}
                      className="px-3 py-1.5 rounded-lg bg-[#31a24c] hover:bg-[#2b9043] text-white font-bold text-xs shadow-sm cursor-pointer"
                    >
                      အတည်ပြုပြီး အမြတ်မှနုတ်မည်
                    </button>
                    <button
                      onClick={() => onUpdateClaimStatus(claim.id, 'REJECTED', 0)}
                      className="px-3 py-1.5 rounded-lg bg-[#e4e6eb] hover:bg-[#d8dadf] text-[#050505] text-xs font-semibold cursor-pointer"
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
