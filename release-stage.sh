#!/usr/bin/env bash
#
# Releases the staging frontend: https://stage.kiloeichi.ir, from the develop branch.
# Everything it does is in release.sh; this only names the environment.
set -euo pipefail
exec "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/release.sh" stage "$@"
