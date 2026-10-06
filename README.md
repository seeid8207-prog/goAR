# GoAR

GoAR is a React Native / Expo venue-navigation application that combines outdoor navigation with indoor routing and AR guidance to an exact seat or point inside a venue.

## Current flow

1. Choose the demo seat.
2. Scan the venue checkpoint QR.
3. Complete the three-point AR checkpoint calibration.
4. The reference frame is saved locally.
5. AR navigation renders only the active route waypoints.
6. Route progress is calculated from the live Viro camera transform.
7. If the attendee leaves the route, GoAR reroutes from the nearest valid graph node.
8. Lift/stair transitions explicitly confirm the destination floor.
9. Arrival is detected within the configured destination radius.

## Development stack

- Expo SDK 57
- React Native 0.86
- Expo Router
- ViroReact / ARKit / ARCore
- MapLibre + OpenStreetMap-compatible map data
- AsyncStorage

ViroReact requires a native development build; it does not run in Expo Go.

## Run

```bash
npm install
npx expo install --fix
npx expo prebuild --clean
npx expo run:android
# or
npx expo run:ios
```

Use a physical ARCore/ARKit-capable device.

## Navigation core tests

```bash
npm run test:navigation
```

These tests cover route calculation, active waypoint progression, off-route detection, rerouting, arrival, AR waypoint projection, and reference-frame round trips.

## Architecture

```
checkpoint -> persistent venue frame
                 |
live AR camera -> worldToVenue
                 |
          NavigationSession
          /              \
 route progress         reroute
          \              /
           AR route overlay
                 |
            venueToWorld
                 |
            RouteARScene
```

## Next work

- automatic image-marker localization and drift correction
- production venue/seat AR mapper
- bulk row/seat generation
- backend and venue synchronization
- ticket-to-seat integration
- accessible routing
- offline venue packages
- field testing and release hardening
