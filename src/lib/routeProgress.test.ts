function assertEqual(actual: unknown, expected: unknown, message: string) {
  if (actual !== expected) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}
import { buildRouteSteps, findRoute } from './routeGraph';
import { calculateRouteProgress } from './routeProgress';
import { rerouteFromPosition } from './reroute';
import { buildARRouteOverlay } from './arRoute';
import { NavigationSession } from './navigationSession';
import type { RouteEdge, VenuePoint } from '../types/navigation';

const points: VenuePoint[] = [
  { id: 'a', label: 'A', x: 0, y: 0, floor: 0, kind: 'checkpoint' },
  { id: 'b', label: 'B', x: 10, y: 0, floor: 0, kind: 'junction' },
  { id: 'c', label: 'C', x: 20, y: 0, floor: 0, kind: 'junction' },
  { id: 'd', label: 'D', x: 20, y: 10, floor: 0, kind: 'junction' },
  { id: 'lift0', label: 'Lift', x: 20, y: 20, floor: 0, kind: 'lift' },
  { id: 'lift1', label: 'Lift L1', x: 20, y: 20, floor: 1, kind: 'lift' },
  { id: 'seat', label: 'Seat G18', x: 25, y: 20, floor: 1, kind: 'seat' },
];

const edges: RouteEdge[] = [
  { from: 'a', to: 'b', accessible: true },
  { from: 'b', to: 'c', accessible: true },
  { from: 'c', to: 'd', accessible: true },
  { from: 'd', to: 'lift0', accessible: true },
  { from: 'lift0', to: 'lift1', distance: 4, accessible: true },
  { from: 'lift1', to: 'seat', accessible: true },
];

const route = findRoute(points, edges, 'a', 'seat', { accessibleOnly: true });
const steps = buildRouteSteps(route);

assertEqual(route.at(-1)?.id, 'seat', 'route destination');

const onRoute = calculateRouteProgress({ x: 5, y: 0.4, floor: 0 }, steps);
assertEqual(onRoute.isOffRoute, false, 'on-route detection');
assertEqual(onRoute.activeStep?.to.id, 'b', 'active waypoint');

const overlay = buildARRouteOverlay({ x: 5, y: 0.4, floor: 0 }, steps, onRoute, { maxVisibleWaypoints: 3 });
assertEqual(overlay.nextWaypoint?.label, 'B', 'AR next waypoint');
assertEqual(overlay.waypoints.length, 3, 'AR waypoint window');
assertEqual(overlay.waypoints[0].isActive, true, 'AR active waypoint');

const advanced = calculateRouteProgress({ x: 9.2, y: 0, floor: 0 }, steps);
assertEqual(advanced.activeStep?.to.id, 'c', 'waypoint advancement');

const offRoute = calculateRouteProgress({ x: 5, y: 8, floor: 0 }, steps);
assertEqual(offRoute.isOffRoute, true, 'off-route detection');

const reroute = rerouteFromPosition({ x: 19.5, y: 1, floor: 0 }, 'seat', points, edges, { accessibleOnly: true });
assertEqual(reroute.startNode?.id, 'c', 'reroute nearest node');
assertEqual(reroute.route.at(-1)?.id, 'seat', 'reroute destination');

const session = new NavigationSession(points, edges, 'seat', { accessibleOnly: true }, {
  offRouteThresholdMeters: 3,
  rerouteCooldownMs: 3000,
});
session.start('a');
const sessionOnRoute = session.update({ x: 2, y: 0.1, floor: 0 }, 1000);
assertEqual(sessionOnRoute.rerouted, false, 'no reroute while on route');

const sessionOffRoute = session.update({ x: 20, y: 8, floor: 0 }, 5000);
assertEqual(sessionOffRoute.rerouted, true, 'reroute on deviation');
assertEqual(sessionOffRoute.route[0].id, 'd', 'reroute starts from nearest graph node');
assertEqual(sessionOffRoute.overlay.waypoints[0]?.stepId, sessionOffRoute.steps[0]?.id, 'overlay uses replaced route');

const arrived = calculateRouteProgress({ x: 25.2, y: 20.2, floor: 1 }, steps);
assertEqual(arrived.hasArrived, true, 'arrival detection');
const arrivedOverlay = buildARRouteOverlay({ x: 25.2, y: 20.2, floor: 1 }, steps, arrived);
assertEqual(arrivedOverlay.instruction, 'You have arrived', 'arrival overlay');
assertEqual(arrivedOverlay.waypoints.length, 0, 'arrival hides route markers');

console.log('route progress and AR overlay tests passed');
