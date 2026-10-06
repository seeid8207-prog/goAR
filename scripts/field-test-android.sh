#!/usr/bin/env bash
set -euo pipefail

echo "GoAR Android field-test setup"

command -v node >/dev/null || { echo "Node.js is required."; exit 1; }
command -v adb >/dev/null || { echo "Android platform-tools (adb) are required."; exit 1; }

DEVICE_COUNT="$(adb devices | awk 'NR>1 && $2=="device" {count++} END {print count+0}')"
if [ "$DEVICE_COUNT" -lt 1 ]; then
  echo "No authorized Android device detected."
  echo "Enable Developer options + USB debugging, connect the phone, and accept the RSA prompt."
  adb devices
  exit 1
fi

echo "Detected device:"
adb devices -l | awk 'NR==2 {print}'

echo "Installing JavaScript dependencies..."
npm install

echo "Checking Expo dependency alignment..."
npx expo install --check

echo "Generating native projects..."
npx expo prebuild --clean

echo "Building and installing GoAR on the connected Android device..."
npx expo run:android --device

echo
echo "GoAR build installed."
echo "Field-test sequence:"
echo "1. Open GoAR."
echo "2. Venue Admin -> AR Mapper."
echo "3. Map a real seat using the center reticle."
echo "4. Return home -> Find my seat."
echo "5. Scan/localize at the Gate A checkpoint."
echo "6. Walk the route and deliberately deviate once."
echo "7. Pass a checkpoint marker to trigger drift correction."
echo "8. Venue Admin -> AR Field Diagnostics."
