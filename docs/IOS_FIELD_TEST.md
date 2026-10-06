# iPhone AR field test

Use this after the Android path is stable, or in parallel if a supported ARKit iPhone is available.

## Requirements

- macOS
- Xcode and command-line tools
- a supported ARKit iPhone
- the phone trusted by the Mac
- Apple signing configured for the generated development build
- printed GoAR checkpoint markers at the configured physical width.

## Build and install

Run:

    npm run field:ios

The script installs dependencies, checks Expo package alignment, regenerates native iOS files, then launches an on-device build.

## Validation

Repeat the same measured route used for Android so results can be compared directly. Record final seat error, correction drift, reroutes, tracking losses and crash/no-crash for at least five complete runs.
