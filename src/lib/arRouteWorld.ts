import type { ARRouteOverlay, ARWaypoint } from '../types/arNavigation';

export type ARWorldPosition = { x: number; y: number; z: number };

export type WorldARWaypoint = ARWaypoint & {
  worldPosition: ARWorldPosition;
};

export type WorldARRouteOverlay = Omit<ARRouteOverlay, 'nextWaypoint' | 'waypoints'> & {
  nextWaypoint: WorldARWaypoint | null;
  waypoints: WorldARWaypoint[];
};

export function projectARRouteToWorld(
  overlay: ARRouteOverlay,
  venueToWorld: (position: ARWorldPosition) => ARWorldPosition,
): WorldARRouteOverlay {
  const waypoints = overlay.waypoints.map((waypoint) => ({
    ...waypoint,
    worldPosition: venueToWorld(waypoint.venuePosition),
  }));

  return {
    ...overlay,
    waypoints,
    nextWaypoint: waypoints.find((waypoint) => waypoint.isActive) ?? waypoints[0] ?? null,
  };
}
