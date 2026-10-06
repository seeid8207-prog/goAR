import { CameraView, useCameraPermissions } from 'expo-camera';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CalibrationARScene from '../src/components/CalibrationARScene';
import { DEMO_VENUE, checkpoint } from '../src/data/demoVenue';
import { buildReferenceFrameFromThreePoints } from '../src/lib/calibration';
import { saveReferenceFrame } from '../src/lib/referenceFrameStore';
import type { ARPosition } from '../src/types/arMapping';

type Stage = 'scan' | 'origin' | 'x' | 'z' | 'saving';

export default function CheckpointScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [stage, setStage] = useState<Stage>('scan');
  const [tracking, setTracking] = useState('initializing');
  const [error, setError] = useState('');
  const latestPosition = useRef<ARPosition | null>(null);
  const origin = useRef<ARPosition | null>(null);
  const positiveX = useRef<ARPosition | null>(null);

  const instruction = useMemo(() => {
    if (stage === 'origin') return 'Hold the phone at the ORIGIN mark';
    if (stage === 'x') return 'Move the phone to the +X mark';
    if (stage === 'z') return 'Move the phone to the +Z mark';
    return '';
  }, [stage]);

  if (!permission) return <View style={styles.root} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permission}>
        <Text style={styles.title}>Camera access required</Text>
        <Text style={styles.copy}>GoAR uses the camera to scan venue checkpoints and establish the AR coordinate frame.</Text>
        <TouchableOpacity style={styles.primary} onPress={requestPermission}>
          <Text style={styles.primaryText}>Allow camera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (stage === 'scan') {
    return (
      <View style={styles.root}>
        <CameraView
          style={StyleSheet.absoluteFill}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={({ data }) => {
            if (data === checkpoint.qrValue) {
              setError('');
              setStage('origin');
            } else {
              setError('This checkpoint is not registered for the selected venue.');
            }
          }}
        />
        <SafeAreaView style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.kicker}>STEP 1 OF 2</Text>
            <Text style={styles.title}>Scan venue checkpoint</Text>
            <Text style={styles.copy}>Scan {checkpoint.label} for {DEMO_VENUE.name}.</Text>
            {!!error && <Text style={styles.error}>{error}</Text>}
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const capture = async () => {
    const position = latestPosition.current;
    if (!position) {
      setError('AR tracking is not ready yet. Move the phone slowly and try again.');
      return;
    }

    setError('');
    if (stage === 'origin') {
      origin.current = { ...position };
      setStage('x');
      return;
    }
    if (stage === 'x') {
      positiveX.current = { ...position };
      setStage('z');
      return;
    }
    if (stage === 'z') {
      if (!origin.current || !positiveX.current) return;
      try {
        setStage('saving');
        const frame = buildReferenceFrameFromThreePoints({
          venueId: DEMO_VENUE.id,
          checkpointId: checkpoint.id,
          origin: origin.current,
          positiveX: positiveX.current,
          positiveZ: position,
        });
        await saveReferenceFrame(frame);
        router.replace('/ar-navigate');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Calibration failed');
        setStage('origin');
      }
    }
  };

  return (
    <View style={styles.root}>
      <ViroARSceneNavigator
        autofocus
        initialScene={{ scene: CalibrationARScene }}
        viroAppProps={{
          label: instruction,
          onTrackingState: setTracking,
          onCameraTransform: (transform: any) => {
            const [x,y,z] = transform.position;
            latestPosition.current = { x, y, z };
          },
        }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.card}>
          <Text style={styles.kicker}>STEP 2 OF 2 · {tracking}</Text>
          <Text style={styles.title}>{stage === 'saving' ? 'Saving calibration…' : instruction}</Text>
          <Text style={styles.copy}>
            Keep the phone orientation consistent. The three physical marks define the venue's X/Z axes.
          </Text>
          {!!error && <Text style={styles.error}>{error}</Text>}
        </View>

        {stage !== 'saving' && (
          <TouchableOpacity style={styles.primary} onPress={capture}>
            <Text style={styles.primaryText}>
              {stage === 'origin' ? 'Capture origin' : stage === 'x' ? 'Capture +X' : 'Capture +Z & start'}
            </Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, justifyContent: 'space-between', padding: 20 },
  card: { backgroundColor: 'rgba(0,0,0,.72)', borderRadius: 22, padding: 18 },
  kicker: { color: '#fff', opacity: .55, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: '#fff', fontSize: 25, fontWeight: '900', marginTop: 5 },
  copy: { color: '#fff', opacity: .72, marginTop: 8, lineHeight: 20 },
  error: { color: '#fff', marginTop: 12, fontWeight: '800' },
  primary: { backgroundColor: '#fff', borderRadius: 18, padding: 17, alignItems: 'center' },
  primaryText: { color: '#111', fontWeight: '900', fontSize: 16 },
  permission: { flex: 1, backgroundColor: '#f7f8f5', justifyContent: 'center', padding: 24 },
});
