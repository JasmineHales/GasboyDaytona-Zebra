#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORT:-5174}"
IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"

echo "Stopping old dev/tunnel processes on port ${PORT}..."
lsof -tiTCP:"${PORT}" | xargs kill -9 2>/dev/null || true
pkill -f "cloudflared tunnel --url http://127.0.0.1:${PORT}" 2>/dev/null || true
sleep 1

echo "Starting phone-friendly dev server..."
cd "$ROOT"
nohup npm run dev:phone >/tmp/remote-off-phone-vite.log 2>&1 &
VITE_PID=$!
disown "$VITE_PID" 2>/dev/null || true

for _ in $(seq 1 30); do
  if curl -skf "https://127.0.0.1:${PORT}/" >/dev/null; then
    break
  fi
  sleep 0.5
done

echo "Starting Cloudflare tunnel..."
nohup npx --yes cloudflared tunnel --no-tls-verify --url "https://127.0.0.1:${PORT}" >/tmp/remote-off-phone-tunnel.log 2>&1 &
TUNNEL_PID=$!
disown "$TUNNEL_PID" 2>/dev/null || true

TUNNEL_URL=""
for _ in $(seq 1 40); do
  TUNNEL_URL="$(grep -o 'https://[^ ]*trycloudflare.com' /tmp/remote-off-phone-tunnel.log | head -1 || true)"
  if [[ -n "$TUNNEL_URL" ]]; then
    break
  fi
  sleep 0.5
done

echo ""
echo "=== Phone test links ==="
if [[ -n "$TUNNEL_URL" ]]; then
  echo "Phone (use this):   ${TUNNEL_URL}"
  echo "                   (trusted HTTPS — camera works on iPhone)"
else
  echo "Phone:             still starting — run: tail -f /tmp/remote-off-phone-tunnel.log"
fi
if [[ -n "$IP" ]]; then
  echo "LAN (limited):      https://${IP}:${PORT}/"
  echo "                   (self-signed — Safari shows Not Secure; camera may not work)"
else
  echo "LAN:               (no Wi-Fi IP found)"
fi
echo ""
echo "Logs: /tmp/remote-off-phone-vite.log, /tmp/remote-off-phone-tunnel.log"
