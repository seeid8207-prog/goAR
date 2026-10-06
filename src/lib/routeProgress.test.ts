function assertEqual(actual: unknown, expected: unknown, message: string) {
  if (actual !== expected) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}
import { buildRouteSteps, findRoute } from './routeGraph';
import { calculateRouteProgress } from './routeProgress';
import { rerouteFromPosition } from './reroute';
import { buildARRouteOverlay } from './arRoute';
import { NavigationSession } from './navigationSession';
import { buildReferenceFrameFromThreePoints } from './calibration';
import { venueToWorld, worldToVenue } from './referenceFrame';
import { generateSeatRow } from './seatGenerator';
import { resolveTicketToSeat } from './ticketResolver';
import { can } from './accessControl';
import { appendDiagnosticSample, createDiagnosticSession, summarizeDiagnosticSession } from './diagnostics';
import type { SeatTarget } from '../types/navigation';
import type { EventTicket } from '../types/domain';
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

const sessionOffRoute = session.update({ x: 30, y: 10, floor: 0 }, 5000);
assertEqual(sessionOffRoute.rerouted, true, 'reroute on deviation');
assertEqual(sessionOffRoute.route[0].id, 'd', 'reroute starts from nearest graph node');
assertEqual(sessionOffRoute.overlay.waypoints[0]?.stepId, sessionOffRoute.steps[0]?.id, 'overlay uses replaced route');

const arrived = calculateRouteProgress({ x: 25.2, y: 20.2, floor: 1 }, steps);
assertEqual(arrived.hasArrived, true, 'arrival detection');
const arrivedOverlay = buildARRouteOverlay({ x: 25.2, y: 20.2, floor: 1 }, steps, arrived);
assertEqual(arrivedOverlay.instruction, 'You have arrived', 'arrival overlay');
assertEqual(arrivedOverlay.waypoints.length, 0, 'arrival hides route markers');

const frame = buildReferenceFrameFromThreePoints({
  venueId: 'demo',
  checkpointId: 'cp',
  origin: { x: 10, y: 1, z: -3 },
  positiveX: { x: 11, y: 1, z: -3 },
  positiveZ: { x: 10, y: 1, z: -2 },
});
const venuePoint = worldToVenue({ x: 12, y: 2, z: 1 }, frame);
const roundTrip = venueToWorld(venuePoint, frame);
assertEqual(Math.abs(roundTrip.x - 12) < 1e-6, true, 'frame round trip x');
assertEqual(Math.abs(roundTrip.y - 2) < 1e-6, true, 'frame round trip y');
assertEqual(Math.abs(roundTrip.z - 1) < 1e-6, true, 'frame round trip z');

const generated = generateSeatRow({
  venueId:'demo',floor:1,section:'104',row:'G',firstSeatNumber:1,seatCount:4,
  start:{x:0,y:3,z:0},end:{x:3,y:3,z:0},
});
assertEqual(generated.length,4,'seat row count');
assertEqual(generated[0].seat,'1','first generated seat');
assertEqual(generated[3].seat,'4','last generated seat');
assertEqual(generated[2].position.x,2,'seat interpolation');

const ticket:EventTicket={
  id:'t',eventId:'e',eventName:'Event',venueId:'demo',venueName:'Demo',
  section:'104',row:'G',seat:'18'
};
const ticketSeat:SeatTarget={
  id:'s',label:'Seat 18',x:0,y:0,floor:1,kind:'seat',section:'104',row:'G',seat:'18'
};
assertEqual(resolveTicketToSeat(ticket,[ticketSeat])?.id,'s','ticket resolves to mapped seat');
assertEqual(can('attendee','map-venue'),false,'attendee cannot map venue');
assertEqual(can('mapper','map-venue'),true,'mapper can map venue');
assertEqual(can('venue-admin','publish-venue'),true,'admin can publish venue');

let diagnostics=createDiagnosticSession('demo');
diagnostics=appendDiagnosticSample(diagnostics,{
  venueId:'demo',floor:0,world:{x:0,y:0,z:0},venue:{x:0,y:0,z:0},
  distanceToRouteMeters:1,distanceToNextWaypointMeters:4,remainingDistanceMeters:10,rerouteCount:0
});
diagnostics=appendDiagnosticSample(diagnostics,{
  venueId:'demo',floor:0,world:{x:1,y:0,z:0},venue:{x:1,y:0,z:0},
  distanceToRouteMeters:3,distanceToNextWaypointMeters:3,remainingDistanceMeters:9,rerouteCount:1
});
const diagnosticSummary=summarizeDiagnosticSession(diagnostics);
assertEqual(diagnosticSummary.samples,2,'diagnostic sample count');
assertEqual(diagnosticSummary.meanDistanceToRouteMeters,2,'diagnostic mean deviation');
assertEqual(diagnosticSummary.maxDistanceToRouteMeters,3,'diagnostic max deviation');
assertEqual(diagnosticSummary.reroutes,1,'diagnostic reroute count');

console.log('GoAR core tests passed');
