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

export function cleanPhoneNumber(phone: string): string {
  // Remove spaces, hyphens, parentheses
  return phone.replace(/[^0-9+]/g, '');
}

export function generateViberReceiptText(parcel: Parcel, unit: WeightUnit = 'VISS'): string {
  return generateIntakeNotificationText(parcel, unit);
}

export function generateIntakeNotificationText(parcel: Parcel, unit: WeightUnit = 'VISS'): string {
  const kgVal = vissToKg(parcel.weightViss);
  const rateKg = rateVissToKg(parcel.customerRatePerViss);

  return `📦 [BMK ကုန်စည်ပို့ဆောင်ရေး - မန္တလေး ⇄ ကလေး]
အမြန်ချောပို့ ဘောင်ချာဖွင့်လှစ်ပြီးကြောင်း အကြောင်းကြားစာ
----------------------------------------
ဘောင်ချာအမှတ်: ${parcel.id}
နေ့စွဲ: ${new Date(parcel.createdAt).toLocaleDateString('my-MM')}

📤 ပို့သူ (မန္တလေး): ${parcel.senderName} (${parcel.senderPhone})
📥 လက်ခံသူ (ကလေး): ${parcel.receiverName} (${parcel.receiverPhone})
လိပ်စာ: ${parcel.receiverAddress}

📦 ကုန်ပစ္စည်း: ${parcel.itemType}${parcel.isBulkyGoods ? ' (ကုန်ပွစျေး)' : ''}
အရေအတွက်: ${parcel.packageCount} ထုပ်/ဖာ
အလေးချိန်: ${formatNumber(parcel.weightViss, 1)} ပိဿာ (~ ${formatNumber(kgVal, 1)} Kg)
နှုန်းထား: ${formatNumber(parcel.customerRatePerViss)} ကျပ်/ပိဿာ (~ ${formatNumber(rateKg, 1)} ကျပ်/Kg)
----------------------------------------
💰 စုစုပေါင်း ပို့ဆောင်ခ: ${formatMMK(parcel.totalDeliveryFee)}
ငွေပေးချေမှု: ${
    parcel.paymentStatus === 'PAID'
      ? '✅ မန္တလေးဂိတ်တွင် ရှင်းပြီး (PAID)'
      : parcel.paymentStatus === 'COD'
      ? '⚠️ ကလေးရောက်မှ ငွေချေမည် (COD)'
      : '❌ မရှင်းရသေး (UNPAID)'
  }
လက်ရှိအခြေအနေ: ${getStatusBurmese(parcel.status)}

၁၂ ဘီး ကုန်တင်ကားကြီးဖြင့် ကလေးမြို့သို့ အမြန်ဆုံး စနစ်တကျ ပို့ဆောင်ပေးပါမည်။
🏢 မန္တလေးဂိတ်: ၈၄ လမ်း (ဖုန်း: 09-450012345 / 09-790112233)
🏢 ကလေးဂိတ်: တာဟန်းရပ်ကွက် (ဖုန်း: 09-256123456)
BMK Express အား ရွေးချယ်အားပေးမှုအတွက် အထူးကျေးဇူးတင်ရှိပါသည်။`;
}

export function generateArrivalNotificationText(parcel: Parcel, unit: WeightUnit = 'VISS'): string {
  const kgVal = vissToKg(parcel.weightViss);

  return `📢 [BMK ကုန်စည်ပို့ဆောင်ရေး - ကလေးဂိတ် ဆိုက်ရောက်သတိပေးချက်]
----------------------------------------
မင်္ဂလာပါရှင်၊ BMK Express (မန္တလေး ⇄ ကလေး) မှ လေးစားစွာ အကြောင်းကြားအပ်ပါသည်။

လူကြီးမင်းထံသို့ ပေးပို့ထားသော ပါဆယ် (ဘောင်ချာအမှတ်: ${parcel.id}) သည် ကလေးဂိတ်သို့ ရောက်ရှိပါပြီ၊ လာရောက်ထုတ်ယူနိုင်ပါသည်။

📦 ကုန်စည်အမျိုးအစား: ${parcel.itemType} (${parcel.packageCount} ထုပ်)
⚖️ အလေးချိန်: ${formatNumber(parcel.weightViss, 1)} ပိဿာ (~ ${formatNumber(kgVal, 1)} Kg)
📤 ပို့သူအမည်: ${parcel.senderName} (${parcel.senderPhone})
📥 လက်ခံသူ: ${parcel.receiverName} (${parcel.receiverPhone})

💰 ငွေပေးချေမှုအခြေအနေ: ${
    parcel.paymentStatus === 'PAID'
      ? '✅ ပို့ခရှင်းပြီးဖြစ်ပါသဖြင့် ဘောင်ချာပြ၍ ချက်ချင်း ထုတ်ယူနိုင်ပါသည်'
      : parcel.paymentStatus === 'COD'
      ? `⚠️ ကလေးရောက်ငွေချေ (COD) ဖြစ်ပါ၍ ပို့ခ ${formatMMK(parcel.totalDeliveryFee)} ပေးချေရန် ကျန်ရှိပါသည်`
      : `❌ မရှင်းရသေးပါ (ကျသင့်ငွေ: ${formatMMK(parcel.totalDeliveryFee)})`
  }

🏢 ကလေးဂိတ်လိပ်စာ: ကလေးမြို့၊ တာဟန်းရပ်ကွက်၊ ဗိုလ်ချုပ်လမ်း (BMK Express Gate)
📞 ဆက်သွယ်ရန်ဖုန်း: 09-256123456 / 09-790112233
⏰ ဂိတ်ဖွင့်ချိန်: နေ့စဉ် မနက် ၇:၀၀ မှ ညနေ ၆:၀၀ ထိ

ကျေးဇူးတင်ပါသည် - BMK Delivery Car Gate`;
}

export function generateSmsReceiptText(parcel: Parcel): string {
  const kgVal = vissToKg(parcel.weightViss);
  return `BMK Express (MDY->KLY): Voucher ${parcel.id} | To: ${parcel.receiverName} (${parcel.receiverPhone}) | ${formatNumber(parcel.weightViss, 1)} Viss (~${formatNumber(kgVal, 1)}Kg) | Fee: ${formatMMK(parcel.totalDeliveryFee)} (${parcel.paymentStatus}) | Status: ${getStatusBurmese(parcel.status)} | Ph: 09-450012345`;
}

export function generateSmsArrivalText(parcel: Parcel): string {
  const payNotice = parcel.paymentStatus === 'COD' 
    ? `COD: ${formatMMK(parcel.totalDeliveryFee)}` 
    : 'PAID';
  return `BMK ကလေးဂိတ်: လူကြီးမင်း၏ ပါဆယ် (${parcel.id}) ကလေးဂိတ်သို့ ရောက်ရှိပါပြီ၊ လာရောက်ထုတ်ယူနိုင်ပါသည်။ ${parcel.itemType} (${formatNumber(parcel.weightViss, 1)}ပိသာ) | ${payNotice} | ကလေးဂိတ်ဖုန်း 09-256123456`;
}

export function openViberShare(message: string): void {
  // Try viber protocol first
  const encoded = encodeURIComponent(message);
  const viberUrl = `viber://forward?text=${encoded}`;
  
  // Use a temporary anchor to prevent navigation blocking
  const link = document.createElement('a');
  link.href = viberUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function openSmsApp(phone: string, message: string): void {
  const cleanPhone = cleanPhoneNumber(phone);
  const encoded = encodeURIComponent(message);
  // Works on Android & iOS: Android accepts ?body=, iOS accepts &body= or ?body=
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const delimiter = isIOS ? '&' : '?';
  const smsUrl = `sms:${cleanPhone}${delimiter}body=${encoded}`;
  
  const link = document.createElement('a');
  link.href = smsUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function shareNativeOrFallback(title: string, text: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text });
      return true;
    } catch {
      // User cancelled share
      return false;
    }
  }
  // Fallback: clipboard copy
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
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
