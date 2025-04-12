import { IncomingMessage } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { Server as HTTPServer } from 'http';

export function runWebSocket(server: HTTPServer) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const ip = req.socket.remoteAddress;
    console.log(`Client connected: ${ip}`);

    ws.on('message', (message: string) => {
      console.log(`Received message: ${message}`);

      wss.clients.forEach((client: WebSocket) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    ws.on('close', () => {
      console.log(`Client disconnected: ${ip}`);
    });
  });

  console.log('WebSocket server running 🚀');
}
