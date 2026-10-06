function assertEqual(actual: unknown, expected: unknown, message: string) {
  if (actual !== expected) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}
import { buildRouteSteps, findRoute } from './routeGraph';
import { calculateRouteProgress } from './routeProgress';
import { rerouteFromPosition } from './reroute';
import type { RouteEdge, VenuePoint } from '../types/navigation';

const points: VenuePoint[] = [
  { id: 'a', label: 'A', x: 0, y: 0, floor: 0, kind: 'checkpoint' },
  { id: 'b', label: 'B', x: 10, y: 0, floor: 0, kind: 'junction' },
  { id: 'c', label: 'C', x: 20, y: 0, floor: 0, kind: 'junction' },
  { id: 'lift0', label: 'Lift', x: 20, y: 10, floor: 0, kind: 'lift' },
  { id: 'lift1', label: 'Lift L1', x: 20, y: 10, floor: 1, kind: 'lift' },
  { id: 'seat', label: 'Seat G18', x: 25, y: 10, floor: 1, kind: 'seat' },
];

const edges: RouteEdge[] = [
  { from: 'a', to: 'b', accessible: true },
  { from: 'b', to: 'c', accessible: true },
  { from: 'c', to: 'lift0', accessible: true },
  { from: 'lift0', to: 'lift1', distance: 4, accessible: true },
  { from: 'lift1', to: 'seat', accessible: true },
];

const route = findRoute(points, edges, 'a', 'seat', { accessibleOnly: true });
const steps = buildRouteSteps(route);

assertEqual(route.at(-1)?.id, 'seat', 'route destination');

const onRoute = calculateRouteProgress({ x: 5, y: 0.4, floor: 0 }, steps);
assertEqual(onRoute.isOffRoute, false, 'on-route detection');
assertEqual(onRoute.activeStep?.to.id, 'b', 'active waypoint');

const advanced = calculateRouteProgress({ x: 9.2, y: 0, floor: 0 }, steps);
assertEqual(advanced.activeStep?.to.id, 'c', 'waypoint advancement');

const offRoute = calculateRouteProgress({ x: 5, y: 8, floor: 0 }, steps);
assertEqual(offRoute.isOffRoute, true, 'off-route detection');

const reroute = rerouteFromPosition({ x: 19.5, y: 1, floor: 0 }, 'seat', points, edges, { accessibleOnly: true });
assertEqual(reroute.startNode?.id, 'c', 'reroute nearest node');
assertEqual(reroute.route.at(-1)?.id, 'seat', 'reroute destination');

const arrived = calculateRouteProgress({ x: 25.2, y: 10.2, floor: 1 }, steps);
assertEqual(arrived.hasArrived, true, 'arrival detection');

console.log('route progress tests passed');
