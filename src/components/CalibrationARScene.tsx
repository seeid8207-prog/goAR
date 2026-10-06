import React from 'react';
import { ViroAmbientLight, ViroARScene, ViroText } from '@reactvision/react-viro';

type CameraTransform = {
  position: [number, number, number];
  rotation: [number, number, number];
};

type Props = {
  sceneNavigator?: {
    viroAppProps?: {
      label?: string;
      onCameraTransform?: (transform: CameraTransform) => void;
      onTrackingState?: (state: string) => void;
    };
  };
};

export default function CalibrationARScene({ sceneNavigator }: Props = {}) {
  const label = sceneNavigator?.viroAppProps?.label ?? 'CALIBRATE';

  return (
    <ViroARScene
      onTrackingUpdated={(state: any) =>
        sceneNavigator?.viroAppProps?.onTrackingState?.(String(state))
      }
      onCameraTransformUpdate={(event: any) => {
        const transform = event?.cameraTransform;
        if (transform?.position) {
          sceneNavigator?.viroAppProps?.onCameraTransform?.(transform as CameraTransform);
        }
      }}
    >
      <ViroAmbientLight color="#ffffff" intensity={300} />
      <ViroText
        text={label}
        position={[0, 0, -1.4]}
        width={2.8}
        height={0.5}
        style={{ fontSize: 22, color: '#ffffff', textAlign: 'center', fontWeight: '800' } as any}
      />
    </ViroARScene>
  );
}
