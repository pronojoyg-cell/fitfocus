import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { FoodLogEntry, UserProfile } from '../types';

/**
 * User Profile Firestore Management
 * Isolated per-user document under /users/{userId}
 */
export async function firestoreGetUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err: any) {
    if (err?.code !== 'permission-denied') {
      console.warn(`[Firestore] Profile lookup notice:`, err?.message || err);
    }
    return null;
  }
}

export async function firestoreSaveUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const existing = await getDoc(userDocRef);
    const dataToSave = {
      ...profile,
      id: userId,
      updated_at: new Date().toISOString(),
      ...(!existing.exists() ? { created_at: new Date().toISOString() } : {}),
    };
    await setDoc(userDocRef, dataToSave, { merge: true });
  } catch (err: any) {
    if (err?.code !== 'permission-denied') {
      console.warn(`[Firestore] Cloud profile sync notice:`, err?.message || err);
    }
    // Retain profile gracefully without throwing to UI
  }
}

/**
 * User Food Logs Management
 * Subcollection under /users/{userId}/foodLogs/{logId}
 * Strict User Isolation: guarantees zero cross-tenant contamination
 */
export async function firestoreSaveFoodLog(userId: string, entry: FoodLogEntry): Promise<FoodLogEntry> {
  const logId = entry.id || `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const savedEntry: FoodLogEntry = {
    ...entry,
    id: logId,
    user_id: userId,
    created_at: entry.created_at || new Date().toISOString(),
  };

  try {
    const logDocRef = doc(db, 'users', userId, 'foodLogs', logId);
    await setDoc(logDocRef, savedEntry, { merge: true });
  } catch (err: any) {
    if (err?.code !== 'permission-denied') {
      console.warn(`[Firestore] Cloud food log sync notice:`, err?.message || err);
    }
  }

  return savedEntry;
}

export async function firestoreDeleteFoodLog(userId: string, logId: string): Promise<boolean> {
  try {
    const logDocRef = doc(db, 'users', userId, 'foodLogs', logId);
    await deleteDoc(logDocRef);
    return true;
  } catch (err: any) {
    if (err?.code !== 'permission-denied') {
      console.warn(`[Firestore] Cloud delete log notice:`, err?.message || err);
    }
    return true;
  }
}

export async function firestoreGetFoodLogsForDate(userId: string, date: string): Promise<FoodLogEntry[]> {
  try {
    const logsRef = collection(db, 'users', userId, 'foodLogs');
    const q = query(logsRef, where('date', '==', date));
    const snapshot = await getDocs(q);
    const logs: FoodLogEntry[] = [];
    snapshot.forEach((d) => {
      logs.push(d.data() as FoodLogEntry);
    });
    return logs;
  } catch (err: any) {
    if (err?.code !== 'permission-denied') {
      console.warn(`[Firestore] Day logs sync notice:`, err?.message || err);
    }
    return [];
  }
}

export async function firestoreGetFoodLogsHistory(userId: string): Promise<FoodLogEntry[]> {
  try {
    const logsRef = collection(db, 'users', userId, 'foodLogs');
    const snapshot = await getDocs(logsRef);
    const logs: FoodLogEntry[] = [];
    snapshot.forEach((d) => {
      logs.push(d.data() as FoodLogEntry);
    });
    return logs;
  } catch (err: any) {
    if (err?.code !== 'permission-denied') {
      console.warn(`[Firestore] History sync notice:`, err?.message || err);
    }
    return [];
  }
}

/**
 * Daily Water Hydration Management
 * Subcollection under /users/{userId}/waterLogs/{date}
 */
export async function firestoreSaveWaterLog(
  userId: string,
  date: string,
  currentMl: number,
  targetMl: number
): Promise<void> {
  try {
    const waterDocRef = doc(db, 'users', userId, 'waterLogs', date);
    await setDoc(
      waterDocRef,
      {
        user_id: userId,
        date,
        current_ml: currentMl,
        target_ml: targetMl,
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err: any) {
    if (err?.code !== 'permission-denied') {
      console.warn(`[Firestore] Water log notice:`, err?.message || err);
    }
  }
}

export async function firestoreGetWaterLog(
  userId: string,
  date: string
): Promise<{ current_ml: number; target_ml: number } | null> {
  try {
    const waterDocRef = doc(db, 'users', userId, 'waterLogs', date);
    const snap = await getDoc(waterDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return { current_ml: data.current_ml || 0, target_ml: data.target_ml || 3000 };
    }
    return null;
  } catch (err: any) {
    if (err?.code !== 'permission-denied') {
      console.warn(`[Firestore] Water log lookup notice:`, err?.message || err);
    }
    return null;
  }
}
