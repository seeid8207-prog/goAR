#!/usr/bin/env bash
set -euo pipefail

echo "GoAR iOS field-test setup"

if [ "$(uname -s)" != "Darwin" ]; then
  echo "iOS native builds require macOS with Xcode."
  exit 1
fi

command -v xcodebuild >/dev/null || { echo "Xcode command-line tools are required."; exit 1; }
command -v node >/dev/null || { echo "Node.js is required."; exit 1; }

echo "Installing JavaScript dependencies..."
npm install

echo "Checking Expo dependency alignment..."
npx expo install --check

echo "Generating native projects..."
npx expo prebuild --clean

echo "Building and installing GoAR on a connected iPhone..."
npx expo run:ios --device

echo
echo "GoAR iOS build installed."
echo "Run the same checkpoint -> navigation -> drift correction -> diagnostics flow described in docs/FIELD_TEST_PLAN.md."
