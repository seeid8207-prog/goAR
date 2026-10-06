import type { ObservedCheckpointPose, VenueCheckpointDefinition } from '../types/checkpoints';
import type { PersistentReferenceFrame } from '../types/arMapping';
import { CheckpointCorrectionSession } from './checkpointCorrectionSession';
import { saveReferenceFrame } from './referenceFrameStore';

export class CheckpointRuntime {
  private readonly session: CheckpointCorrectionSession;

  constructor(
    initialFrame: PersistentReferenceFrame,
    checkpoints: VenueCheckpointDefinition[],
    cooldownMs = 5000,
  ) {
    this.session = new CheckpointCorrectionSession(initialFrame, checkpoints, cooldownMs);
  }

  async observe(observation: ObservedCheckpointPose, nowMs = Date.now()) {
    const result = this.session.observe(observation, nowMs);
    if (result.applied) {
      await saveReferenceFrame(result.frame);
    }
    return result;
  }

  getFrame() {
    return this.session.getFrame();
  }
}
