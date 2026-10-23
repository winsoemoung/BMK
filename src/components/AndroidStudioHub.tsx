import React, { useState } from 'react';
import { ANDROID_PROJECT_FILES, AndroidCodeFile } from '../data/androidProjectData';
import { 
  Code2, 
  Copy, 
  Check, 
  FolderTree, 
  FileCode, 
  Database, 
  Layers, 
  ShieldCheck, 
  Smartphone,
  ExternalLink,
  Download,
  Cloud,
  ArrowRight,
  RefreshCw,
  Cpu
} from 'lucide-react';

interface AndroidStudioHubProps {
  lang: 'my' | 'en';
}

export const AndroidStudioHub: React.FC<AndroidStudioHubProps> = ({ lang }) => {
  const [selectedFile, setSelectedFile] = useState<AndroidCodeFile>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'single_apk_guide' | 'code' | 'architecture' | 'offline_sync'>('single_apk_guide');

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ANDROID_PROJECT_FILES, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "BMK_Android_Studio_Architecture.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border border-emerald-500/30 bg-slate-900/90 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                Android Studio · Single APK Architecture · Role-Based Auth
              </span>
              <span className="text-slate-500 text-xs">·</span>
              <span className="text-slate-400 text-xs font-mono">Firebase Authentication + Firestore</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              {lang === 'my'
                ? 'APK (၁) ခုတည်း ထုတ်လုပ်ခြင်းနှင့် အကောင့်ခွဲခြားသည့်စနစ်'
                : 'Single APK Architecture & Role-Based Authentication'}
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {lang === 'my'
                ? 'အက်ပ် (၃) ခု သီးသန့် ထုတ်ရန်မလိုဘဲ BMK-Express.apk တစ်ခုတည်းကိုသာ ထုတ်ပြီး ဖုန်းအားလုံးတွင် သွင်းကာ Role-Based Login (Admin, Mandalay, Kalay, Driver) ဖြင့် အလိုအလျောက် ခွဲခြားအသုံးပြုပုံ။'
                : 'Build 1 single APK (BMK-Express.apk) installed on all phones, dynamically routing to Admin, Mandalay Gate, Kalay Gate, or Driver views based on user account / PIN.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'my' ? 'JSON Bundle ဒေါင်းလုဒ်' : 'Export Bundle'}</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs flex-wrap">
          <button
            onClick={() => setActiveTab('single_apk_guide')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'single_apk_guide'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white bg-slate-950'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'my' ? 'APK ၁ ခုတည်း & အကောင့်စနစ် လမ်းညွှန်' : 'Single APK & Auth Guide'}</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white bg-slate-950'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{lang === 'my' ? 'Gradle & Kotlin Source Files' : 'Gradle & Kotlin Code'}</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white bg-slate-950'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === 'my' ? 'MVVM Architecture' : 'MVVM Architecture'}</span>
          </button>
          <button
            onClick={() => setActiveTab('offline_sync')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'offline_sync'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white bg-slate-950'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{lang === 'my' ? 'Offline Sync နည်းဗျူဟာ' : 'Offline Sync'}</span>
          </button>
        </div>
      </div>

      {/* Tab: Single APK & Auth Guide */}
      {activeTab === 'single_apk_guide' && (
        <div className="space-y-6">
          {/* Why Single APK Card */}
          <div className="p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 to-emerald-950/30 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>APK (၁) ခုတည်း ထုတ်လုပ်ခြင်းနှင့် အကောင့်ခွဲခြားသည့် စနစ် (Single APK + RBAC)</span>
              </h3>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/40">
                Package: com.bmk.cargate · BMK-Express.apk
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              ယခင်က အက်ပ် ၃ ခု (Admin APK, Mandalay APK, Kalay APK) သီးသန့် ထုတ်ရခြင်းကြောင့် ဖုန်းများတွင် အက်ပ်များ မှားယွင်းသွင်းမိခြင်း၊ Play Store သို့ ၃ ခါတင်ရခြင်း၊ Update ၃ ခါ လုပ်ရခြင်း စသည့် အခက်အခဲများ ရှိခဲ့ပါသည်။ 
              ယခုစနစ်တွင် <strong>BMK-Express.apk တစ်ခုတည်းကိုသာ ထုတ်လုပ်ပြီး</strong> ဖုန်းအားလုံးတွင် တူညီစွာ သွင်းထားနိုင်ပါသည်။ ဂိတ်တာဝန်ခံများသည် မိမိတို့၏ အကောင့် (သို့မဟုတ်) ၄ လုံး PIN ဖြင့် ဝင်ရောက်ရုံဖြင့် သက်ဆိုင်ရာ လုပ်ငန်းမျက်နှာပြင်များ အလိုအလျောက် ပေါ်လာမည် ဖြစ်ပါသည်။
            </p>

            {/* Visual Account Flow diagram */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
              {/* Account 1: Admin */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 text-xs">၁။ ဂိတ်ပိုင်ရှင် (HQ Admin)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">PIN: 1234</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  စုစုပေါင်း P&L ဝင်ငွေ၊ အမြတ်ငွေ (၅၀ ကျပ်/ပိဿာ)၊ ၁၂ ဘီးကားခ၊ စိတ်ကြိုက်နှုန်းထားသတ်မှတ်မှု၊ ပျောက်ဆုံးလျော်ကြေး အတည်ပြုခြင်းနှင့် ကားသမားစာရင်းရှင်းတမ်း။
                </p>
              </div>

              {/* Account 2: Mandalay Staff */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-sky-500/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-400 text-xs">၂။ မန္တလေးဂိတ် (Mandalay)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">PIN: 2222</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  ကုန်စည်လက်ခံချိန်တွယ်ခြင်း (ပိဿာ/Kg)၊ ကုန်ပွစျေး၊ Bluetooth 58mm/80mm QR စတစ်ကာထုတ်ခြင်း၊ ၁၂ ဘီးကားပေါ်တင်ခြင်းနှင့် စစ်ဆေးရေးဂိတ်စာရင်းချုပ် (Manifest)။
                </p>
              </div>

              {/* Account 3: Kalay Staff */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-400 text-xs">၃။ ကလေးဂိတ် (Kalay)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">PIN: 3333</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  ၁၂ ဘီးကား ဆိုက်ရောက်လက်ခံခြင်း၊ ကားချအလုပ်သမားခ (၂၅ ကျပ်/ပိဿာ) အတည်ပြုခြင်း၊ ကုန်စည်စကင်ဖတ်ခြင်း၊ COD ငွေကောက်ခံခြင်းနှင့် ပျောက်ဆုံးစာရင်းတင်ခြင်း။
                </p>
              </div>

              {/* Account 4: Driver */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 text-xs">၄။ ၁၂ ဘီး ယာဉ်မောင်း</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">PIN: 4444</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  လမ်းခရီး စစ်ဆေးရေးဂိတ်များအတွက် ကားပေါ်ပါ ပစ္စည်းစာရင်းချုပ် (Cargo Manifest) ကြည့်ရှုခြင်းနှင့် ဆီဖိုး/လမ်းစရိတ် ကြိုထုတ်ငွေစာရင်း။
                </p>
              </div>
            </div>
          </div>

          {/* Implementation Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-300">
            {/* Step 1: APK Build */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3">
              <span className="font-bold text-amber-400 text-sm block flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                <span>၁။ Android Studio တွင် APK တစ်ခုတည်း ထုတ်ယူနည်း</span>
              </span>
              <p className="leading-relaxed">
                <code>build.gradle.kts</code> တွင် Flavor ရှုပ်ထွေးမှုများ မလိုတော့ဘဲ Standard Release APK ကို ထုတ်ယူပါသည်:
              </p>
              <div className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-amber-300 border border-slate-800 space-y-1">
                <div>// Android Studio Terminal တွင် ရိုက်ထည့်ရန်:</div>
                <div className="text-white font-bold">$ ./gradlew assembleRelease</div>
                <div className="text-slate-500">// ရလဒ်: app/build/outputs/apk/release/BMK-Express.apk</div>
              </div>
              <p className="text-[11px] text-slate-400">
                ဤ APK တစ်ခုတည်းကိုပင် ဂိတ်ပိုင်ရှင်ဖုန်း၊ မန္တလေးစာရေးဖုန်း၊ ကလေးဂိတ်ဖုန်းနှင့် ကားသမားဖုန်းအားလုံးသို့ ပေးပို့သွင်းထားနိုင်ပါသည်။
              </p>
            </div>

            {/* Step 2: Role Resolution & Security */}
            <div className="p-5 rounded-2xl border border-emerald-500/30 bg-slate-900/80 space-y-3">
              <span className="font-bold text-emerald-400 text-sm block flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>၂။ လုံခြုံရေးနှင့် Role အလိုအလျောက် သတ်မှတ်ပုံ</span>
              </span>
              <p className="leading-relaxed">
                အက်ပ်စဖွင့်ချိန်တွင် ၄ လုံး PIN နံပါတ် ရိုက်ထည့်ရုံဖြင့် Firestore Database ရှိ <code>users</code> collection မှတစ်ဆင့် User Role ကို ဆွဲယူအတည်ပြုပြီး သက်ဆိုင်ရာ Screen သို့ ရောက်ရှိစေပါသည်:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>လိုင်းမရှိချိန်တွင်လည်း ဖုန်း၏ Encrypted Cache မှ PIN စစ်ဆေးနိုင်ပါသည်။</li>
                <li>Cloud Firestore Security Rules က အခြားဂိတ်ဒေတာကို ခိုးယူပြင်ဆင်ခြင်းမှ အပြည့်အဝ ကာကွယ်ပေးထားပါသည်။</li>
                <li>ဝန်ထမ်းအပြောင်းအလဲရှိပါက App Update လုပ်ရန်မလိုဘဲ ရုံးချုပ်မှ PIN သို့မဟုတ် Role ပြောင်းပေးရုံသာ ဖြစ်ပါသည်။</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Code Files Explorer */}
      {activeTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* File Tree Sidebar */}
          <div className="lg:col-span-4 p-4 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 px-2 pb-2 border-b border-slate-800">
              <FolderTree className="w-3.5 h-3.5 text-emerald-400" />
              <span>Project Files (Android Studio)</span>
            </div>

            <div className="space-y-1">
              {ANDROID_PROJECT_FILES.map((file) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex flex-col gap-0.5 ${
                    selectedFile.path === file.path
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-xs">{file.filename}</span>
                    <span className="text-[10px] uppercase font-mono text-slate-500">{file.language}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate">{file.path}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/80">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-400 block">{selectedFile.filename}</span>
                <span className="text-[11px] text-slate-400">{selectedFile.description}</span>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="p-5 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed max-h-[580px] bg-slate-950/90">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Tab: Architecture */}
      {activeTab === 'architecture' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-6">
          <h3 className="text-lg font-bold text-white">
            {lang === 'my' ? 'Android Studio MVVM + Clean Architecture တည်ဆောက်ပုံ' : 'Android Studio MVVM Architecture'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-950/20 space-y-2">
              <span className="font-bold text-sky-400 block text-sm">1. UI Layer (Jetpack Compose)</span>
              <p className="text-slate-300">
                Admin, Mandalay, Kalay UI Screens.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-2">
              <span className="font-bold text-amber-400 block text-sm">2. ViewModel Layer</span>
              <p className="text-slate-300">
                Reactive StateFlow holders with real-time financial calculations.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
              <span className="font-bold text-emerald-400 block text-sm">3. Cloud Repository Layer</span>
              <p className="text-slate-300">
                CloudSyncRepository coordinating Firebase Snapshot Listener.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 space-y-2">
              <span className="font-bold text-purple-400 block text-sm">4. Cloud Data Source</span>
              <p className="text-slate-300">
                Firebase Firestore + Room Database offline cache.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Offline Sync & Conflict Resolution */}
      {activeTab === 'offline_sync' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-6 rounded-2xl border border-sky-500/30 bg-gradient-to-br from-slate-900 to-sky-950/40 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-mono text-xs font-bold">
                Firestore Offline Persistence & Concurrency
              </span>
              <span className="text-slate-500 text-xs">·</span>
              <span className="text-slate-300 text-xs font-semibold">
                {lang === 'my' ? 'မန္တလေး ⇄ ကလေး လမ်းခရီး ဒေတာမပျောက်စေသော စနစ်' : 'Zero Data Loss on Remote Mountain Highways'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">
              {lang === 'my'
                ? 'Offline Persistence သို့ ပြောင်းလဲခြင်းနှင့် အက်ပ် (၃) ခု Data Conflict ဖြေရှင်းနည်း'
                : 'Migrating to Firestore Offline Persistence & 3-App Conflict Resolution'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              {lang === 'my'
                ? 'မန္တလေး-ကလေး ကုန်စည်ပို့ဆောင်ရေးလမ်းကြောင်းတွင် လိုင်းမမိသော လမ်းပိုင်းများ (ဂန့်ဂေါ၊ ကျောက်ထု၊ ကလေးဝ) များစွာရှိပါသည်။ ဤလမ်းညွှန်သည် Local State မှ Firestore Offline Disk Cache သို့ အဆင့်လိုက် ပြောင်းရွှေ့ပုံနှင့် မန္တလေးနှင့် ကလေးဂိတ်တို့မှ တစ်ပြိုင်နက် offline ပြင်ဆင်မှုများကို Field-Level Merge ဖြင့် မပျောက်ပျက်အောင် ထိန်းသိမ်းပုံ ဖြစ်ပါသည်။'
                : 'Logistics routes between Mandalay and Kalay traverse remote mountain sections with zero cellular coverage. This architecture details migrating from local state to native Firestore Persistent Disk Cache, paired with field-level merging to eliminate overwrites between Admin, Mandalay, and Kalay apps.'}
            </p>
          </div>

          {/* Interactive Conflict Resolution Simulator */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">Interactive Conflict Simulator</span>
                <h4 className="text-sm font-bold text-white">
                  {lang === 'my' ? 'မန္တလေးနှင့် ကလေးဂိတ် အပြိုင်ပြင်ဆင်မှု (Conflict) ဖြေရှင်းပုံ လက်တွေ့စမ်းသပ်မှု' : 'Simultaneous Offline Edits Conflict Resolution Test'}
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                Parcel ID: #BMK-7842
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Mandalay Gate Offline Edit */}
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400">1. Mandalay Gate (Offline)</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono">10:15 AM</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {lang === 'my' ? 'မန္တလေးဂိတ်က ကုန်ချိန်ကို ၁၀ ပိဿာမှ ၁၂ ပိဿာသို့ ပြင်ပြီး ပေါ့သောကုန်ပွစျေး နှုန်းထား ထပ်ပေါင်းသည်။' : 'Mandalay staff updates weight from 10 to 12 viss and adjusts bulky rate.'}
                </p>
                <div className="p-2 rounded bg-slate-950 font-mono text-[11px] text-amber-200/90 space-y-0.5">
                  <div>weightViss: <span className="text-white font-bold">12.0</span></div>
                  <div>customerRate: <span className="text-white font-bold">1,200</span> MMK</div>
                  <div>totalDeliveryFee: <span className="text-white font-bold">14,400</span> MMK</div>
                </div>
              </div>

              {/* Kalay Gate Offline Edit */}
              <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-400">2. Kalay Gate (Offline)</span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono">10:18 AM</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {lang === 'my' ? 'ကလေးဂိတ်က ကုန်ကားရောက်ရှိသဖြင့် စကင်ဖတ်ကာ ပစ္စည်းချ (ARRIVED) နှင့် COD ငွေလက်ခံပြီးကြောင်း မှတ်သားသည်။' : 'Kalay scans package upon truck arrival, updates status to ARRIVED_KALAY and marks COD collected.'}
                </p>
                <div className="p-2 rounded bg-slate-950 font-mono text-[11px] text-purple-200/90 space-y-0.5">
                  <div>status: <span className="text-white font-bold">ARRIVED_KALAY</span></div>
                  <div>paymentStatus: <span className="text-white font-bold">PAID (COD)</span></div>
                  <div>unloadedBy: <span className="text-white font-bold">Kalay Staff</span></div>
                </div>
              </div>

              {/* Server Atomic Merge Result */}
              <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400">3. Cloud Firestore (Merged)</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">Reconciled</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {lang === 'my' ? 'ဖုန်းလိုင်းပြန်မိချိန်တွင် Role Matrix အရ Field-Level Merge ဖြင့် နှစ်ဖက်စလုံး၏ ပြင်ဆင်ချက်များ ပေါင်းစပ်အတည်ပြုသည်။' : 'On reconnect, OCC Transaction merges both updates atomically without overwriting.'}
                </p>
                <div className="p-2 rounded bg-slate-950 font-mono text-[11px] text-emerald-200/90 space-y-0.5">
                  <div>weightViss: <span className="text-emerald-400 font-bold">12.0</span> (From MDY)</div>
                  <div>status: <span className="text-purple-400 font-bold">ARRIVED_KALAY</span> (From Kalay)</div>
                  <div>paymentStatus: <span className="text-purple-400 font-bold">PAID</span> (From Kalay)</div>
                  <div>versionSequence: <span className="text-sky-400 font-bold">3 (+1)</span></div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓ အကျိုးရလဒ်:</span>
              <span>
                ရိုးရိုး <code>set()</code> အသုံးပြုပါက နောက်ဆုံးမိသော အက်ပ်၏ ဒေတာက အရင်လူ၏ ဒေတာကို အကုန်ဖျက်ပစ်မည် (Last-Write-Wins Data Loss)။ 
                ကျွန်ုပ်တို့၏ <strong>Field-Level Ownership Matrix</strong> စနစ်ကြောင့် မန္တလေး၏ ကုန်ချိန်အသစ်နှင့် ကလေး၏ ကားချငွေရှင်းစာရင်း နှစ်ခုစလုံး လုံးဝမပျောက်ပျက်ဘဲ ပေါင်းစပ်သွားပါသည်။
              </span>
            </div>
          </div>

          {/* 4 Architectural Pillars of the Migration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Pillar 1 */}
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">1</div>
                <span className="font-bold text-white text-sm">Offline Persistence Setup (Disk Cache)</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Android တွင် <code>persistentDiskCacheSettings</code> ဖြင့် Disk ပေါ်တွင် 100MB Cache သတ်မှတ်ပေးထားပါသည်။ အင်တာနက် လုံးဝမရှိချိန်တွင်လည်း 
                ပစ္စည်းစာရင်းကြည့်ခြင်း၊ ဘောင်ချာအသစ်သွင်းခြင်း၊ QR စကင်ဖတ်ခြင်းများ အပြည့်အဝ လုပ်ဆောင်နိုင်ပြီး Local Disk ပေါ်တွင် ချက်ချင်း အတည်ပြုသိမ်းဆည်းပါသည်။
              </p>
              <div className="p-2 rounded bg-slate-950 font-mono text-[10px] text-sky-300 border border-slate-800">
                FirebaseFirestoreSettings.Builder().setLocalCacheSettings(persistentDiskCacheSettings &#123; setSizeBytes(100MB) &#125;)
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">2</div>
                <span className="font-bold text-white text-sm">Role-Based Field Ownership Matrix</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                အက်ပ် ၃ ခုတွင် တစ်ခုချင်းစီ၏ ပိုင်ဆိုင်မှုအကွက် (Field) များကို သတ်မှတ်ထားခြင်းဖြင့် ပြိုင်ဆိုင်မှုဒဏ်ကို ကာကွယ်ပါသည်:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li><strong className="text-white">မန္တလေးဂိတ်:</strong> ကုန်ချိန် (Weight), ပို့သူ/လက်ခံသူ အချက်အလက်, ကုန်ပွစျေးနှုန်း</li>
                <li><strong className="text-white">ကလေးဂိတ်:</strong> ကားချလက်ခံမှု (ARRIVED), ပစ္စည်းထုတ်ပေးမှု (DELIVERED), COD ငွေကောက်ခံမှု</li>
                <li><strong className="text-white">Admin (ရုံးချုပ်):</strong> ယာဉ်မောင်းစရိတ်စာရင်းရှင်းတမ်း, နှုန်းထားပြင်ဆင်မှု, လျော်ကြေးငွေထုတ်ပေးမှု</li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">3</div>
                <span className="font-bold text-white text-sm">Atomic Merge vs Last-Write-Wins</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Document တစ်ခုလုံးကို ပြန်မရေးဘဲ <code>SetOptions.merge()</code> သို့မဟုတ် <code>transaction.update(mapOf(...))</code> ဖြင့် မိမိပြင်ပိုင်ခွင့်ရှိသော Key များကိုသာ Update လုပ်ပါသည်။ 
                ဖုန်းနာရီ အချိန်လွဲမှားမှု (Clock Skew) ကြောင့် မှားယွင်းမှုမဖြစ်စေရန် <code>FieldValue.serverTimestamp()</code> ကို တစ်ခုတည်းသော စံချိန်အဖြစ် သုံးပါသည်။
              </p>
              <div className="p-2 rounded bg-slate-950 font-mono text-[10px] text-purple-300 border border-slate-800">
                parcels.document(id).set(updatedFields, SetOptions.merge())
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">4</div>
                <span className="font-bold text-white text-sm">Optimistic UI & WorkManager Background Queue</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                အသုံးပြုသူအား စောင့်ဆိုင်းစေခြင်းမရှိဘဲ UI တွင် ချက်ချင်း 'Saved' ပြသပေးပြီး (Optimistic UI)၊ အနောက်ကွယ်တွင် Android WorkManager နှင့် Firestore SDK က 
                အင်တာနက်ပြန်ရသည့်အချိန်အထိ Exponential Backoff ဖြင့် အလိုအလျောက် တန်းစီ (Queue) ပို့ပေးပါသည်။
              </p>
              <div className="p-2 rounded bg-slate-950 font-mono text-[10px] text-emerald-300 border border-slate-800">
                WorkManager.enqueueUniqueWork("SYNC_PARCELS", ExistingWorkPolicy.KEEP, syncRequest)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
