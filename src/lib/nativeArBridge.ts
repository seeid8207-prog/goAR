import type { ARPosition, ARRotation } from '../types/arMapping';

export type NativeRaycastPlacement = {
  position: ARPosition;
  rotation: ARRotation;
  confidence: number;
  hitType: string;
};

type RaycastHandler = () => Promise<NativeRaycastPlacement | null>;
let raycastHandler: RaycastHandler | null = null;

export function registerNativeRaycastHandler(handler: RaycastHandler | null) {
  raycastHandler = handler;
}

export async function requestNativeCenterRaycast() {
  if (!raycastHandler) return null;
  return raycastHandler();
}
