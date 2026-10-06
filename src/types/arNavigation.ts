export type ARWaypointKind =
  | 'forward'
  | 'turn-left'
  | 'turn-right'
  | 'turn-around'
  | 'stairs'
  | 'lift'
  | 'section'
  | 'row'
  | 'seat'
  | 'destination';

export type ARWaypoint = {
  id: string;
  stepId: string;
  label: string;
  kind: ARWaypointKind;
  floor: number;
  venuePosition: { x: number; y: number; z: number };
  distanceFromUserMeters: number;
  isActive: boolean;
  sequence: number;
};

export type ARRouteOverlay = {
  instruction: string;
  nextWaypoint: ARWaypoint | null;
  waypoints: ARWaypoint[];
  distanceToNextWaypointMeters: number;
  remainingDistanceMeters: number;
  isOffRoute: boolean;
  hasArrived: boolean;
};
