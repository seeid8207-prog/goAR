import type { ARRouteOverlay, ARWaypoint, ARWaypointKind } from '../types/arNavigation';
import type { RouteStep, VenuePoint } from '../types/navigation';
import type { Position2D, RouteProgress } from './routeProgress';
import { distanceMeters, shortestAngle } from './venueMath';

export type ARRouteOptions = {
  maxVisibleWaypoints?: number;
  maxRenderDistanceMeters?: number;
  floorHeightMeters?: number;
};

const DEFAULTS: Required<ARRouteOptions> = {
  maxVisibleWaypoints: 5,
  maxRenderDistanceMeters: 35,
  floorHeightMeters: 3.2,
};

function waypointKind(step: RouteStep, previousBearing?: number): ARWaypointKind {
  if (step.to.kind === 'stairs') return 'stairs';
  if (step.to.kind === 'lift') return 'lift';
  if (step.to.kind === 'section') return 'section';
  if (step.to.kind === 'row') return 'row';
  if (step.to.kind === 'seat') return 'seat';

  if (previousBearing == null) return 'forward';
  const delta = shortestAngle(previousBearing, step.bearingDeg);
  if (Math.abs(delta) < 25) return 'forward';
  if (Math.abs(delta) > 155) return 'turn-around';
  return delta > 0 ? 'turn-right' : 'turn-left';
}

function venuePointToSpatial(point: VenuePoint, floorHeightMeters: number) {
  // Navigation graph coordinates are x/y on the floor plan. Persistent AR venue
  // coordinates are x/y/z, where Y is vertical and graph Y maps to venue Z.
  return {
    x: point.x,
    y: point.floor * floorHeightMeters,
    z: point.y,
  };
}

export function buildARRouteOverlay(
  position: Position2D,
  steps: RouteStep[],
  progress: RouteProgress,
  options: ARRouteOptions = {},
): ARRouteOverlay {
  const config = { ...DEFAULTS, ...options };

  if (!progress.activeStep || progress.hasArrived) {
    return {
      instruction: progress.hasArrived ? 'You have arrived' : 'Route unavailable',
      nextWaypoint: null,
      waypoints: [],
      distanceToNextWaypointMeters: progress.distanceToNextWaypointMeters,
      remainingDistanceMeters: progress.remainingDistanceMeters,
      isOffRoute: progress.isOffRoute,
      hasArrived: progress.hasArrived,
    };
  }

  const visible: ARWaypoint[] = [];
  const startIndex = progress.activeStepIndex;
  let previousBearing = startIndex > 0 ? steps[startIndex - 1].bearingDeg : undefined;

  for (let index = startIndex; index < steps.length && visible.length < config.maxVisibleWaypoints; index += 1) {
    const step = steps[index];
    if (step.to.floor !== position.floor && step.from.floor !== position.floor) continue;

    const distance = step.to.floor === position.floor
      ? distanceMeters(position.x, position.y, step.to.x, step.to.y)
      : step.distanceMeters;

    if (distance > config.maxRenderDistanceMeters && index !== startIndex) continue;

    visible.push({
      id: `ar-${step.id}`,
      stepId: step.id,
      label: step.to.label,
      kind: waypointKind(step, previousBearing),
      floor: step.to.floor,
      venuePosition: venuePointToSpatial(step.to, config.floorHeightMeters),
      distanceFromUserMeters: distance,
      isActive: index === startIndex,
      sequence: index - startIndex,
    });

    previousBearing = step.bearingDeg;
  }

  return {
    instruction: progress.isOffRoute ? 'Off route — recalculating' : progress.activeStep.instruction,
    nextWaypoint: visible[0] ?? null,
    waypoints: visible,
    distanceToNextWaypointMeters: progress.distanceToNextWaypointMeters,
    remainingDistanceMeters: progress.remainingDistanceMeters,
    isOffRoute: progress.isOffRoute,
    hasArrived: progress.hasArrived,
  };
}
