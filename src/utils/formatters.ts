import QRCode from 'qrcode';
import { Parcel, Claim } from '../types/bmk';

export function formatMMK(amount: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(amount)) + ' MMK';
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat('en-US').format(val);
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

export function generateViberReceiptText(parcel: Parcel): string {
  return `📦 [BMK ကုန်စည်ပို့ဆောင်ရေး - မန္တလေး ⇄ ကလေး]
--------------------------------
ဘောင်ချာအမှတ်: ${parcel.id}
နေ့စွဲ: ${new Date(parcel.createdAt).toLocaleDateString('my-MM')}

📤 ပို့သူ (မန္တလေး): ${parcel.senderName} (${parcel.senderPhone})
📥 လက်ခံသူ (ကလေး): ${parcel.receiverName} (${parcel.receiverPhone})
လိပ်စာ: ${parcel.receiverAddress}

📦 ကုန်ပစ္စည်း: ${parcel.itemType}
အလေးချိန်: ${parcel.weightViss} ပိသာ
နှုန်းထား: 1,200 ကျပ် / ပိသာ
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
  return `BMK Gate: ${parcel.id} | To: ${parcel.receiverName} (${parcel.receiverPhone}) | ${parcel.weightViss} viss = ${formatMMK(parcel.totalDeliveryFee)} | Status: ${parcel.paymentStatus} | Tracking: ${parcel.status}`;
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
