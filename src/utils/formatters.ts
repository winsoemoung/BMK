import QRCode from 'qrcode';
import { Parcel, Claim, WeightUnit, VISS_TO_KG_RATIO, KG_TO_VISS_RATIO } from '../types/bmk';

export function formatMMK(amount: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(amount)) + ' MMK';
}

export function formatNumber(val: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
}

export function vissToKg(viss: number): number {
  return viss * VISS_TO_KG_RATIO;
}

export function kgToViss(kg: number): number {
  return kg * KG_TO_VISS_RATIO;
}

export function rateVissToKg(ratePerViss: number): number {
  // If 1 viss = 1,000 MMK, then 1 kg = 1000 / 1.63293 = 612.40 MMK
  return ratePerViss / VISS_TO_KG_RATIO;
}

export function formatWeight(
  weightInViss: number,
  unit: WeightUnit,
  lang: 'my' | 'en'
): string {
  if (unit === 'KG') {
    const kgVal = vissToKg(weightInViss);
    return `${formatNumber(kgVal, 1)} ${lang === 'my' ? 'ကီလို (Kg)' : 'Kg'}`;
  }
  return `${formatNumber(weightInViss, 1)} ${lang === 'my' ? 'ပိဿာ' : 'Viss'}`;
}

export function formatRate(
  ratePerViss: number,
  unit: WeightUnit,
  lang: 'my' | 'en'
): string {
  if (unit === 'KG') {
    const ratePerKg = rateVissToKg(ratePerViss);
    return `${formatNumber(ratePerKg, 1)} MMK/${lang === 'my' ? 'ကီလို' : 'kg'}`;
  }
  return `${formatNumber(ratePerViss)} MMK/${lang === 'my' ? 'ပိဿာ' : 'viss'}`;
}

export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 240,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}

export function generateViberReceiptText(parcel: Parcel, unit: WeightUnit = 'VISS'): string {
  const kgVal = vissToKg(parcel.weightViss);
  const rateKg = rateVissToKg(parcel.customerRatePerViss);

  return `📦 [BMK ကုန်စည်ပို့ဆောင်ရေး - မန္တလေး ⇄ ကလေး]
--------------------------------
ဘောင်ချာအမှတ်: ${parcel.id}
နေ့စွဲ: ${new Date(parcel.createdAt).toLocaleDateString('my-MM')}

📤 ပို့သူ (မန္တလေး): ${parcel.senderName} (${parcel.senderPhone})
📥 လက်ခံသူ (ကလေး): ${parcel.receiverName} (${parcel.receiverPhone})
လိပ်စာ: ${parcel.receiverAddress}

📦 ကုန်ပစ္စည်း: ${parcel.itemType}${parcel.isBulkyGoods ? ' (ကုန်ပွ)' : ''}
အလေးချိန်: ${formatNumber(parcel.weightViss, 1)} ပိဿာ (~ ${formatNumber(kgVal, 1)} Kg)
နှုန်းထား: ${formatNumber(parcel.customerRatePerViss)} ကျပ်/ပိဿာ (~ ${formatNumber(rateKg, 1)} ကျပ်/Kg)
--------------------------------
💰 စုစုပေါင်းကုန်ကျငွေ: ${formatMMK(parcel.totalDeliveryFee)}
ငွေပေးချေမှုအခြေအနေ: ${
    parcel.paymentStatus === 'PAID'
      ? '✅ ငွေရှင်းပြီး (Paid)'
      : parcel.paymentStatus === 'COD'
      ? '⚠️ ကလေးရောက်မှငွေချေ (COD)'
      : '❌ မရှင်းရသေး (Unpaid)'
  }
လက်ရှိအခြေအနေ: ${getStatusBurmese(parcel.status)}
--------------------------------
ကျေးဇူးတင်ပါသည် - BMK Delivery Car Gate`;
}

export function generateSmsReceiptText(parcel: Parcel): string {
  const kgVal = vissToKg(parcel.weightViss);
  return `BMK Gate: ${parcel.id} | To: ${parcel.receiverName} (${parcel.receiverPhone}) | ${formatNumber(parcel.weightViss, 1)} viss (${formatNumber(kgVal, 1)} kg) = ${formatMMK(parcel.totalDeliveryFee)} | Status: ${parcel.paymentStatus} | ${parcel.status}`;
}

export function getStatusBurmese(status: string): string {
  switch (status) {
    case 'BOOKED':
      return 'ဂိတ်တွင် လက်ခံရရှိ (Booked)';
    case 'LOADED':
      return '၁၂ ဘီးကားပေါ်တင်ပြီး (Loaded)';
    case 'IN_TRANSIT':
      return 'လမ်းခရီးတွင် (In Transit)';
    case 'ARRIVED_KALAY':
      return 'ကလေးဂိတ်ရောက် (Arrived Kalay)';
    case 'DELIVERED':
      return 'လူကြီးမင်းထံ အပ်နှံပြီး (Delivered)';
    case 'CLAIMED_LOST':
      return 'လျော်ကြေးပေးအပ်ပြီး (Claimed/Lost)';
    default:
      return status;
  }
}
