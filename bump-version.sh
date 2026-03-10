#!/usr/bin/env bash
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: ./bump-version.sh <version>" >&2
  echo "Example: ./bump-version.sh 0.2.0" >&2
  exit 1
fi

version="$1"

if ! [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: version must be in semver format (e.g. 1.2.3)" >&2
  exit 1
fi

root="$(cd "$(dirname "$0")" && pwd)"

# Update package.json
tmp=$(mktemp)
jq --arg v "$version" '.version = $v' "$root/package.json" > "$tmp" && mv "$tmp" "$root/package.json"

# Update static/manifest.json
tmp=$(mktemp)
jq --arg v "$version" '.version = $v' "$root/static/manifest.json" > "$tmp" && mv "$tmp" "$root/static/manifest.json"

echo "Bumped version to $version in package.json and static/manifest.json"

git add .
git commit -m  "version $version"