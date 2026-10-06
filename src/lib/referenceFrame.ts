import type { ARPosition, PersistentReferenceFrame } from '../types/arMapping';

const sub = (a: ARPosition, b: ARPosition): ARPosition => ({ x: a.x-b.x, y: a.y-b.y, z: a.z-b.z });
const add = (a: ARPosition, b: ARPosition): ARPosition => ({ x: a.x+b.x, y: a.y+b.y, z: a.z+b.z });
const scale = (a: ARPosition, s: number): ARPosition => ({ x: a.x*s, y: a.y*s, z: a.z*s });
const dot = (a: ARPosition, b: ARPosition) => a.x*b.x + a.y*b.y + a.z*b.z;

export function worldToVenue(p: ARPosition, frame: PersistentReferenceFrame): ARPosition {
  const d = sub(p, frame.origin);
  return { x: dot(d, frame.xAxis), y: dot(d, frame.yAxis), z: dot(d, frame.zAxis) };
}

export function venueToWorld(p: ARPosition, frame: PersistentReferenceFrame): ARPosition {
  return add(frame.origin, add(scale(frame.xAxis,p.x), add(scale(frame.yAxis,p.y), scale(frame.zAxis,p.z))));
}
