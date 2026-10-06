import type { PersistentReferenceFrame } from '../types/arMapping';
import type { NavigationSession, NavigationUpdate } from './navigationSession';
import { worldToVenue } from './referenceFrame';

export type CameraWorldPosition = { x: number; y: number; z: number };

export function updateNavigationFromCamera(
  session: NavigationSession,
  cameraWorld: CameraWorldPosition,
  floor: number,
  frame: PersistentReferenceFrame,
  nowMs = Date.now(),
): NavigationUpdate {
  const venue = worldToVenue(cameraWorld, frame);
  return session.update({ x: venue.x, y: venue.z, floor }, nowMs);
}
