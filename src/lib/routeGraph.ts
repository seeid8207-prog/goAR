import type { RouteEdge, RouteOptions, RouteStep, VenuePoint } from '../types/navigation';
import { bearingDeg, distanceMeters, shortestAngle, turnInstruction } from './venueMath';

type QueueItem = { id: string; distance: number };

export function findRoute(points: VenuePoint[], edges: RouteEdge[], startId: string, endId: string, options: RouteOptions = {}): VenuePoint[] {
  const byId = new Map(points.map((point) => [point.id, point]));
  if (!byId.has(startId) || !byId.has(endId)) return [];

  const adjacency = new Map<string, Array<{ id: string; weight: number }>>();
  const add = (from: string, to: string, weight: number) => {
    const list = adjacency.get(from) ?? [];
    list.push({ id: to, weight });
    adjacency.set(from, list);
  };

  for (const edge of edges) {
    if (options.accessibleOnly && edge.accessible === false) continue;
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    if (!from || !to) continue;
    const verticalPenalty = from.floor === to.floor ? 0 : 4;
    const weight = edge.distance ?? (distanceMeters(from.x, from.y, to.x, to.y) + verticalPenalty);
    add(edge.from, edge.to, weight);
    add(edge.to, edge.from, weight);
  }

  const distances = new Map<string, number>();
  const previous = new Map<string, string>();
  const queue: QueueItem[] = [];
  for (const point of points) distances.set(point.id, Infinity);
  distances.set(startId, 0);
  queue.push({ id: startId, distance: 0 });

  while (queue.length) {
    queue.sort((a, b) => a.distance - b.distance);
    const current = queue.shift()!;
    if (current.id === endId) break;
    if (current.distance !== distances.get(current.id)) continue;

    for (const neighbor of adjacency.get(current.id) ?? []) {
      const nextDistance = current.distance + neighbor.weight;
      if (nextDistance < (distances.get(neighbor.id) ?? Infinity)) {
        distances.set(neighbor.id, nextDistance);
        previous.set(neighbor.id, current.id);
        queue.push({ id: neighbor.id, distance: nextDistance });
      }
    }
  }

  if (startId !== endId && !previous.has(endId)) return [];
  const ids = [endId];
  while (ids[0] !== startId) {
    const prev = previous.get(ids[0]);
    if (!prev) return [];
    ids.unshift(prev);
  }
  return ids.map((id) => byId.get(id)!).filter(Boolean);
}

export function buildRouteSteps(route: VenuePoint[], initialHeading = 0): RouteStep[] {
  let heading = initialHeading;
  return route.slice(0, -1).map((from, index) => {
    const to = route[index + 1];
    const bearing = bearingDeg(from.x, from.y, to.x, to.y);
    const delta = shortestAngle(heading, bearing);
    let instruction = `${turnInstruction(delta)} toward ${to.label}`;
    if (to.kind === 'stairs') instruction = `Take the stairs toward ${to.label}`;
    if (to.kind === 'lift' && to.floor !== from.floor) instruction = `Take ${to.label} to level ${to.floor}`;
    else if (to.kind === 'lift') instruction = `Continue to ${to.label}`;
    if (to.kind === 'section') instruction = `Enter ${to.label}`;
    if (to.kind === 'row') instruction = `Continue to ${to.label}`;
    if (to.kind === 'seat') instruction = `Your ${to.label} is ahead`;
    if (to.kind === 'amenity') instruction = `Continue to ${to.label}`;
    heading = bearing;

    return {
      id: `${from.id}-${to.id}`,
      from,
      to,
      distanceMeters: distanceMeters(from.x, from.y, to.x, to.y),
      bearingDeg: bearing,
      instruction,
    };
  });
}

export function totalRouteDistance(steps: RouteStep[]) {
  return steps.reduce((sum, step) => sum + step.distanceMeters, 0);
}
