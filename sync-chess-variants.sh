#!/bin/bash
# Copies chess variants data from moddable-rules into this repo.
# Run after adding/changing variants in moddable-rules.
# Usage: ./sync-chess-variants.sh

set -euo pipefail

RULES_REPO="../moddable-rules"
SRC="$RULES_REPO/dist/moddable-chess/variants.json"
DEST="data/chess-variants.json"

if [ ! -f "$SRC" ]; then
  echo "Error: $SRC not found. Run build-variants-json.sh in moddable-rules first."
  exit 1
fi

cp "$SRC" "$DEST"
COUNT=$(python3 -c "import json; print(len(json.load(open('$DEST'))))")
echo "Synced $COUNT chess variants → $DEST"
