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
  Download
} from 'lucide-react';

interface AndroidStudioHubProps {
  lang: 'my' | 'en';
}

export const AndroidStudioHub: React.FC<AndroidStudioHubProps> = ({ lang }) => {
  const [selectedFile, setSelectedFile] = useState<AndroidCodeFile>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'architecture' | 'offline_sync'>('code');

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
                Android Studio · Jetpack Compose · MVVM
              </span>
              <span className="text-slate-500 text-xs">·</span>
              <span className="text-slate-400 text-xs font-mono">Firebase Firestore + Room Database</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              {lang === 'my'
                ? 'BMK Android Application စနစ်တည်ဆောက်ပုံနှင့် Source Code'
                : 'BMK Android Studio Architecture & Source Code Hub'}
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {lang === 'my'
                ? 'မန္တလေး-ကလေး ကုန်စည်ပို့ဆောင်ရေးလုပ်ငန်းအတွက် Android Studio တွင် အပြည့်အစုံ ရေးသားအသုံးပြုနိုင်သည့် MVVM Architecture, Room Database (Offline-first), Firebase Firestore Schema, Kotlin Data Models, ViewModels နှင့် Jetpack Compose Screens များ။'
                : 'Production-ready Android code files, Room DB offline cache, Firestore sync, and Jetpack Compose screens for BMK Car Gate.'}
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
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white bg-slate-950'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{lang === 'my' ? 'Kotlin ဖိုင်များနှင့် Schema' : 'Kotlin Files & Schema'}</span>
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
            <span>{lang === 'my' ? 'MVVM Architecture ဖွဲ့စည်းပုံ' : 'MVVM Architecture'}</span>
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
            <span>{lang === 'my' ? 'Offline-First Sync နည်းဗျူဟာ' : 'Offline-First Sync Best Practices'}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Code Files Explorer */}
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
            {/* Code Header */}
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

            {/* Code Body */}
            <pre className="p-5 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed max-h-[580px] bg-slate-950/90">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: Architecture Diagram & Flow */}
      {activeTab === 'architecture' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-6">
          <h3 className="text-lg font-bold text-white">
            {lang === 'my' ? 'Android Studio MVVM + Clean Architecture တည်ဆောက်ပုံ' : 'Android Studio MVVM Architecture'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* Layer 1: Presentation */}
            <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-950/20 space-y-2">
              <span className="font-bold text-sky-400 block text-sm">1. UI Layer (Jetpack Compose)</span>
              <p className="text-slate-300">
                Declarative UI using Material 3 and Compose State.
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-1 pt-1">
                <li><code className="text-sky-300">AddParcelScreen.kt</code>: Instant rate auto calculation</li>
                <li><code className="text-sky-300">DashboardScreen.kt</code>: P&L and revenue metrics</li>
                <li><code className="text-sky-300">ClaimsScreen.kt</code>: Loss incident reporting</li>
                <li><code className="text-sky-300">QrScannerScreen.kt</code>: Barcode camera scanning</li>
              </ul>
            </div>

            {/* Layer 2: ViewModel */}
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-2">
              <span className="font-bold text-amber-400 block text-sm">2. ViewModel Layer</span>
              <p className="text-slate-300">
                Reactive StateFlow holders with business logic.
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-1 pt-1">
                <li><code className="text-amber-300">ParcelViewModel.kt</code></li>
                <li><code className="text-amber-300">FinancialViewModel.kt</code></li>
                <li>Reactive <code className="text-slate-200">combine()</code> of parcels and claims for true net profit</li>
              </ul>
            </div>

            {/* Layer 3: Repository */}
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
              <span className="font-bold text-emerald-400 block text-sm">3. Repository Layer</span>
              <p className="text-slate-300">
                Single Source of Truth coordinating local DB & Cloud.
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-1 pt-1">
                <li><code className="text-emerald-300">ParcelRepository.kt</code></li>
                <li>Local-first writes for zero latency</li>
                <li>Background Cloud push and real-time snapshot sync</li>
              </ul>
            </div>

            {/* Layer 4: Data Sources */}
            <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 space-y-2">
              <span className="font-bold text-purple-400 block text-sm">4. Data Sources</span>
              <p className="text-slate-300">
                Room SQLite Local Cache + Cloud Firestore.
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-1 pt-1">
                <li><code className="text-purple-300">Room DB (ParcelDao)</code> for offline storage</li>
                <li><code className="text-purple-300">Firebase Firestore</code> for gate-to-gate sync</li>
                <li>WorkManager for resilient retry logic</li>
              </ul>
            </div>
          </div>

          {/* Directory Hierarchy */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
            <div className="text-amber-400 font-bold mb-2">// Recommended Package Hierarchy</div>
            <div>com.bmk.cargate/</div>
            <div>├── data/</div>
            <div>│   ├── local/ (AppDatabase.kt, ParcelDao.kt, ParcelEntity.kt)</div>
            <div>│   ├── model/ (Parcel.kt, Trip.kt, Claim.kt, UserRole.kt)</div>
            <div>│   ├── remote/ (FirestoreService.kt)</div>
            <div>│   └── repository/ (ParcelRepository.kt, TripRepository.kt)</div>
            <div>├── di/ (DatabaseModule.kt, FirebaseModule.kt)</div>
            <div>├── ui/</div>
            <div>│   ├── screens/ (AddParcelScreen.kt, DashboardScreen.kt, ClaimsScreen.kt)</div>
            <div>│   ├── components/ (VoucherCard.kt, QrScanner.kt, RateBar.kt)</div>
            <div>│   ├── viewmodel/ (ParcelViewModel.kt, ClaimsViewModel.kt)</div>
            <div>│   └── theme/ (Color.kt, Theme.kt, Type.kt)</div>
            <div>└── utils/ (VissCalculator.kt, ReceiptPrinter.kt, ViberShareHelper.kt)</div>
          </div>
        </div>
      )}

      {/* Tab 3: Offline-First Sync Best Practices */}
      {activeTab === 'offline_sync' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-5 text-xs text-slate-300 leading-relaxed">
          <h3 className="text-lg font-bold text-white">
            {lang === 'my'
              ? 'တောင်တက်လမ်းခရီးနှင့် ဂိတ်များအတွက် Offline Sync & Error Management စနစ်'
              : 'Best Practices for Offline Sync & Error Management (Mandalay ⇄ Kalay)'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
              <span className="font-bold text-amber-400 text-sm block">
                ၁။ အင်တာနက်လိုင်းမရှိချိန် (Offline Capability)
              </span>
              <p>
                မန္တလေးနှင့် ကလေးကြား တောင်တက်လမ်းကြမ်း (ဂန့်ဂေါ-ကျောက်ထုလမ်းပိုင်း) တွင် ဖုန်းလိုင်းနှင့် အင်တာနက် ခေတ္တပြတ်တောက်လေ့ရှိပါသည်။
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>
                  <strong className="text-slate-200">Local-First Write:</strong> ဂိတ်စာရေးများသည် အင်တာနက်မရှိသော်လည်း ပစ္စည်းလက်ခံခြင်း၊ ဘောင်ချာထုတ်ပေးခြင်းကို Room SQLite Database သို့ ချက်ချင်း သိမ်းဆည်းနိုင်ပါသည်။
                </li>
                <li>
                  <strong className="text-slate-200">Pending Sync Flag:</strong> <code className="text-amber-300">isPendingSync = true</code> အဖြစ် မှတ်သားထားပြီး အင်တာနက်ရရှိသည်နှင့် WorkManager က Firebase သို့ အလိုအလျောက် ပို့ပေးပါသည်။
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
              <span className="font-bold text-amber-400 text-sm block">
                ၂။ ပျောက်ဆုံး/ပျက်စီးမှု စာရင်းကို အမြတ်မှ အလိုအလျောက်နုတ်ခြင်း
              </span>
              <p>
                လမ်းခရီး ပစ္စည်းပျောက်ဆုံးပါက စာရင်းဇယား ရှုပ်ထွေးမှုမရှိစေရန် ViewModel တွင် StateFlow combine ဖြင့် True Net Profit ကို အချိန်နှင့်တပြေးညီ တွက်ချက်ထားပါသည်။
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>
                  <strong className="text-slate-200">Deduction Rule:</strong> <code className="text-emerald-300">True Net Profit = Gross Profit (50 MMK x Viss) - Approved Claims</code>
                </li>
                <li>
                  <strong className="text-slate-200">RBAC Security:</strong> လျော်ကြေးငွေ ထုတ်ပေးခြင်းကို ဂိတ်ပိုင်ရှင် (Admin) တစ်ဦးတည်းသာ အတည်ပြုခွင့်ရှိစေရန် Firestore Security Rules ဖြင့် ကာကွယ်ထားပါသည်။
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
