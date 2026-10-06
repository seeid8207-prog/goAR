import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersistentReferenceFrame } from '../types/arMapping';

const key = (venueId: string) => `goar:reference-frame:${venueId}:v1`;

export async function saveReferenceFrame(frame: PersistentReferenceFrame) {
  await AsyncStorage.setItem(key(frame.venueId), JSON.stringify(frame));
}

export async function loadReferenceFrame(venueId: string): Promise<PersistentReferenceFrame | null> {
  try {
    const value = await AsyncStorage.getItem(key(venueId));
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export async function clearReferenceFrame(venueId: string) {
  await AsyncStorage.removeItem(key(venueId));
}
