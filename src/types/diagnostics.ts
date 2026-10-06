export type DiagnosticSample = {
  id: string;
  recordedAt: string;
  venueId: string;
  checkpointId?: string;
  floor: number;
  world: {x:number;y:number;z:number};
  venue: {x:number;y:number;z:number};
  trackingState?: string;
  distanceToRouteMeters?: number;
  distanceToNextWaypointMeters?: number;
  remainingDistanceMeters?: number;
  rerouteCount?: number;
  note?: string;
};

export type DiagnosticSession = {
  id: string;
  venueId: string;
  startedAt: string;
  endedAt?: string;
  samples: DiagnosticSample[];
};
