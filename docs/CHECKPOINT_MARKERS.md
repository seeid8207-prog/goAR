# Printable checkpoint markers

GoAR bundles three field-test image targets directly inside the mobile app, so checkpoint recognition continues to work with no network connection.

Print each file at **20 cm wide** without rescaling the artwork differently:

- `assets/checkpoints/gate-a.png`
- `assets/checkpoints/east-concourse.png`
- `assets/checkpoints/section-104.png`

Their payload identities are:

- Gate A: `SEATNAV:demo-stadium:cp-gate-a`
- East Concourse: `SEATNAV:demo-stadium:cp-east-concourse`
- Section 104: `SEATNAV:demo-stadium:cp-section-104`

## Field-test placement

- Mount markers flat and rigid.
- Avoid glossy laminate where possible.
- Keep them well lit.
- Measure and record each marker's venue XYZ position.
- Keep marker orientation consistent with the venue coordinate system.
- Print at the configured physical width because Viro uses that width for tracking scale.

Production venues should version marker assets with the published venue map so a checkpoint image, its physical width, and its venue-space pose always change together.
