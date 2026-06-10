#!/bin/bash
# Deploy the MCP tools Worker to tools.moddable.games
# Prerequisites:
#   1. Cloudflare DNS: CNAME tools.moddable.games → moddable-tools.msmalley.workers.dev
#   2. wrangler logged in: wrangler login
#   3. Custom domain configured in Cloudflare dashboard or via:
#      wrangler domains add tools.moddable.games

cd "$(dirname "$0")"
wrangler deploy
echo ""
echo "Deployed to:"
echo "  https://tools.moddable.games/"
echo "  https://tools.moddable.games/mcp (MCP SSE)"
echo "  https://tools.moddable.games/api/tools (REST)"
echo "  https://tools.moddable.games/llms.txt"
