#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"

AVD="${1:-Pixel_7_API_35}"
PORT="${PORT:-5174}"
APP_URL="http://10.0.2.2:${PORT}/"

echo "Stopping any crashed emulator processes..."
pkill -9 -f "qemu-system|AndroidEmulator" 2>/dev/null || true
sleep 1

if ! curl -sf "http://127.0.0.1:${PORT}/" >/dev/null; then
  echo "Starting dev server on port ${PORT}..."
  cd "$ROOT"
  npm run dev >/tmp/remote-off-vite.log 2>&1 &
  for _ in $(seq 1 20); do
    curl -sf "http://127.0.0.1:${PORT}/" >/dev/null && break
    sleep 0.5
  done
fi

echo "Launching Android emulator (${AVD})..."
nohup emulator -avd "$AVD" \
  -gpu swiftshader_indirect \
  -no-audio \
  -no-boot-anim \
  >/tmp/remote-off-emulator.log 2>&1 &

echo "Waiting for emulator to boot..."
adb wait-for-device
for _ in $(seq 1 60); do
  booted="$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')"
  if [[ "$booted" == "1" ]]; then
    break
  fi
  sleep 2
done

echo "Opening app in emulator browser: ${APP_URL}"
adb shell am start -a android.intent.action.VIEW -d "$APP_URL" >/dev/null

echo "Done. App should be open on the emulator."
echo "Dev server: http://127.0.0.1:${PORT}/"
echo "Emulator URL: ${APP_URL}"
