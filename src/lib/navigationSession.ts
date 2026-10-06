import type { ARRouteOverlay } from '../types/arNavigation';
import type { RouteEdge, RouteOptions, RouteStep, VenuePoint } from '../types/navigation';
import { buildARRouteOverlay } from './arRoute';
import { buildRouteSteps, findRoute } from './routeGraph';
import { calculateRouteProgress, type Position2D, type RouteProgressOptions } from './routeProgress';
import { rerouteFromPosition } from './reroute';

export type NavigationSessionConfig = RouteProgressOptions & {
  rerouteCooldownMs?: number;
};

export type NavigationUpdate = {
  route: VenuePoint[];
  steps: RouteStep[];
  overlay: ARRouteOverlay;
  rerouted: boolean;
};

export class NavigationSession {
  private route: VenuePoint[] = [];
  private steps: RouteStep[] = [];
  private lastRerouteAt = -Infinity;

  constructor(
    private readonly points: VenuePoint[],
    private readonly edges: RouteEdge[],
    private readonly destinationId: string,
    private readonly routeOptions: RouteOptions = {},
    private readonly config: NavigationSessionConfig = {},
  ) {}

  start(startId: string) {
    this.route = findRoute(this.points, this.edges, startId, this.destinationId, this.routeOptions);
    this.steps = buildRouteSteps(this.route);
    return { route: this.route, steps: this.steps };
  }

  update(position: Position2D, nowMs = Date.now()): NavigationUpdate {
    let progress = calculateRouteProgress(position, this.steps, this.config);
    let rerouted = false;
    const cooldown = this.config.rerouteCooldownMs ?? 3000;

    if (progress.isOffRoute && nowMs - this.lastRerouteAt >= cooldown) {
      const next = rerouteFromPosition(
        position,
        this.destinationId,
        this.points,
        this.edges,
        this.routeOptions,
      );

      if (next.steps.length) {
        this.route = next.route;
        this.steps = next.steps;
        this.lastRerouteAt = nowMs;
        progress = calculateRouteProgress(position, this.steps, this.config);
        rerouted = true;
      }
    }

    return {
      route: this.route,
      steps: this.steps,
      overlay: buildARRouteOverlay(position, this.steps, progress),
      rerouted,
    };
  }

  getRoute() {
    return this.route;
  }

  getSteps() {
    return this.steps;
  }
}
