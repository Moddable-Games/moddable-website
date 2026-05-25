#!/bin/bash
# Usage: ./bump.sh [patch|minor|major]
# Reads current version from version.txt, increments, writes everywhere.

set -e

FILE="version.txt"
CURRENT=$(cat "$FILE" | tr -d '[:space:]')

IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"

case "${1:-patch}" in
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  patch) PATCH=$((PATCH + 1)) ;;
  *) echo "Usage: ./bump.sh [patch|minor|major]"; exit 1 ;;
esac

NEW="$MAJOR.$MINOR.$PATCH"

echo "$NEW" > "$FILE"

sed -i '' "s/const VERSION = '.*'/const VERSION = '$NEW'/" js/mg-core.js
sed -i '' "s/var V = '.*'/var V = '$NEW'/" js/mg-loader.js
find . -name '*.html' -not -path './build/*' -print0 | xargs -0 sed -i '' "s/v=[0-9]*\.[0-9]*\.[0-9]*/v=$NEW/g"

echo "Bumped: $CURRENT → $NEW"
