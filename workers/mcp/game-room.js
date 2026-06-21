export class GameRoom {
  constructor(state, env) {
    this.state = state;
    this.sessions = [];
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.state.acceptWebSocket(server);
      this.sessions.push(server);
      return new Response(null, { status: 101, webSocket: client });
    }

    if (url.pathname.endsWith('/ping')) {
      await this.state.storage.put('ping', Date.now());
      const val = await this.state.storage.get('ping');
      return new Response(JSON.stringify({ ok: true, stored: val }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('GameRoom OK', { status: 200 });
  }

  webSocketMessage(ws, message) {
    for (const session of this.sessions) {
      if (session.readyState === WebSocket.READY_STATE_OPEN) {
        session.send(JSON.stringify({ echo: message, ts: Date.now() }));
      }
    }
  }

  webSocketClose(ws) {
    this.sessions = this.sessions.filter(s => s !== ws);
  }
}
