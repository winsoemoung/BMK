import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  doc,
  getDocFromServer,
  Firestore
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import firebaseConfigData from '../../firebase-applet-config.json';

export const firebaseConfig = {
  projectId: firebaseConfigData.projectId || "pos-sync-511822",
  appId: firebaseConfigData.appId || "1:223700756175:web:f93cb667f1d3dd54a7f9ba",
  apiKey: firebaseConfigData.apiKey || "AIzaSyBwCJTvVOhiyncT0ps4Y64imLp7-8CcPkw",
  authDomain: firebaseConfigData.authDomain || "pos-sync-511822.firebaseapp.com",
  firestoreDatabaseId: firebaseConfigData.firestoreDatabaseId || "ai-studio-bmkexpresscargat-04930568-0817-4b66-a8d1-842760223317",
  storageBucket: firebaseConfigData.storageBucket || "pos-sync-511822.firebasestorage.app",
  messagingSenderId: firebaseConfigData.messagingSenderId || "223700756175"
};

// Initialize App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth: Auth = getAuth(app);

// Initialize Firestore with Persistent Multi-Tab Local Cache and Custom Database ID
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, firebaseConfig.firestoreDatabaseId);
} catch (e) {
  // If already initialized, retrieve existing instance
  firestoreInstance = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreInstance;

// Test connection to Firestore on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore successfully connected to project:', firebaseConfig.projectId);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is currently working offline with local cache.');
    } else {
      console.log('Firebase connection test completed:', error);
    }
    return false;
  }
}
