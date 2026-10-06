import type { ARPosition } from './arMapping';
import type { VenuePointKind } from './navigation';

export type MappingPoint = {
  id: string;
  venueId: string;
  label: string;
  kind: VenuePointKind;
  floor: number;
  position: ARPosition;
  section?: string;
  row?: string;
  seat?: string;
  confidence?: number;
  hitType?: string;
};

export type SeatRowDraft = {
  venueId: string;
  floor: number;
  section: string;
  row: string;
  firstSeatNumber: number;
  seatCount: number;
  start: ARPosition;
  end: ARPosition;
};

export type MappingDataset = {
  venueId: string;
  version: 1;
  updatedAt: string;
  points: MappingPoint[];
};
