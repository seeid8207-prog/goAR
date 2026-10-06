import type { ARPosition, PersistentReferenceFrame } from './arMapping';

export type VenueCheckpointDefinition = {
  id: string;
  venueId: string;
  label: string;
  floor: number;
  qrValue: string;
  venuePosition: ARPosition;
  markerWidthMeters?: number;
};

export type ObservedCheckpointPose = {
  checkpointId: string;
  worldPosition: ARPosition;
  confidence: number;
  observedAt: string;
};

export type FrameCorrection = {
  checkpointId: string;
  previousOrigin: ARPosition;
  correctedOrigin: ARPosition;
  driftMeters: number;
  confidence: number;
  frame: PersistentReferenceFrame;
};
