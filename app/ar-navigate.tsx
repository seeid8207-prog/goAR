import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RouteARScene from '../src/components/RouteARScene';
import { DEMO_VENUE, checkpoint, edges, points, seatTarget } from '../src/data/demoVenue';
import { projectARRouteToWorld, type WorldARRouteOverlay } from '../src/lib/arRouteWorld';
import { NavigationSession } from '../src/lib/navigationSession';
import { updateNavigationFromCamera } from '../src/lib/navigationRuntime';
import { venueToWorld } from '../src/lib/referenceFrame';
import { loadReferenceFrame } from '../src/lib/referenceFrameStore';
import type { PersistentReferenceFrame } from '../src/types/arMapping';

const EMPTY_OVERLAY: WorldARRouteOverlay = {
  instruction: 'Localizing route…',
  nextWaypoint: null,
  waypoints: [],
  distanceToNextWaypointMeters: 0,
  remainingDistanceMeters: 0,
  isOffRoute: false,
  hasArrived: false,
};

export default function ARNavigateScreen() {
  const [frame, setFrame] = useState<PersistentReferenceFrame | null>(null);
  const [tracking, setTracking] = useState('initializing');
  const [overlay, setOverlay] = useState<WorldARRouteOverlay>(EMPTY_OVERLAY);
  const [rerouteCount, setRerouteCount] = useState(0);
  const floorRef = useRef(checkpoint.floor);
  const lastUpdateAt = useRef(0);

  const session = useMemo(
    () =>
      new NavigationSession(points, edges, seatTarget.id, {}, {
        waypointRadiusMeters: 1.8,
        arrivalRadiusMeters: 1.4,
        offRouteThresholdMeters: 4,
        rerouteCooldownMs: 3000,
      }),
    [],
  );

  useEffect(() => {
    session.start(checkpoint.id);
    loadReferenceFrame(DEMO_VENUE.id).then(setFrame);
  }, [session]);

  if (!frame) {
    return (
      <SafeAreaView style={styles.empty}>
        <Text style={styles.emptyTitle}>Venue localization required</Text>
        <Text style={styles.emptyCopy}>
          Scan a GoAR venue checkpoint first so route coordinates can be aligned with the real venue.
        </Text>
        <TouchableOpacity style={styles.primary} onPress={() => router.back()}>
          <Text style={styles.primaryText}>Back to localization</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <ViroARSceneNavigator
        autofocus
        initialScene={{ scene: RouteARScene }}
        viroAppProps={{
          waypoints: overlay.waypoints,
          onTrackingState: setTracking,
          onCameraTransform: (transform: any) => {
            const now = Date.now();
            if (now - lastUpdateAt.current < 120) return;
            lastUpdateAt.current = now;

            const [x, y, z] = transform.position;
            const update = updateNavigationFromCamera(
              session,
              { x, y, z },
              floorRef.current,
              frame,
              now,
            );

            const worldOverlay = projectARRouteToWorld(
              update.overlay,
              (position) => venueToWorld(position, frame),
            );

            setOverlay(worldOverlay);
            if (update.rerouted) setRerouteCount((count) => count + 1);
            if (worldOverlay.hasArrived) router.replace('/arrived');
          },
        }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topbar}>
          <TouchableOpacity style={styles.circle} onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </TouchableOpacity>
          <View style={styles.badge}>
            <Text style={styles.badgeTitle}>GOAR NAVIGATION</Text>
            <Text style={styles.badgeSub}>{tracking} · reroutes {rerouteCount}</Text>
          </View>
        </View>

        <View style={[styles.instruction, overlay.isOffRoute && styles.warning]}>
          <Text style={styles.kicker}>{overlay.isOffRoute ? 'REROUTING' : 'NEXT'}</Text>
          <Text style={styles.title}>{overlay.instruction}</Text>
          <Text style={styles.copy}>
            {overlay.distanceToNextWaypointMeters.toFixed(1)} m to next point · {overlay.remainingDistanceMeters.toFixed(1)} m remaining
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, justifyContent: 'space-between', padding: 16 },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  circle: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(0,0,0,.7)', alignItems: 'center', justifyContent: 'center' },
  back: { color: '#fff', fontSize: 34, lineHeight: 36 },
  badge: { flex: 1, backgroundColor: 'rgba(0,0,0,.7)', borderRadius: 18, padding: 10, alignItems: 'center' },
  badgeTitle: { color: '#fff', fontWeight: '900', fontSize: 12, letterSpacing: 1 },
  badgeSub: { color: '#fff', opacity: 0.65, marginTop: 2, fontSize: 10 },
  instruction: { backgroundColor: 'rgba(0,0,0,.78)', borderRadius: 24, padding: 18 },
  warning: { borderWidth: 2, borderColor: '#fff' },
  kicker: { color: '#fff', opacity: 0.55, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: '#fff', fontSize: 23, fontWeight: '900', marginTop: 5 },
  copy: { color: '#fff', opacity: 0.7, marginTop: 7 },
  empty: { flex: 1, backgroundColor: '#f7f8f5', padding: 24, justifyContent: 'center' },
  emptyTitle: { fontSize: 30, fontWeight: '900' },
  emptyCopy: { marginTop: 10, marginBottom: 20, fontSize: 15, lineHeight: 22, opacity: 0.6 },
  primary: { backgroundColor: '#111', padding: 17, borderRadius: 16, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '900' },
});
