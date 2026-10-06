export type LatLng = { latitude: number; longitude: number };

export type VenuePointKind =
  | 'entrance'
  | 'checkpoint'
  | 'junction'
  | 'stairs'
  | 'lift'
  | 'section'
  | 'row'
  | 'seat'
  | 'amenity';

export type AmenityType = 'toilet' | 'food' | 'first-aid' | 'exit' | 'parking' | 'info';

export type VenuePoint = {
  id: string;
  label: string;
  x: number;
  y: number;
  floor: number;
  kind: VenuePointKind;
  amenityType?: AmenityType;
};

export type SeatTarget = VenuePoint & {
  kind: 'seat';
  section: string;
  row: string;
  seat: string;
};

export type Checkpoint = VenuePoint & {
  kind: 'checkpoint';
  qrValue: string;
  headingDeg: number;
};

export type RouteEdge = {
  from: string;
  to: string;
  distance?: number;
  accessible?: boolean;
};

export type RouteOptions = {
  accessibleOnly?: boolean;
};

export type RouteStep = {
  id: string;
  from: VenuePoint;
  to: VenuePoint;
  distanceMeters: number;
  bearingDeg: number;
  instruction: string;
};

export type VenueDefinition = {
  id: string;
  name: string;
  center: LatLng;
  widthMeters: number;
  heightMeters: number;
  floors: number[];
  points: VenuePoint[];
  edges: RouteEdge[];
};
