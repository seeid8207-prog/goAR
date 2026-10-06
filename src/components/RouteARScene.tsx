import React from 'react';
import {
  ViroAmbientLight,
  ViroARScene,
  ViroBox,
  ViroNode,
  ViroPolyline,
  ViroText,
} from '@reactvision/react-viro';
import type { WorldARWaypoint } from '../lib/arRouteWorld';

type SceneProps = {
  sceneNavigator?: {
    viroAppProps?: {
      waypoints?: WorldARWaypoint[];
      onTrackingState?: (state: string) => void;
    };
  };
};

function arrowLabel(kind: WorldARWaypoint['kind']) {
  switch (kind) {
    case 'turn-left': return '←';
    case 'turn-right': return '→';
    case 'turn-around': return '↶';
    case 'stairs': return 'STAIRS';
    case 'lift': return 'LIFT';
    case 'section': return 'SECTION';
    case 'row': return 'ROW';
    case 'seat':
    case 'destination': return 'SEAT';
    default: return '▲';
  }
}

export default function RouteARScene({ sceneNavigator }: SceneProps) {
  const waypoints = sceneNavigator?.viroAppProps?.waypoints ?? [];
  const linePoints = waypoints.map((waypoint) => [
    waypoint.worldPosition.x,
    waypoint.worldPosition.y + 0.03,
    waypoint.worldPosition.z,
  ]);

  return (
    <ViroARScene
      onTrackingUpdated={(state: any) =>
        sceneNavigator?.viroAppProps?.onTrackingState?.(String(state))
      }
    >
      <ViroAmbientLight color="#ffffff" intensity={350} />

      {linePoints.length > 1 && (
        <ViroPolyline
          position={[0, 0, 0]}
          points={linePoints as any}
          thickness={0.035}
        />
      )}

      {waypoints.map((waypoint) => {
        const active = waypoint.isActive;
        return (
          <ViroNode
            key={waypoint.id}
            position={[
              waypoint.worldPosition.x,
              waypoint.worldPosition.y,
              waypoint.worldPosition.z,
            ]}
          >
            <ViroBox
              width={active ? 0.28 : 0.18}
              height={0.025}
              length={active ? 0.42 : 0.28}
              position={[0, 0, 0]}
            />
            <ViroText
              text={`${arrowLabel(waypoint.kind)}\n${waypoint.label}`}
              position={[0, active ? 0.22 : 0.15, 0]}
              width={active ? 2.5 : 1.8}
              height={0.65}
              style={{
                fontSize: active ? 22 : 14,
                color: '#ffffff',
                textAlign: 'center',
                fontWeight: '700',
              } as any}
              transformBehaviors={['billboardY']}
            />
          </ViroNode>
        );
      })}
    </ViroARScene>
  );
}
