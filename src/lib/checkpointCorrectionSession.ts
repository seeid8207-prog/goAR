import type { PersistentReferenceFrame } from '../types/arMapping';
import type { ObservedCheckpointPose, VenueCheckpointDefinition } from '../types/checkpoints';
import { correctFrameFromCheckpoint, shouldApplyCorrection } from './frameCorrection';

export class CheckpointCorrectionSession{
  private lastCorrectionAt=0;

  constructor(
    private frame:PersistentReferenceFrame,
    private readonly checkpoints:VenueCheckpointDefinition[],
    private readonly cooldownMs=5000,
  ){}

  observe(observed:ObservedCheckpointPose,nowMs=Date.now()){
    const checkpoint=this.checkpoints.find((item)=>item.id===observed.checkpointId);
    if(!checkpoint)return {applied:false,reason:'unknown-checkpoint' as const,frame:this.frame};
    if(nowMs-this.lastCorrectionAt<this.cooldownMs)return {applied:false,reason:'cooldown' as const,frame:this.frame};

    const correction=correctFrameFromCheckpoint(this.frame,checkpoint,observed,0.8);
    if(!shouldApplyCorrection(correction)){
      return {applied:false,reason:'below-threshold' as const,frame:this.frame,correction};
    }

    this.frame=correction.frame;
    this.lastCorrectionAt=nowMs;
    return {applied:true,reason:'corrected' as const,frame:this.frame,correction};
  }

  getFrame(){return this.frame;}
}
