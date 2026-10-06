import type { ARPosition, PersistentReferenceFrame } from '../types/arMapping';

const sub = (a: ARPosition, b: ARPosition): ARPosition => ({ x: a.x-b.x, y: a.y-b.y, z: a.z-b.z });
const length = (v: ARPosition) => Math.hypot(v.x, v.y, v.z);
const scale = (v: ARPosition, s: number): ARPosition => ({ x: v.x*s, y: v.y*s, z: v.z*s });
const dot = (a: ARPosition, b: ARPosition) => a.x*b.x + a.y*b.y + a.z*b.z;
const cross = (a: ARPosition, b: ARPosition): ARPosition => ({
  x: a.y*b.z - a.z*b.y,
  y: a.z*b.x - a.x*b.z,
  z: a.x*b.y - a.y*b.x,
});

function normalize(v: ARPosition) {
  const n = length(v);
  if (n < 1e-5) throw new Error('Calibration points are too close together');
  return scale(v, 1/n);
}

export function buildReferenceFrameFromThreePoints(args: {
  venueId: string;
  checkpointId: string;
  origin: ARPosition;
  positiveX: ARPosition;
  positiveZ: ARPosition;
}): PersistentReferenceFrame {
  const rawX = sub(args.positiveX, args.origin);
  const rawZ = sub(args.positiveZ, args.origin);

  const xAxis = normalize(rawX);
  const zRejected = {
    x: rawZ.x - xAxis.x * dot(rawZ, xAxis),
    y: rawZ.y - xAxis.y * dot(rawZ, xAxis),
    z: rawZ.z - xAxis.z * dot(rawZ, xAxis),
  };
  const zAxis = normalize(zRejected);
  const yAxis = normalize(cross(zAxis, xAxis));

  return {
    id: `${args.venueId}:${args.checkpointId}:${Date.now()}`,
    venueId: args.venueId,
    checkpointId: args.checkpointId,
    origin: args.origin,
    xAxis,
    yAxis,
    zAxis,
    createdAt: new Date().toISOString(),
    method: 'three-point-checkpoint',
    version: 1,
  };
}
