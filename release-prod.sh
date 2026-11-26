#!/usr/bin/env bash
#
# Releases the production frontend: https://kiloeichi.ir, from the main branch.
# Everything it does is in release.sh; this only names the environment.
set -euo pipefail
exec "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/release.sh" prod "$@"
