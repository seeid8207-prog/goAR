import type { VenuePointKind } from './navigation';

export type ARPosition = { x: number; y: number; z: number };
export type ARRotation = { x: number; y: number; z: number };

export type PersistentReferenceFrame = {
  id: string;
  venueId: string;
  checkpointId: string;
  origin: ARPosition;
  xAxis: ARPosition;
  yAxis: ARPosition;
  zAxis: ARPosition;
  createdAt: string;
  method: 'three-point-checkpoint' | 'image-marker-checkpoint' | 'arkit-world-map' | 'arcore-cloud-anchor';
  version: 1;
};

export type ARMappedPoint = {
  id: string;
  venueId: string;
  label: string;
  kind: VenuePointKind;
  floor: number;
  position: ARPosition;
  rotation: ARRotation;
  anchorId: string;
  section?: string;
  row?: string;
  seat?: string;
  createdAt: string;
  source: 'camera-heading' | 'world-anchor' | 'raycast';
  confidence?: number;
  hitType?: string;
};
