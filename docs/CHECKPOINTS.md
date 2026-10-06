# Checkpoint relocalization

GoAR uses fixed venue checkpoints to correct AR drift during long indoor routes.

Each checkpoint has:
- a stable ID,
- venue ID,
- floor,
- known venue-space XYZ coordinate,
- QR payload,
- optional tracked-image marker,
- known physical marker width.

## Runtime behavior

1. The attendee localizes at an initial checkpoint.
2. Navigation starts with that venue reference frame.
3. When another known checkpoint is observed, GoAR compares:
   - where the current frame predicts the checkpoint should be, and
   - where AR actually sees it.
4. The difference is measured as drift.
5. A correction is applied only when:
   - confidence is at least 0.65,
   - drift is at least 0.12 m,
   - drift is no more than 5 m,
   - the correction cooldown has elapsed.
6. The corrected frame is persisted and subsequent AR route projection uses it.

Large jumps are rejected because they are more likely to be a wrong marker or tracking failure than real drift.

## Production marker recognition

The correction engine is independent of marker technology. An observer can feed it from:
- Viro image tracking,
- QR-assisted AR calibration,
- ARCore Augmented Images,
- ARKit image anchors,
- Cloud/Geospatial anchors where appropriate.

This separation lets GoAR upgrade the recognition provider without changing the routing engine.
