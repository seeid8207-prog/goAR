# Android AR field test

This is the first physical-device validation path for GoAR.

## Requirements

- an ARCore-supported Android phone,
- USB debugging enabled,
- Android SDK platform-tools (`adb`),
- JDK/Android build tooling required by Expo,
- the phone connected and authorized,
- printed GoAR checkpoint marker(s), 20 cm wide.

## Build and install

From the repository root run:

    npm run field:android

The helper checks for an authorized phone, installs dependencies, checks Expo package alignment, regenerates the native Android project and installs the development build.

## First test

Use a simple measured test area before attempting a stadium.

1. Place the Gate A checkpoint at a fixed point.
2. Measure a route of roughly 10–30 m with one turn.
3. Choose a physical chair as the destination.
4. Open Venue Admin → AR Mapper.
5. Map the chair using the center reticle.
6. Record the mapper hit type/confidence.
7. Return to the attendee flow.
8. Localize at the checkpoint.
9. Walk the displayed AR route.
10. Deviate by more than 5 m and verify rerouting.
11. Walk past another printed checkpoint and verify a correction appears in the HUD.
12. Finish at the chair.
13. Open Venue Admin → AR Field Diagnostics.

## Acceptance target

- final destination error <= 0.75 m
- no wrong-floor arrival
- off-route reaction <= 3 seconds
- checkpoint correction does not create a visible jump larger than measured drift
- five consecutive complete runs without a crash
