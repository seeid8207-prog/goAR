# Printable checkpoint markers

For the current field-test build, GoAR registers three 20 cm image targets. Print each marker at **20 cm wide** without scaling the artwork differently.

## Gate A

Payload: `SEATNAV:demo-stadium:cp-gate-a`

Image URL:

`https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=24&data=SEATNAV%3Ademo-stadium%3Acp-gate-a`

## East Concourse

Payload: `SEATNAV:demo-stadium:cp-east-concourse`

Image URL:

`https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=24&data=SEATNAV%3Ademo-stadium%3Acp-east-concourse`

## Section 104

Payload: `SEATNAV:demo-stadium:cp-section-104`

Image URL:

`https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=24&data=SEATNAV%3Ademo-stadium%3Acp-section-104`

## Field-test placement

- Mount markers flat and rigid.
- Avoid glossy laminate where possible.
- Keep them well lit.
- Measure and record each marker's venue XYZ position.
- Keep marker orientation consistent with the venue coordinate system.

The QR image provider above is suitable for the demo/field-test path. Production venues should host immutable marker assets in GoAR-controlled object storage and version them with the venue map.
