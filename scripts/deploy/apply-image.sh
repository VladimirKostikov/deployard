#!/usr/bin/env bash
# Apply a deployment image change via Rollout deploy webhook.
# Used by CI/CD, GitHub Actions "Run workflow" button, or any external trigger.
#
# Examples:
#   ./scripts/deploy/apply-image.sh \
#     --namespace default --deployment orders-api --image shop/orders-api:v2.3.1
#
#   echo '{"namespace":"default","deployment":"orders-api","image":"shop/orders-api:v2.3.1"}' \
#     | ./scripts/deploy/apply-image.sh --stdin
#
# Environment:
#   DEPLOY_WEBHOOK_URL     API base URL (default: http://localhost:18480/api)
#   DEPLOY_WEBHOOK_SECRET  Shared secret (must match API DEPLOY_WEBHOOK_SECRET)
#   DEPLOY_CLUSTER         Optional k8s cluster context name

set -euo pipefail

WEBHOOK_URL="${DEPLOY_WEBHOOK_URL:-http://localhost:18480/api}"
WEBHOOK_SECRET="${DEPLOY_WEBHOOK_SECRET:-}"
CLUSTER="${DEPLOY_CLUSTER:-}"

NAMESPACE=""
DEPLOYMENT=""
IMAGE=""
ACTION="update_image"
REPLICAS=""
CONTAINER_PORT=""
STDIN_MODE=false
FILE=""

usage() {
  cat <<'EOF'
Usage: apply-image.sh [options]

Send deployment changes to Rollout webhook (POST /api/webhooks/deploy).

Options:
  --namespace, -n       Kubernetes namespace
  --deployment, -d    Deployment name
  --image, -i           Container image (e.g. shop/orders-api:v2.3.1)
  --action, -a          update_image (default) or create
  --replicas            Replicas when action=create
  --container-port      Container port when action=create
  --cluster, -c         K8s cluster context (X-K8s-Cluster header)
  --url                 Webhook base URL (default: DEPLOY_WEBHOOK_URL or localhost)
  --secret              Webhook secret (default: DEPLOY_WEBHOOK_SECRET)
  --stdin               Read JSON payload from stdin
  --file, -f            Read JSON payload from file
  -h, --help            Show this help

JSON payload fields: namespace, deployment, image, action?, replicas?, containerPort?, cluster?
CLI flags override JSON values when both are provided.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --namespace|-n) NAMESPACE="$2"; shift 2 ;;
    --deployment|-d) DEPLOYMENT="$2"; shift 2 ;;
    --image|-i) IMAGE="$2"; shift 2 ;;
    --action|-a) ACTION="$2"; shift 2 ;;
    --replicas) REPLICAS="$2"; shift 2 ;;
    --container-port) CONTAINER_PORT="$2"; shift 2 ;;
    --cluster|-c) CLUSTER="$2"; shift 2 ;;
    --url) WEBHOOK_URL="$2"; shift 2 ;;
    --secret) WEBHOOK_SECRET="$2"; shift 2 ;;
    --stdin) STDIN_MODE=true; shift ;;
    --file|-f) FILE="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ -n "$FILE" ]]; then
  if [[ ! -f "$FILE" ]]; then
    echo "File not found: $FILE" >&2
    exit 1
  fi
  JSON_PAYLOAD="$(cat "$FILE")"
elif [[ "$STDIN_MODE" == true ]]; then
  JSON_PAYLOAD="$(cat)"
elif [[ -n "$NAMESPACE$DEPLOYMENT$IMAGE" ]]; then
  :
else
  echo "Provide --namespace/--deployment/--image, --stdin, or --file" >&2
  usage
  exit 1
fi

if [[ -n "${JSON_PAYLOAD:-}" ]]; then
  if ! command -v python3 >/dev/null 2>&1; then
    echo "python3 is required to parse JSON payload" >&2
    exit 1
  fi

  read_json() {
    python3 - "$1" <<'PY'
import json, sys
key = sys.argv[1]
data = json.load(sys.stdin)
value = data.get(key)
if value is not None:
    print(value)
PY
  }

  [[ -z "$NAMESPACE" ]] && NAMESPACE="$(printf '%s' "$JSON_PAYLOAD" | read_json namespace || true)"
  [[ -z "$DEPLOYMENT" ]] && DEPLOYMENT="$(printf '%s' "$JSON_PAYLOAD" | read_json deployment || true)"
  [[ -z "$IMAGE" ]] && IMAGE="$(printf '%s' "$JSON_PAYLOAD" | read_json image || true)"
  JSON_ACTION="$(printf '%s' "$JSON_PAYLOAD" | read_json action || true)"
  [[ -n "$JSON_ACTION" ]] && ACTION="$JSON_ACTION"
  [[ -z "$REPLICAS" ]] && REPLICAS="$(printf '%s' "$JSON_PAYLOAD" | read_json replicas || true)"
  [[ -z "$CONTAINER_PORT" ]] && CONTAINER_PORT="$(printf '%s' "$JSON_PAYLOAD" | read_json containerPort || true)"
  [[ -z "$CLUSTER" ]] && CLUSTER="$(printf '%s' "$JSON_PAYLOAD" | read_json cluster || true)"
fi

ACTION="${ACTION:-update_image}"

if [[ -z "$WEBHOOK_SECRET" ]]; then
  echo "DEPLOY_WEBHOOK_SECRET is required (env or --secret)" >&2
  exit 1
fi

if [[ -z "$NAMESPACE" || -z "$DEPLOYMENT" || -z "$IMAGE" ]]; then
  echo "namespace, deployment, and image are required" >&2
  exit 1
fi

BODY="$(ACTION="$ACTION" NAMESPACE="$NAMESPACE" DEPLOYMENT="$DEPLOYMENT" IMAGE="$IMAGE" REPLICAS="$REPLICAS" CONTAINER_PORT="$CONTAINER_PORT" CLUSTER="$CLUSTER" python3 - <<'PY'
import json
import os

payload = {
    "action": os.environ["ACTION"],
    "namespace": os.environ["NAMESPACE"],
    "deployment": os.environ["DEPLOYMENT"],
    "image": os.environ["IMAGE"],
}

replicas = os.environ.get("REPLICAS", "")
container_port = os.environ.get("CONTAINER_PORT", "")
cluster = os.environ.get("CLUSTER", "")

if replicas:
    payload["replicas"] = int(replicas)
if container_port:
    payload["containerPort"] = int(container_port)
if cluster:
    payload["cluster"] = cluster

print(json.dumps(payload))
PY
)"

ENDPOINT="${WEBHOOK_URL%/}/webhooks/deploy"
CURL_ARGS=(
  -sS
  -X POST
  -H "Content-Type: application/json"
  -H "X-Deploy-Secret: ${WEBHOOK_SECRET}"
)

if [[ -n "$CLUSTER" ]]; then
  CURL_ARGS+=(-H "X-K8s-Cluster: ${CLUSTER}")
fi

echo "→ POST ${ENDPOINT}"
echo "  namespace=${NAMESPACE} deployment=${DEPLOYMENT} image=${IMAGE} action=${ACTION}"
[[ -n "$CLUSTER" ]] && echo "  cluster=${CLUSTER}"

RESPONSE="$(curl "${CURL_ARGS[@]}" -d "$BODY" -w "\n%{http_code}" "$ENDPOINT")"
HTTP_CODE="$(printf '%s' "$RESPONSE" | tail -n1)"
BODY_OUT="$(printf '%s' "$RESPONSE" | sed '$d')"

if [[ "$HTTP_CODE" -ge 200 && "$HTTP_CODE" -lt 300 ]]; then
  echo "✓ Deploy accepted (HTTP ${HTTP_CODE})"
  echo "$BODY_OUT"
  exit 0
fi

echo "✗ Deploy failed (HTTP ${HTTP_CODE})" >&2
echo "$BODY_OUT" >&2
exit 1
