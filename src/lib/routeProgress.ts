import type { RouteStep, VenuePoint } from '../types/navigation';
import { distanceMeters } from './venueMath';

export type Position2D = { x: number; y: number; floor: number };

export type RouteProgressOptions = {
  waypointRadiusMeters?: number;
  arrivalRadiusMeters?: number;
  offRouteThresholdMeters?: number;
};

export type RouteProgress = {
  activeStepIndex: number;
  activeStep: RouteStep | null;
  distanceToRouteMeters: number;
  distanceToNextWaypointMeters: number;
  remainingDistanceMeters: number;
  isOffRoute: boolean;
  hasArrived: boolean;
  nearestRoutePoint: Position2D | null;
};

const DEFAULTS: Required<RouteProgressOptions> = {
  waypointRadiusMeters: 1.8,
  arrivalRadiusMeters: 1.4,
  offRouteThresholdMeters: 4,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function nearestPointOnSegment(position: Position2D, from: VenuePoint, to: VenuePoint) {
  if (position.floor !== from.floor || from.floor !== to.floor) {
    const fromDistance = position.floor === from.floor
      ? distanceMeters(position.x, position.y, from.x, from.y)
      : Infinity;
    const toDistance = position.floor === to.floor
      ? distanceMeters(position.x, position.y, to.x, to.y)
      : Infinity;
    if (fromDistance <= toDistance) {
      return { point: { x: from.x, y: from.y, floor: from.floor }, distance: fromDistance, t: 0 };
    }
    return { point: { x: to.x, y: to.y, floor: to.floor }, distance: toDistance, t: 1 };
  }

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared < 1e-8) {
    return {
      point: { x: from.x, y: from.y, floor: from.floor },
      distance: distanceMeters(position.x, position.y, from.x, from.y),
      t: 0,
    };
  }

  const t = clamp(((position.x - from.x) * dx + (position.y - from.y) * dy) / lengthSquared, 0, 1);
  const point = { x: from.x + dx * t, y: from.y + dy * t, floor: from.floor };
  return { point, distance: distanceMeters(position.x, position.y, point.x, point.y), t };
}

export function calculateRouteProgress(position: Position2D, steps: RouteStep[], options: RouteProgressOptions = {}): RouteProgress {
  const config = { ...DEFAULTS, ...options };
  if (!steps.length) {
    return {
      activeStepIndex: 0,
      activeStep: null,
      distanceToRouteMeters: Infinity,
      distanceToNextWaypointMeters: Infinity,
      remainingDistanceMeters: 0,
      isOffRoute: true,
      hasArrived: false,
      nearestRoutePoint: null,
    };
  }

  const destination = steps[steps.length - 1].to;
  const destinationDistance = position.floor === destination.floor
    ? distanceMeters(position.x, position.y, destination.x, destination.y)
    : Infinity;

  if (destinationDistance <= config.arrivalRadiusMeters) {
    return {
      activeStepIndex: steps.length - 1,
      activeStep: steps[steps.length - 1],
      distanceToRouteMeters: destinationDistance,
      distanceToNextWaypointMeters: destinationDistance,
      remainingDistanceMeters: destinationDistance,
      isOffRoute: false,
      hasArrived: true,
      nearestRoutePoint: { x: destination.x, y: destination.y, floor: destination.floor },
    };
  }

  let bestIndex = 0;
  let bestDistance = Infinity;
  let bestT = 0;
  let bestPoint: Position2D | null = null;

  steps.forEach((step, index) => {
    const nearest = nearestPointOnSegment(position, step.from, step.to);
    if (nearest.distance < bestDistance) {
      bestIndex = index;
      bestDistance = nearest.distance;
      bestT = nearest.t;
      bestPoint = nearest.point;
    }
  });

  let activeStepIndex = bestIndex;
  const closestStep = steps[bestIndex];
  const distanceToClosestStepEnd = position.floor === closestStep.to.floor
    ? distanceMeters(position.x, position.y, closestStep.to.x, closestStep.to.y)
    : Infinity;

  if (distanceToClosestStepEnd <= config.waypointRadiusMeters && bestIndex < steps.length - 1) {
    activeStepIndex = bestIndex + 1;
  }

  const activeStep = steps[activeStepIndex];
  const distanceToNextWaypointMeters = position.floor === activeStep.to.floor
    ? distanceMeters(position.x, position.y, activeStep.to.x, activeStep.to.y)
    : activeStep.distanceMeters;

  let remainingDistanceMeters = 0;
  if (activeStepIndex === bestIndex) {
    remainingDistanceMeters += activeStep.distanceMeters * (1 - bestT);
    for (let i = activeStepIndex + 1; i < steps.length; i += 1) remainingDistanceMeters += steps[i].distanceMeters;
  } else {
    remainingDistanceMeters = distanceToNextWaypointMeters;
    for (let i = activeStepIndex + 1; i < steps.length; i += 1) remainingDistanceMeters += steps[i].distanceMeters;
  }

  return {
    activeStepIndex,
    activeStep,
    distanceToRouteMeters: bestDistance,
    distanceToNextWaypointMeters,
    remainingDistanceMeters,
    isOffRoute: bestDistance > config.offRouteThresholdMeters,
    hasArrived: false,
    nearestRoutePoint: bestPoint,
  };
}

export function findNearestRouteNode(position: Position2D, route: VenuePoint[]): VenuePoint | null {
  let nearest: VenuePoint | null = null;
  let nearestDistance = Infinity;
  for (const point of route) {
    if (point.floor !== position.floor) continue;
    const distance = distanceMeters(position.x, position.y, point.x, point.y);
    if (distance < nearestDistance) {
      nearest = point;
      nearestDistance = distance;
    }
  }
  return nearest;
}
