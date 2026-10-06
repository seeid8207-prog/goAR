import type { PersistentReferenceFrame, ARPosition } from '../types/arMapping';
import type { FrameCorrection, ObservedCheckpointPose, VenueCheckpointDefinition } from '../types/checkpoints';
import { venueToWorld } from './referenceFrame';

const distance=(a:ARPosition,b:ARPosition)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
const dot=(a:ARPosition,b:ARPosition)=>a.x*b.x+a.y*b.y+a.z*b.z;
const cross=(a:ARPosition,b:ARPosition):ARPosition=>({
  x:a.y*b.z-a.z*b.y,
  y:a.z*b.x-a.x*b.z,
  z:a.x*b.y-a.y*b.x,
});
const scale=(v:ARPosition,s:number):ARPosition=>({x:v.x*s,y:v.y*s,z:v.z*s});
const add=(a:ARPosition,b:ARPosition):ARPosition=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z});
const normalize=(v:ARPosition)=>{
  const n=Math.hypot(v.x,v.y,v.z)||1;
  return scale(v,1/n);
};
const normalizeAngle=(deg:number)=>{
  let d=((deg%360)+360)%360;
  if(d>180)d-=360;
  return d;
};
const frameYaw=(frame:PersistentReferenceFrame)=>
  Math.atan2(frame.xAxis.z,frame.xAxis.x)*180/Math.PI;

function rotateAroundAxis(v:ARPosition,axisInput:ARPosition,degrees:number):ARPosition{
  const axis=normalize(axisInput);
  const r=degrees*Math.PI/180;
  const c=Math.cos(r),s=Math.sin(r);
  return add(
    add(scale(v,c),scale(cross(axis,v),s)),
    scale(axis,dot(axis,v)*(1-c)),
  );
}

export function correctFrameFromCheckpoint(
  frame:PersistentReferenceFrame,
  checkpoint:VenueCheckpointDefinition,
  observed:ObservedCheckpointPose,
  alpha=1,
):FrameCorrection{
  if(checkpoint.id!==observed.checkpointId) throw new Error('Observed checkpoint does not match definition');
  if(checkpoint.venueId!==frame.venueId) throw new Error('Checkpoint belongs to another venue');

  const predicted=venueToWorld(checkpoint.venuePosition,frame);
  const error={
    x:observed.worldPosition.x-predicted.x,
    y:observed.worldPosition.y-predicted.y,
    z:observed.worldPosition.z-predicted.z,
  };
  const clamped=Math.max(0,Math.min(1,alpha*observed.confidence));
  const correctedOrigin={
    x:frame.origin.x+error.x*clamped,
    y:frame.origin.y+error.y*clamped,
    z:frame.origin.z+error.z*clamped,
  };

  const observedYaw=observed.worldRotation?.y;
  const expectedYaw=frameYaw(frame)+(checkpoint.venueYawDeg??0);
  const yawDriftDeg=typeof observedYaw==='number'
    ? normalizeAngle(observedYaw-expectedYaw)
    : 0;
  const appliedYaw=yawDriftDeg*clamped;
  const correctedXAxis=normalize(rotateAroundAxis(frame.xAxis,frame.yAxis,appliedYaw));
  const correctedZAxis=normalize(rotateAroundAxis(frame.zAxis,frame.yAxis,appliedYaw));
  const correctedYAxis=normalize(cross(correctedZAxis,correctedXAxis));

  const correctedFrame:PersistentReferenceFrame={
    ...frame,
    id:`${frame.venueId}:${checkpoint.id}:${Date.now()}`,
    checkpointId:checkpoint.id,
    origin:correctedOrigin,
    xAxis:correctedXAxis,
    yAxis:correctedYAxis,
    zAxis:correctedZAxis,
    createdAt:new Date().toISOString(),
    method:'image-marker-checkpoint',
  };

  return{
    checkpointId:checkpoint.id,
    previousOrigin:frame.origin,
    correctedOrigin,
    driftMeters:distance(predicted,observed.worldPosition),
    yawDriftDeg,
    confidence:observed.confidence,
    frame:correctedFrame,
  };
}

export function shouldApplyCorrection(correction:FrameCorrection,args:{
  minConfidence?:number;
  minDriftMeters?:number;
  maxDriftMeters?:number;
  minYawDriftDeg?:number;
  maxYawDriftDeg?:number;
}={}){
  const minConfidence=args.minConfidence??0.65;
  const minDrift=args.minDriftMeters??0.12;
  const maxDrift=args.maxDriftMeters??5;
  const minYaw=args.minYawDriftDeg??2;
  const maxYaw=args.maxYawDriftDeg??45;
  const translationUseful=correction.driftMeters>=minDrift&&correction.driftMeters<=maxDrift;
  const yawUseful=Math.abs(correction.yawDriftDeg)>=minYaw&&Math.abs(correction.yawDriftDeg)<=maxYaw;
  return correction.confidence>=minConfidence && (translationUseful||yawUseful);
}
