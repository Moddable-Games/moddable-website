#!/bin/bash
# fire-routine.sh
# Manually fires a Moddable Games Claude Code routine via its API trigger URL.
# Use this to recover missed scheduled runs or trigger a routine on demand.
#
# Usage: ./fire-routine.sh <routine>
#   ./fire-routine.sh research
#   ./fire-routine.sh implementation
#   ./fire-routine.sh triage
#   ./fire-routine.sh research-b
#   ./fire-routine.sh implementation-b
#
# Requires: curl, a Claude API key with access to the routines endpoint.
# Copy this file to your local machine and add your API key before running.
# Never commit the key — keep this file as the safe reference copy.

ANTHROPIC_API_KEY="YOUR_ANTHROPIC_API_KEY_HERE"

# Routine API fire URLs
RESEARCH_URL="https://api.anthropic.com/v1/claude_code/routines/trig_01LnV8dQzRy1R35j2kP5iBq7/fire"
IMPLEMENTATION_URL="https://api.anthropic.com/v1/claude_code/routines/trig_01JQPz1wg2R3jbJuDYC5iJBi/fire"
TRIAGE_URL="https://api.anthropic.com/v1/claude_code/routines/trig_01SFuiAPF4vEb6coS4ais6z6/fire"
RESEARCH_B_URL="https://api.anthropic.com/v1/claude_code/routines/trig_01RbRYDhjcJv255kW35V24Wu/fire"
IMPLEMENTATION_B_URL="https://api.anthropic.com/v1/claude_code/routines/trig_0125Lpb7ewAMDrMusVjJZKqW/fire"

fire() {
  NAME=$1; URL=$2
  echo "Firing $NAME..."
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST \
    -H "Authorization: Bearer $ANTHROPIC_API_KEY" \
    -H "Content-Type: application/json" \
    "$URL")
  [ "$HTTP" = "200" ] || [ "$HTTP" = "201" ] || [ "$HTTP" = "202" ] \
    && echo "  ✓ $NAME fired (HTTP $HTTP)" \
    || echo "  ✗ $NAME failed (HTTP $HTTP)"
}

case "${1,,}" in
  research)         fire "Research Routine"       "$RESEARCH_URL" ;;
  implementation)   fire "Implementation Routine" "$IMPLEMENTATION_URL" ;;
  triage)           fire "Triage Time"            "$TRIAGE_URL" ;;
  research-b)       fire "Research B"             "$RESEARCH_B_URL" ;;
  implementation-b) fire "Implementation B"       "$IMPLEMENTATION_B_URL" ;;
  all)
    fire "Research Routine"       "$RESEARCH_URL"
    fire "Implementation Routine" "$IMPLEMENTATION_URL"
    fire "Triage Time"            "$TRIAGE_URL"
    fire "Research B"             "$RESEARCH_B_URL"
    fire "Implementation B"       "$IMPLEMENTATION_B_URL"
    ;;
  *)
    echo "Usage: ./fire-routine.sh <routine>"
    echo "  research | implementation | triage | research-b | implementation-b | all"
    exit 1
    ;;
esac

echo ""
echo "Done."
