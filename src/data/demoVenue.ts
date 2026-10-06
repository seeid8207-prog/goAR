import type { Checkpoint, RouteEdge, SeatTarget, VenueDefinition, VenuePoint } from '../types/navigation';

export const DEMO_VENUE = {
  id: 'demo-stadium',
  name: 'Demo Stadium',
  center: { latitude: -26.2041, longitude: 28.0473 },
  widthMeters: 90,
  heightMeters: 65,
  floors: [0, 1],
};

export const checkpoint: Checkpoint = {
  id: 'cp-gate-a',
  label: 'Gate A checkpoint',
  x: 4,
  y: 6,
  floor: 0,
  kind: 'checkpoint',
  qrValue: 'SEATNAV:demo-stadium:cp-gate-a',
  headingDeg: 90,
};

export const seatTarget: SeatTarget = {
  id: 'seat-104-g-18',
  label: 'Seat 18',
  x: 74,
  y: 51,
  floor: 1,
  kind: 'seat',
  section: '104',
  row: 'G',
  seat: '18',
};

export const points: VenuePoint[] = [
  checkpoint,
  { id: 'gate-a', label: 'Gate A', x: 4, y: 6, floor: 0, kind: 'entrance' },
  { id: 'junction-a', label: 'Main concourse', x: 24, y: 6, floor: 0, kind: 'junction' },
  { id: 'junction-b', label: 'East concourse', x: 41, y: 20, floor: 0, kind: 'junction' },
  { id: 'stairs-104', label: 'Section 104 stairs', x: 48, y: 34, floor: 0, kind: 'stairs' },
  { id: 'lift-east', label: 'East lift', x: 38, y: 34, floor: 0, kind: 'lift' },
  { id: 'lift-east-l1', label: 'East lift · Level 1', x: 38, y: 34, floor: 1, kind: 'lift' },
  { id: 'section-104', label: 'Section 104', x: 58, y: 43, floor: 1, kind: 'section' },
  { id: 'row-g', label: 'Row G', x: 68, y: 48, floor: 1, kind: 'row' },
  seatTarget,
  { id: 'toilet-east', label: 'East toilets', x: 31, y: 15, floor: 0, kind: 'amenity', amenityType: 'toilet' },
  { id: 'food-east', label: 'Food court', x: 31, y: 25, floor: 0, kind: 'amenity', amenityType: 'food' },
  { id: 'first-aid', label: 'First aid', x: 17, y: 18, floor: 0, kind: 'amenity', amenityType: 'first-aid' },
  { id: 'exit-east', label: 'East exit', x: 86, y: 18, floor: 0, kind: 'amenity', amenityType: 'exit' },
];

export const edges: RouteEdge[] = [
  { from: 'cp-gate-a', to: 'junction-a', accessible: true },
  { from: 'junction-a', to: 'junction-b', accessible: true },
  { from: 'junction-a', to: 'toilet-east', accessible: true },
  { from: 'toilet-east', to: 'food-east', accessible: true },
  { from: 'junction-b', to: 'food-east', accessible: true },
  { from: 'junction-b', to: 'stairs-104', accessible: false },
  { from: 'stairs-104', to: 'section-104', accessible: false },
  { from: 'junction-b', to: 'lift-east', accessible: true },
  { from: 'lift-east', to: 'lift-east-l1', distance: 4, accessible: true },
  { from: 'lift-east-l1', to: 'section-104', accessible: true },
  { from: 'section-104', to: 'row-g', accessible: true },
  { from: 'row-g', to: 'seat-104-g-18', accessible: true },
  { from: 'junction-b', to: 'exit-east', accessible: true },
  { from: 'junction-a', to: 'first-aid', accessible: true },
];

export const venueDefinition: VenueDefinition = {
  ...DEMO_VENUE,
  points,
  edges,
};
