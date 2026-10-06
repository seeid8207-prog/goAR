# GoAR data and privacy inventory

This is an engineering data inventory and release checklist, not a substitute for jurisdiction-specific legal review.

## Mobile data

GoAR may process:
- camera frames for AR tracking and QR/image-marker recognition,
- device pose and local AR coordinates,
- coarse/fine location for outdoor approach navigation,
- event ticket identifiers and seat assignment,
- accessibility routing preference,
- locally cached venue maps, route graphs and checkpoint assets,
- diagnostic samples during field testing.

Camera frames are used for AR/marker processing and are not uploaded by the MVP telemetry path.

## Server data

The API can store:
- venue definitions and mapping versions,
- event/ticket records,
- navigation telemetry events,
- uploaded diagnostic sessions,
- request metadata necessary for operations/security.

## Retention defaults

Recommended defaults:
- navigation telemetry: 90 days,
- uploaded field diagnostics: 30 days,
- published venue maps: retained while active and versioned,
- tickets/events: according to the venue/operator business requirement.

Run:

    npm run retention:cleanup

Environment controls:
- GOAR_TELEMETRY_RETENTION_DAYS
- GOAR_DIAGNOSTIC_RETENTION_DAYS

## Release requirements

Before public launch:
- publish a user-facing privacy policy,
- document the legal basis/consent model for location and camera access,
- confirm ticket-holder data retention with venue partners,
- document subprocessors and hosting regions,
- provide a deletion/support contact,
- verify App Store privacy labels and Google Play Data safety answers against the actual production deployment,
- disable field diagnostics by default for general users unless explicitly needed.
