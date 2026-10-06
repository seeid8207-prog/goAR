import React from 'react';
import { ViroAmbientLight, ViroARScene, ViroNode, ViroSphere, ViroText } from '@reactvision/react-viro';
import type { ARPosition } from '../types/arMapping';
import type { MappingPoint } from '../types/venueMapping';

type CameraTransform = {
  position: [number, number, number];
  forward: [number, number, number];
};

type Props = {
  sceneNavigator?: {
    viroAppProps?: {
      points?: MappingPoint[];
      onCameraTransform?: (transform: CameraTransform) => void;
    };
  };
};

export default function VenueMapperARScene({ sceneNavigator }: Props) {
  const points = sceneNavigator?.viroAppProps?.points ?? [];
  return (
    <ViroARScene
      onCameraTransformUpdate={(event: any) => {
        const t = event?.cameraTransform;
        if (t?.position && t?.forward) sceneNavigator?.viroAppProps?.onCameraTransform?.(t);
      }}
    >
      <ViroAmbientLight color="#ffffff" intensity={320} />
      {points.map((point) => (
        <ViroNode key={point.id} position={[point.position.x, point.position.y, point.position.z]}>
          <ViroSphere radius={0.08} />
          <ViroText
            text={point.label}
            position={[0, 0.16, 0]}
            width={1.6}
            height={0.35}
            style={{ color:'#fff',fontSize:15,textAlign:'center',fontWeight:'800' } as any}
            transformBehaviors={['billboardY']}
          />
        </ViroNode>
      ))}
    </ViroARScene>
  );
}

export function pointInFrontOfCamera(
  position: ARPosition,
  forward: ARPosition,
  distanceMeters = 1.5,
): ARPosition {
  return {
    x: position.x + forward.x * distanceMeters,
    y: position.y + forward.y * distanceMeters,
    z: position.z + forward.z * distanceMeters,
  };
}
