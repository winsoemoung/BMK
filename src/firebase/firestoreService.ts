import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';
import { Parcel, Trip, Claim, GatePricingConfig } from '../types/bmk';
import { INITIAL_PARCELS, INITIAL_TRIPS, INITIAL_CLAIMS } from '../data/mockData';

// Firestore collection references
const PARCELS_COLLECTION = 'parcels';
const TRIPS_COLLECTION = 'trips';
const CLAIMS_COLLECTION = 'claims';
const CONFIG_DOC = 'config/gatePricing';

/**
 * Seed initial BMK gate demo data if Firestore collection is fresh
 */
export async function seedInitialDataIfEmpty(): Promise<void> {
  try {
    const parcelsSnap = await getDocs(collection(db, PARCELS_COLLECTION));
    if (parcelsSnap.empty) {
      console.log('Fresh Firestore detected. Seeding initial parcels and trips...');
      const batch = writeBatch(db);

      INITIAL_PARCELS.forEach((parcel) => {
        const ref = doc(db, PARCELS_COLLECTION, parcel.id);
        batch.set(ref, {
          ...parcel,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          versionSequence: 1
        });
      });

      INITIAL_TRIPS.forEach((trip) => {
        const ref = doc(db, TRIPS_COLLECTION, trip.id);
        batch.set(ref, trip);
      });

      INITIAL_CLAIMS.forEach((claim) => {
        const ref = doc(db, CLAIMS_COLLECTION, claim.id);
        batch.set(ref, claim);
      });

      await batch.commit();
      console.log('Seeding completed successfully to Cloud Firestore.');
    }
  } catch (err) {
    console.warn('Initial seeding note (operating in offline cache mode):', err);
  }
}

/**
 * Real-time Snapshot Listener for Parcels
 */
export function subscribeToParcels(onUpdate: (parcels: Parcel[]) => void): () => void {
  const parcelsRef = collection(db, PARCELS_COLLECTION);
  return onSnapshot(
    parcelsRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const loaded: Parcel[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({ id: docSnap.id, ...docSnap.data() } as Parcel);
        });
        onUpdate(loaded);
      }
    },
    (error) => {
      console.warn('Parcels listener event:', error.message);
    }
  );
}

/**
 * Real-time Snapshot Listener for Trips
 */
export function subscribeToTrips(onUpdate: (trips: Trip[]) => void): () => void {
  const tripsRef = collection(db, TRIPS_COLLECTION);
  return onSnapshot(
    tripsRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const loaded: Trip[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({ id: docSnap.id, ...docSnap.data() } as Trip);
        });
        onUpdate(loaded);
      }
    },
    (error) => {
      console.warn('Trips listener event:', error.message);
    }
  );
}

/**
 * Real-time Snapshot Listener for Claims
 */
export function subscribeToClaims(onUpdate: (claims: Claim[]) => void): () => void {
  const claimsRef = collection(db, CLAIMS_COLLECTION);
  return onSnapshot(
    claimsRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const loaded: Claim[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({ id: docSnap.id, ...docSnap.data() } as Claim);
        });
        onUpdate(loaded);
      }
    },
    (error) => {
      console.warn('Claims listener event:', error.message);
    }
  );
}

/**
 * Real-time Snapshot Listener for Gate Pricing Config
 */
export function subscribeToPricingConfig(onUpdate: (config: GatePricingConfig) => void): () => void {
  const configDocRef = doc(db, 'config', 'gatePricing');
  return onSnapshot(
    configDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as GatePricingConfig);
      }
    },
    (error) => {
      console.warn('Pricing config listener event:', error.message);
    }
  );
}

/**
 * Save / Update Parcel in Firestore
 */
export async function syncParcelToFirestore(parcel: Parcel): Promise<void> {
  const parcelRef = doc(db, PARCELS_COLLECTION, parcel.id);
  await setDoc(parcelRef, {
    ...parcel,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

/**
 * Save / Update Trip in Firestore
 */
export async function syncTripToFirestore(trip: Trip): Promise<void> {
  const tripRef = doc(db, TRIPS_COLLECTION, trip.id);
  await setDoc(tripRef, trip, { merge: true });
}

/**
 * Save / Update Claim in Firestore
 */
export async function syncClaimToFirestore(claim: Claim): Promise<void> {
  const claimRef = doc(db, CLAIMS_COLLECTION, claim.id);
  await setDoc(claimRef, claim, { merge: true });
}

/**
 * Save / Update Gate Pricing Config in Firestore
 */
export async function syncPricingConfigToFirestore(config: GatePricingConfig): Promise<void> {
  const configDocRef = doc(db, 'config', 'gatePricing');
  await setDoc(configDocRef, config, { merge: true });
}
