#!/bin/sh
set -e

if [ -S /var/run/docker.sock ]; then
  DOCKER_GID=$(stat -c '%g' /var/run/docker.sock)
  if [ "$DOCKER_GID" = "0" ]; then
    chmod 666 /var/run/docker.sock 2>/dev/null || true
  else
    addgroup -g "$DOCKER_GID" -S docker 2>/dev/null || true
    adduser node docker 2>/dev/null || true
  fi
fi

KUBECONFIG_SOURCE=/home/node/.kube/config
KUBECONFIG_RUNTIME=/tmp/kube/config
TLS_SKIP="${K8S_SKIP_TLS_VERIFY:-auto}"

if [ ! -f "$KUBECONFIG_SOURCE" ]; then
  exec su-exec node node dist/main.js
fi

mkdir -p /tmp/kube
chown -R node:node /tmp/kube

if [ "$TLS_SKIP" = "true" ] || [ "$TLS_SKIP" = "auto" ]; then
  sed 's|127.0.0.1|host.docker.internal|g' "$KUBECONFIG_SOURCE" | awk '
    /^- cluster:/ { in_cluster = 1; print; next }
    in_cluster && /^  name:/ { in_cluster = 0; print; next }
    in_cluster && /certificate-authority-data:/ { next }
    in_cluster && /certificate-authority:/ { next }
    in_cluster && /insecure-skip-tls-verify:/ { next }
    in_cluster && /server: https:\/\/host\.docker\.internal/ {
      print
      print "    insecure-skip-tls-verify: true"
      next
    }
    { print }
  ' > "$KUBECONFIG_RUNTIME"
else
  sed 's|127.0.0.1|host.docker.internal|g' "$KUBECONFIG_SOURCE" > "$KUBECONFIG_RUNTIME"
fi

chown node:node "$KUBECONFIG_RUNTIME"

export KUBECONFIG="$KUBECONFIG_RUNTIME"

exec su-exec node env KUBECONFIG="$KUBECONFIG_RUNTIME" node dist/main.js
