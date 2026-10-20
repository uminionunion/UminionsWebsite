#!/usr/bin/env bash
set -Eeuo pipefail

target="${1:?Pass the merged main commit SHA}"
cd "$(git rev-parse --show-toplevel)"
exec 9>"$(git rev-parse --git-path uminion-deploy.lock)"
flock -n 9 || { echo 'Another VPS deployment is running.' >&2; exit 1; }

if [[ "$(git branch --show-current)" != main ]]; then
  echo 'Deployment checkout must be on main; refusing to change branches automatically.' >&2
  exit 1
fi
git cat-file -e "$target^{commit}"
git merge-base --is-ancestor "$target" origin/main || {
  echo 'Requested deployment commit is not on origin/main.' >&2; exit 1;
}
git merge-base --is-ancestor HEAD "$target" || {
  echo 'VPS has divergent or newer commits; refusing to overwrite them.' >&2; exit 1;
}
if [[ -n "$(git ls-files --unmerged)" ]]; then
  echo 'Resolve the existing Git conflict before deploying.' >&2
  exit 1
fi

stash_oid=''
served_bundle=''
restore_edits() {
  local saved="$stash_oid"
  stash_oid=''
  if [[ -n "$saved" ]]; then
    if ! git stash apply --index "$saved"; then
      echo "Server edits conflict with the update. Preserved stash $saved; resolve conflicts before retrying. Running containers were not replaced." >&2
      return 1
    fi
    if [[ "$(git rev-parse refs/stash)" == "$saved" ]]; then
      git stash drop 'stash@{0}'
    else
      echo "Server edits restored; backup stash $saved retained because another stash was added."
    fi
  fi
}
finish() {
  local status=$?
  trap - EXIT
  if [[ -n "$served_bundle" ]]; then
    rm -f "$served_bundle"
  fi
  if [[ -n "$stash_oid" ]]; then
    restore_edits || status=1
  fi
  if [[ "$status" != 0 ]]; then
    echo 'VPS deployment failed; inspect the error above. No volumes were deleted.' >&2
  fi
  exit "$status"
}
trap finish EXIT

if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  git stash push -m "VPS pre-deploy $target"
  stash_oid="$(git rev-parse refs/stash)"
fi
# Fetch occurred in the workflow. Fast-forward to its exact commit, independent of pull.rebase.
git merge --ff-only "$target"
restore_edits
[[ "$(git rev-parse HEAD)" == "$target" ]]

compose=(docker compose -f docker-compose.yml)
if [[ -f .env.migration ]]; then
  compose=(docker compose --env-file .env.migration -f docker-compose.yml -f docker-compose.migration.yml)
fi
"${compose[@]}" config --quiet
"${compose[@]}" build --no-cache
"${compose[@]}" up -d --wait --wait-timeout 180

curl --fail --silent --show-error --retry 5 --retry-connrefused --retry-delay 2 --max-time 30 \
  http://127.0.0.1:4002/ -o /dev/null
for route in /api/products/store/0 /api/chat/rooms-with-messages /pantry-api/api/pantries; do
  curl --fail --silent --show-error --max-time 30 "http://127.0.0.1:4002$route" -o /dev/null
done
served_bundle="$(mktemp)"
curl --fail --silent --show-error --max-time 30 http://127.0.0.1:4002/uhub/dist/uhub.js -o "$served_bundle"
if ! cmp -s includes/uhub/dist/uhub.js "$served_bundle"; then
  echo 'The live frontend differs from the deployment bundle; check WordPress mounts/caching.' >&2
  exit 1
fi
echo "VPS deployment verified: $target"
