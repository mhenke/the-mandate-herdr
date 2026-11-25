#!/usr/bin/env bash
set -euo pipefail

# scripts/watch-ci.sh
# Deterministic CI watcher for GitHub Actions on direct-to-main or branch pushes.

COMMIT_SHA="${1:-$(git rev-parse HEAD)}"
# Ensure 40-char SHA
COMMIT_SHA=$(git rev-parse "$COMMIT_SHA")

echo "==> Monitoring GitHub Actions CI for commit: ${COMMIT_SHA}"

RUN_ID=""
MAX_WAIT_SECONDS=60
POLL_INTERVAL=2
ELAPSED=0

echo -n "==> Waiting for GitHub Actions run to register"
while [ -z "$RUN_ID" ] && [ "$ELAPSED" -lt "$MAX_WAIT_SECONDS" ]; do
  RUN_ID=$(gh run list --commit "$COMMIT_SHA" --limit 1 --json databaseId --jq '.[0].databaseId // empty' 2>/dev/null || true)
  if [ -n "$RUN_ID" ]; then
    break
  fi
  echo -n "."
  sleep "$POLL_INTERVAL"
  ELAPSED=$((ELAPSED + POLL_INTERVAL))
done
echo ""

if [ -z "$RUN_ID" ]; then
  echo "Error: No GitHub Actions run found for commit ${COMMIT_SHA} within ${MAX_WAIT_SECONDS}s." >&2
  exit 1
fi

RUN_URL=$(gh run view "$RUN_ID" --json url --jq '.url')
echo "==> Found CI Run: ${RUN_ID} (${RUN_URL})"
echo "==> Watching run execution to completion..."

if ! gh run watch "$RUN_ID" --exit-status; then
  echo ""
  echo "❌ CI failed for run ${RUN_ID} (${RUN_URL}). Extracting failed logs:"
  gh run view "$RUN_ID" --log-failed
  exit 1
fi

echo ""
echo "✅ CI passed for run ${RUN_ID} (${RUN_URL})"
gh run view "$RUN_ID"
