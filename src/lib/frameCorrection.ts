import type { PersistentReferenceFrame, ARPosition } from '../types/arMapping';
import type { FrameCorrection, ObservedCheckpointPose, VenueCheckpointDefinition } from '../types/checkpoints';
import { venueToWorld } from './referenceFrame';

const distance=(a:ARPosition,b:ARPosition)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);

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
  const correctedFrame:PersistentReferenceFrame={
    ...frame,
    id:`${frame.venueId}:${checkpoint.id}:${Date.now()}`,
    checkpointId:checkpoint.id,
    origin:correctedOrigin,
    createdAt:new Date().toISOString(),
    method:'image-marker-checkpoint',
  };

  return{
    checkpointId:checkpoint.id,
    previousOrigin:frame.origin,
    correctedOrigin,
    driftMeters:distance(predicted,observed.worldPosition),
    confidence:observed.confidence,
    frame:correctedFrame,
  };
}

export function shouldApplyCorrection(correction:FrameCorrection,args:{
  minConfidence?:number;
  minDriftMeters?:number;
  maxDriftMeters?:number;
}={}){
  const minConfidence=args.minConfidence??0.65;
  const minDrift=args.minDriftMeters??0.12;
  const maxDrift=args.maxDriftMeters??5;
  return correction.confidence>=minConfidence &&
    correction.driftMeters>=minDrift &&
    correction.driftMeters<=maxDrift;
}
