import type { ARPosition, ARRotation, PersistentReferenceFrame } from './arMapping';

export type VenueCheckpointDefinition = {
  id: string;
  venueId: string;
  label: string;
  floor: number;
  qrValue: string;
  venuePosition: ARPosition;
  venueYawDeg?: number;
  markerWidthMeters?: number;
};

export type ObservedCheckpointPose = {
  checkpointId: string;
  worldPosition: ARPosition;
  worldRotation?: ARRotation;
  confidence: number;
  observedAt: string;
};

export type FrameCorrection = {
  checkpointId: string;
  previousOrigin: ARPosition;
  correctedOrigin: ARPosition;
  driftMeters: number;
  yawDriftDeg: number;
  confidence: number;
  frame: PersistentReferenceFrame;
};
