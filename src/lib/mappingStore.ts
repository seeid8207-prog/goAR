import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MappingDataset, MappingPoint } from '../types/venueMapping';

const key = (venueId: string) => `goar:mapping:${venueId}:v1`;

export async function loadMapping(venueId: string): Promise<MappingDataset> {
  const raw = await AsyncStorage.getItem(key(venueId));
  if (!raw) return { venueId, version: 1, updatedAt: new Date(0).toISOString(), points: [] };
  return JSON.parse(raw);
}

export async function saveMapping(dataset: MappingDataset) {
  await AsyncStorage.setItem(key(dataset.venueId), JSON.stringify({ ...dataset, updatedAt: new Date().toISOString() }));
}

export async function upsertMappingPoints(venueId: string, points: MappingPoint[]) {
  const current = await loadMapping(venueId);
  const byId = new Map(current.points.map((point) => [point.id, point]));
  for (const point of points) byId.set(point.id, point);
  const next: MappingDataset = {
    venueId,
    version: 1,
    updatedAt: new Date().toISOString(),
    points: [...byId.values()],
  };
  await saveMapping(next);
  return next;
}

export async function deleteMappingPoint(venueId: string, pointId: string) {
  const current = await loadMapping(venueId);
  const next = { ...current, points: current.points.filter((point) => point.id !== pointId) };
  await saveMapping(next);
  return next;
}
