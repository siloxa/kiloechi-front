#!/usr/bin/env bash
#
# Releases the Kiloechi frontend.
#
#   ./release-prod.sh | ./release-stage.sh      (or ./release.sh prod|stage)
#
# The backend's release.sh calls this script with everything already set; run it directly to
# redeploy only the frontend. It builds client/ only — server/ (the Express + node:sqlite API
# used for local development) is not part of the image; nginx proxies /api and /uploads to
# the real kiloechi-back instead (see .nginx/default.conf.template).
#
# One container per environment, so production and staging run side by side:
#
#   environment   port    network               site
#   prod          50182   kiloechi-network        https://kiloeichi.ir
#   stage         50183   kiloechi-stage-network  https://stage.kiloeichi.ir
#
# It builds the image first and swaps the container only once that succeeded, so a broken
# build leaves the site that is already running untouched.
#
# Environment:
#   KILOECHI_SKIP_GIT_PULL=1   deploy the working tree as it is, without pulling
#   KILOECHI_FRONT_PORT        host port to publish (loopback only by default)
#   KILOECHI_FRONT_BIND        host interface to publish on (default 127.0.0.1)
#   KILOECHI_NETWORK           shared Docker network with the backend
set -euo pipefail

cd "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

ENVIRONMENT="${1:-prod}"
case "$ENVIRONMENT" in
    prod | stage) ;;
    -h | --help)
        sed -n '2,24p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
        exit 0
        ;;
    *)
        printf 'Usage: ./release-prod.sh | ./release-stage.sh   (or ./release.sh prod|stage)\n' >&2
        exit 2
        ;;
esac

if [[ "$ENVIRONMENT" == "prod" ]]; then
    : "${KILOECHI_PREFIX:=kiloechi}"
    : "${KILOECHI_FRONT_PROJECT:=kiloechi-front}"
    : "${KILOECHI_FRONT_IMAGE:=kiloechi-front:latest}"
    : "${KILOECHI_FRONT_PORT:=50182}"
    : "${KILOECHI_BRANCH:=main}"
else
    : "${KILOECHI_PREFIX:=kiloechi-stage}"
    : "${KILOECHI_FRONT_PROJECT:=kiloechi-front-stage}"
    : "${KILOECHI_FRONT_IMAGE:=kiloechi-front:stage}"
    : "${KILOECHI_FRONT_PORT:=50183}"
    : "${KILOECHI_BRANCH:=develop}"
fi
: "${KILOECHI_NETWORK:=${KILOECHI_PREFIX}-network}"
export KILOECHI_PREFIX KILOECHI_FRONT_PROJECT KILOECHI_FRONT_IMAGE KILOECHI_FRONT_PORT

SERVICE='kiloechi-front'

log() { printf '\033[1;36m[front:%s]\033[0m %s\n' "$ENVIRONMENT" "$*"; }
fail() {
    printf '\033[1;31m[front:%s] %s\033[0m\n' "$ENVIRONMENT" "$*" >&2
    exit 1
}

command -v docker >/dev/null 2>&1 || fail 'docker is not installed.'
docker compose version >/dev/null 2>&1 || fail 'the docker compose plugin is missing.'
docker info >/dev/null 2>&1 || fail 'the docker daemon is not reachable.'

# The network belongs to the backend stack, and it must be created by that stack. A network
# made by hand lacks compose's labels, and the backend's next deploy then refuses to use it.
# So this never creates one; releasing the backend first is what provides it.
docker network inspect "$KILOECHI_NETWORK" >/dev/null 2>&1 || fail "the network $KILOECHI_NETWORK does not exist yet.
It belongs to the backend stack: release the backend first (./release-$ENVIRONMENT.sh in the backend repository)."

# Deploying the wrong branch to production is the mistake worth being loud about.
current_branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
if [[ "$current_branch" != "$KILOECHI_BRANCH" && "${KILOECHI_ALLOW_BRANCH_MISMATCH:-0}" != "1" ]]; then
    fail "$ENVIRONMENT deploys $KILOECHI_BRANCH, but this checkout is on $current_branch.
Check out $KILOECHI_BRANCH, or set KILOECHI_ALLOW_BRANCH_MISMATCH=1 to deploy anyway."
fi

if [[ "${KILOECHI_SKIP_GIT_PULL:-0}" != "1" ]]; then
    log "pulling the latest sources ($current_branch)"
    git pull --ff-only
else
    log 'skipping git pull'
fi

# Build before anything is torn down: on failure the running site keeps serving.
log "building $KILOECHI_FRONT_IMAGE"
docker compose build --pull

log "starting $KILOECHI_PREFIX-front on port $KILOECHI_FRONT_PORT"
docker compose up -d --remove-orphans --wait --wait-timeout 120

# Prove it over HTTP from the host rather than trusting the container's own state.
probe="http://127.0.0.1:${KILOECHI_FRONT_PORT}/healthz"
for _ in $(seq 1 30); do
    if [[ "$(curl -fsS -o /dev/null -w '%{http_code}' "$probe" 2>/dev/null)" == "200" ]]; then
        log "the frontend is up: http://127.0.0.1:${KILOECHI_FRONT_PORT}"
        exit 0
    fi
    sleep 2
done

log 'the frontend did not answer; its last log lines follow'
docker compose logs --tail 40 "$SERVICE" || true
fail "no answer from $probe"
