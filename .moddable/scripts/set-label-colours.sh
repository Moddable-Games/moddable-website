#!/bin/bash
# set-label-colours.sh
# Sets GitHub label colours across all 6 Moddable-Games repos.
# Creates the label if it doesn't exist, updates colour if it does.
#
# Usage: ./set-label-colours.sh
# Requires: curl, a GitHub personal access token with repo scope
#
# Copy this file to your local machine and add your token before running.
# Never commit the token — keep this file as the safe reference copy.

GITHUB_TOKEN="YOUR_GITHUB_TOKEN_HERE"

REPOS=("moddable-website" "moddable-chess" "moddable-hexmaps" "moddable-rules" "moddable-decks" "dungeon-chess")

set_label() {
  REPO=$1; LABEL=$2; COLOUR=$3
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
    -X PATCH \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/repos/Moddable-Games/$REPO/labels/$LABEL" \
    -d "{\"color\":\"$COLOUR\"}")
  if [ "$HTTP" = "200" ]; then
    echo "  ✓ $LABEL → #$COLOUR"
  elif [ "$HTTP" = "404" ]; then
    HTTP2=$(curl -s -o /dev/null -w "%{http_code}" \
      -X POST \
      -H "Authorization: Bearer $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      "https://api.github.com/repos/Moddable-Games/$REPO/labels" \
      -d "{\"name\":\"$LABEL\",\"color\":\"$COLOUR\"}")
    [ "$HTTP2" = "201" ] && echo "  ✓ $LABEL created → #$COLOUR" || echo "  ✗ $LABEL failed (create HTTP $HTTP2)"
  else
    echo "  ✗ $LABEL failed (HTTP $HTTP)"
  fi
}

for REPO in "${REPOS[@]}"; do
  echo "--- $REPO ---"
  set_label "$REPO" "research"       "0075ca"
  set_label "$REPO" "ready"          "0e8a16"
  set_label "$REPO" "discuss"        "e4e669"
  set_label "$REPO" "blocked"        "d93f0b"
  set_label "$REPO" "needs-decision" "cc317c"
  set_label "$REPO" "waiting"        "bfd4f2"
  set_label "$REPO" "next"           "ffffff"
done

echo ""
echo "Done."
