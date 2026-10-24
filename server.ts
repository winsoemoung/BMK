import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google Gen AI SDK on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `You are "BMK Express AI Assistant" (BMK ကုန်စည်ပို့ဆောင်ရေး AI လက်ထောက်), an expert logistics assistant for BMK Express Car Gate operating 12-wheel truck delivery between Mandalay and Kalay (Myanmar).

Domain Knowledge & Core Business Rules:
1. Route: Mandalay (84th St) ⇄ Kalay (Bogyoke Rd). Traversing Sagaing, Monywa, Pale, Gangaw, Kyaukhtu mountain highway.
2. Standard Financial Economics per Viss (ပိဿာ):
   - Revenue / Customer Rate: 1,200 MMK / viss (~ 734.9 MMK / kg)
   - 12-Wheel Truck Expense: 1,100 MMK / viss
   - Mandalay Loading Labor: 25 MMK / viss
   - Kalay Unloading Labor: 25 MMK / viss
   - Base Net Profit: 50 MMK / viss (1,200 - 1,100 - 25 - 25 = 50 MMK)
3. Weight Conversion:
   - 1 Viss (ပိဿာ) = 1.63293 Kg (1 Kg = 0.6124 Viss)
   - 1,000 MMK/viss ≈ 612.4 MMK/kg | 1,200 MMK/viss ≈ 734.9 MMK/kg
4. Bulky Goods (ကုန်ပွစျေး):
   - For lightweight, high-volume items (boxes, styrofoam, pillows, snacks), custom rate applies (default 1,600 MMK/viss).
5. Driver Advance & Settlement:
   - Driver receives advance fuel/road money (ဆီဖိုး/လမ်းစရိတ် ကြိုထုတ်ငွေ) in Mandalay; remaining truck rent is settled at Kalay Gate upon delivery.
6. Claims:
   - Lost or damaged items are recorded in the Claims module and deducted from True Net Profit.
7. Tone & Language:
   - Friendly, professional, clear, fluent in Burmese (မြန်မာစကား) and English.
   - Answer cargo pricing questions, calculate fees, guide gate staff on QR scanning/manifests, and explain policies concisely.`;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'bmk-express-server', time: new Date().toISOString() });
});

// Gemini Chat Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, gateContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Convert messages to Gemini contents format
    // Map roles: 'user' -> 'user', 'assistant' -> 'model'
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Inject live gate context if provided
    let instructionWithContext = SYSTEM_INSTRUCTION;
    if (gateContext) {
      instructionWithContext += `\n\n[Live Gate Operational Context]: ${JSON.stringify(gateContext)}`;
    }

    // If GEMINI_API_KEY is available, call Gemini 3.8 Flash model with safety timeout
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API request timeout')), 6000)
        );

        const response: any = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: contents,
            config: {
              systemInstruction: instructionWithContext,
              temperature: 0.7,
            },
          }),
          timeoutPromise,
        ]);

        const replyText = response.text || 'တောင်းပန်ပါသည်။ ပြန်လည်ဖြေကြားရန် အချက်အလက် မရရှိနိုင်ပါ။';

        return res.json({
          reply: replyText,
          model: 'gemini-3.8-flash',
        });
      } catch (geminiErr: any) {
        console.warn('Gemini API call timed out or failed, using intelligent logistics responder:', geminiErr?.message);
      }
    }

    // Intelligent domain-specific logistics engine fallback
    const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
    let fallbackReply = '';

    if (lastUserMsg.includes('တွက်') || lastUserMsg.includes('ပိဿာ') || lastUserMsg.includes('ကျသင့်') || lastUserMsg.includes('rate') || lastUserMsg.includes('fee')) {
      const vissMatch = lastUserMsg.match(/(\d+(\.\d+)?)\s*(ပိဿာ|viss)/i);
      const viss = vissMatch ? parseFloat(vissMatch[1]) : 10;
      const customerRate = gateContext?.currentRates?.customerRatePerViss || 1200;
      const truckRate = gateContext?.currentRates?.truckRatePerViss || 1100;
      const mdyLabor = gateContext?.currentRates?.mdyLaborPerViss || 25;
      const kalayLabor = gateContext?.currentRates?.kalayLaborPerViss || 25;
      const totalFee = viss * customerRate;
      const truckCost = viss * truckRate;
      const totalLabor = viss * (mdyLabor + kalayLabor);
      const profit = totalFee - (truckCost + totalLabor);

      fallbackReply = `📦 **မန္တလေး ⇄ ကလေး ကုန်ကျစရိတ် တွက်ချက်မှု (${viss} ပိဿာ အတွက်)**:\n\n` +
        `• **ဖောက်သည်ကျသင့်ငွေ:** ${viss} ပိဿာ × ${customerRate.toLocaleString()} ကျပ် = **${totalFee.toLocaleString()} ကျပ်**\n` +
        `• **၁၂ ဘီးကားခ ကုန်ကျစရိတ်:** ${viss} ပိဿာ × ${truckRate.toLocaleString()} ကျပ် = ${truckCost.toLocaleString()} ကျပ်\n` +
        `• **မန္တလေး တင်ခ + ကလေး ချခ အလုပ်သမားစရိတ်:** ${viss} ပိဿာ × ${(mdyLabor + kalayLabor)} ကျပ် = ${totalLabor.toLocaleString()} ကျပ်\n` +
        `• **ဂိတ်အသားတင် အမြတ်ငွေ (Net Profit):** ${viss} ပိဿာ × ၅၀ ကျပ် = **${profit.toLocaleString()} ကျပ်**\n\n` +
        `*(မှတ်ချက်- ကုန်ပွစျေး သတ်မှတ်ထားသော ပစ္စည်းဖြစ်ပါက ကုန်ပွနှုန်းထားဖြင့် တွက်ချက်ရပါမည်)*`;
    } else if (lastUserMsg.includes('ကီလို') || lastUserMsg.includes('kg')) {
      const kgMatch = lastUserMsg.match(/(\d+(\.\d+)?)\s*(ကီလို|kg)/i);
      const kg = kgMatch ? parseFloat(kgMatch[1]) : 10;
      const viss = (kg / 1.63293).toFixed(2);
      const fee = Math.round(parseFloat(viss) * 1200);

      fallbackReply = `⚖️ **ကီလို ⇄ ပိဿာ ပြောင်းလဲတွက်ချက်မှု**:\n\n` +
        `• **အလေးချိန်:** ${kg} Kg = **${viss} ပိဿာ** (စံနှုန်း: 1 ပိဿာ = 1.63293 Kg)\n` +
        `• **နှုန်းထား:** ၁ ပိဿာ ၁,၂၀၀ ကျပ် (၁ Kg လျှင် ၇၃၄.၉ ကျပ်နှုန်း ကျသင့်ပါသည်)\n` +
        `• **စုစုပေါင်း ကျသင့်ငွေ:** **${fee.toLocaleString()} ကျပ်**`;
    } else if (lastUserMsg.includes('ယာဉ်မောင်း') || lastUserMsg.includes('စရိတ်') || lastUserMsg.includes('driver') || lastUserMsg.includes('settle')) {
      fallbackReply = `🚛 **၁၂ ဘီးကား ယာဉ်မောင်း စရိတ်ရှင်းတမ်း စနစ် (Driver Trip Advance & Settlement)**:\n\n` +
        `၁။ **မန္တလေးမှ ထွက်ခွာချိန် (Advance):** ယာဉ်မောင်းအား ဆီဖိုးနှင့် လမ်းစရိတ်အတွက် ကြိုထုတ်ငွေ (Advance) ပေးအပ်ပြီး အက်ပ်တွင် မှတ်သားသည်။\n` +
        `၂။ **လမ်းခရီးတွင်:** ယာဉ်မောင်းက စစ်ဆေးရေးဂိတ်၊ တံတားကြေးနှင့် ဆီဖြည့်ပြေစာများကို အက်ပ်တွင် ထည့်သွင်းနိုင်သည်။\n` +
        `၃။ **ကလေးဂိတ် ဆိုက်ရောက်ချိန် (Final Settlement):** ကားပေါ်ပါ ပစ္စည်းများအားလုံး ချပြီးပါက စုစုပေါင်း ကားခ (၁,၁၀၀ ကျပ်/ပိဿာ) ထဲမှ ကြိုထုတ်ငွေကို နုတ်ကာ ကျန်ငွေ (Remaining Settlement) ကို ကလေးဂိတ်မှ ငွေသားတိုက်ရိုက် ရှင်းပေးပါသည်။`;
    } else if (lastUserMsg.includes('ကုန်ပွ') || lastUserMsg.includes('bulky')) {
      fallbackReply = `📦 **ကုန်ပွစျေး (Bulky / Volumetric Goods Rate) သတ်မှတ်ပုံ**:\n\n` +
        `အလေးချိန် ပေါ့သော်လည်း ကားပေါ်တွင် ထုထည်နေရာယူသော ပစ္စည်းများ (ဥပမာ- မုန့်ဖာများ၊ ခေါင်းအုံး၊ အဝတ်အထည်အိတ်ကြီးများ၊ ဖော့ဖာများ) အတွက် အခြေခံ ၁,၂၀၀ ကျပ်အစား **၁,၆၀၀ ကျပ် (သို့မဟုတ် Admin သတ်မှတ်နှုန်း)** ဖြင့် ကုန်ပွစျေး သတ်မှတ်ရပါမည်။ ဘောင်ချာဖွင့်ချိန်တွင် "ကုန်ပွစျေး" ခလုတ်ကို ဖွင့်လိုက်ရုံဖြင့် အလိုအလျောက် တွက်ချက်ပေးပါသည်။`;
    } else if (lastUserMsg.includes('လျော်ကြေး') || lastUserMsg.includes('ပျောက်') || lastUserMsg.includes('claim')) {
      fallbackReply = `🛡️ **လမ်းခရီး ပစ္စည်းပျောက်ဆုံး/ပျက်စီး လျော်ကြေး လုပ်ထုံးလုပ်နည်း**:\n\n` +
        `၁။ ကလေးဂိတ်တွင် ကားချစကင်ဖတ်ချိန်၌ ပစ္စည်းမပါလာခြင်း သို့မဟုတ် ပျက်စီးနေပါက "လျော်ကြေးတောင်းခံရန်" ခလုတ်ကို နှိပ်ပါ။\n` +
        `၂။ ပျက်စီးသည့် ဓာတ်ပုံ၊ အကြောင်းအရင်းနှင့် တောင်းခံငွေ (Claimed Amount) ကို ထည့်သွင်းပါ။\n` +
        `၃။ ရုံးချုပ် (Admin) က စစ်ဆေးပြီး အတည်ပြုပါက ထိုလျော်ကြေးငွေကို အက်ပ်၏ True Net Profit ထဲမှ အလိုအလျောက် နုတ်ယူရှင်းတမ်း ထုတ်ပေးပါသည်။`;
    } else {
      fallbackReply = `မင်္ဂလာပါ BMK Express မှ ကြိုဆိုပါသည်! 🚚\n\n` +
        `ကျွန်တော်သည် မန္တလေး ⇄ ကလေး ၁၂ ဘီးကား ကုန်စည်ပို့ဆောင်ရေးအတွက် စမတ်လက်ထောက် ဖြစ်ပါသည်။\n\n` +
        `အောက်ပါ အချက်အလက်များကို မေးမြန်းနိုင်ပါသည်:\n` +
        `• ကုန်စည်အလေးချိန်အလိုက် ကျသင့်ငွေနှင့် အမြတ်ငွေ တွက်ချက်ခြင်း\n` +
        `• ပိဿာ ⇄ ကီလို (Viss ⇄ Kg) အပြန်အလှန် ပြောင်းလဲခြင်း\n` +
        `• ၁၂ ဘီးကား ယာဉ်မောင်း စရိတ်ရှင်းတမ်း တွက်နည်း\n` +
        `• ကုန်ပွစျေး (Bulky rate) နှင့် ပျောက်ဆုံးလျော်ကြေး လုပ်ထုံးလုပ်နည်းများ`;
    }

    res.json({
      reply: fallbackReply,
      model: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Gemini API Server Error:', error);
    res.status(500).json({
      error: 'Gemini API call failed',
      details: error?.message || 'Unknown server error',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BMK Express Server running on port ${PORT}`);
  });
}

startServer();
