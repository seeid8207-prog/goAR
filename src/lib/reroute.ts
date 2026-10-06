import type { RouteEdge, RouteOptions, RouteStep, VenuePoint } from '../types/navigation';
import { buildRouteSteps, findRoute } from './routeGraph';
import { distanceMeters } from './venueMath';
import type { Position2D } from './routeProgress';

export type RerouteResult = {
  route: VenuePoint[];
  steps: RouteStep[];
  startNode: VenuePoint | null;
};

export function findNearestGraphNode(position: Position2D, points: VenuePoint[]): VenuePoint | null {
  let best: VenuePoint | null = null;
  let bestDistance = Infinity;

  for (const point of points) {
    if (point.floor !== position.floor) continue;
    if (point.kind === 'seat' || point.kind === 'row') continue;
    const distance = distanceMeters(position.x, position.y, point.x, point.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = point;
    }
  }
  return best;
}

export function rerouteFromPosition(
  position: Position2D,
  destinationId: string,
  points: VenuePoint[],
  edges: RouteEdge[],
  options: RouteOptions = {},
): RerouteResult {
  const startNode = findNearestGraphNode(position, points);
  if (!startNode) return { route: [], steps: [], startNode: null };

  const route = findRoute(points, edges, startNode.id, destinationId, options);
  return { route, steps: buildRouteSteps(route), startNode };
}
