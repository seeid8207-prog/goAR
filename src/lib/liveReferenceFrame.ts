import type { PersistentReferenceFrame } from '../types/arMapping';

export class LiveReferenceFrame {
  private frame: PersistentReferenceFrame;

  constructor(initialFrame: PersistentReferenceFrame) {
    this.frame = initialFrame;
  }

  get() {
    return this.frame;
  }

  replace(next: PersistentReferenceFrame) {
    this.frame = next;
    return this.frame;
  }
}
