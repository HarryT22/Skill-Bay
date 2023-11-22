/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */
/* Autor: Marvin Schulze Berge */

import express from 'express';
import path from 'node:path';
import http, { IncomingMessage } from 'node:http';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import WebSocket from 'ws';
import config from '../config.json' assert { type: 'json' };

export async function start() {
  const basedir = fileURLToPath(path.dirname(import.meta.url));
  const clientDir = path.join(basedir, '..', config.client.dir);

  const app = express();
  app.get('/', (_, res) => res.redirect('/app/index.html'));
  app.use('/app', express.static(clientDir));
  app.use('/app', (_, res) => res.sendFile(path.join(clientDir, 'index.html')));

  const createOptions = () => {
    const basedir = fileURLToPath(path.dirname(import.meta.url));
    const certDir = path.join(basedir, 'certs');
    return {
      key: fs.readFileSync(path.join(certDir, 'server.key.pem')),
      cert: fs.readFileSync(path.join(certDir, 'server.cert.pem')),
      ca: fs.readFileSync(path.join(certDir, 'intermediate-ca.cert.pem'))
    };
  };
  
  const httpServer = config.server.https ? https.createServer(createOptions(), app) : http.createServer(app);

  // Create WebSocket server
  const wss = new WebSocket.Server({ server: httpServer });

  const userSockets = new Map();

  wss.on('connection', (ws: WebSocket, request) => {
    console.log('Server-side request received');
    if (request.url) {
      const url = new URL(request.url, 'http://localhost:8080'); // Create a URL object from the request URL
      const userId = url.searchParams.get('userId'); // Access the 'userId' query parameter
      userSockets.set(userId, ws);

      ws.on('message', (message: string) => {
        const messageData = JSON.parse(message);
        // Get the recipient's WebSocket connection
        const recipientWs = userSockets.get(messageData.receiverId);
        console.log(Array.from(userSockets.keys()));
        console.log('Message receiver: ' + messageData.receiverId);
        // If the recipient is online, send them the message
        if (recipientWs) {
          recipientWs.send(message);
          console.log('Message sent');
        } else {
          console.log('No receiver for message');
        }
      });

      ws.on('close', () => {
        // Remove the WebSocket connection when it's closed
        userSockets.delete(userId);
      });
    }
  });

  await new Promise<void>(resolve => {
    httpServer.listen(config.server.port, () => {
      console.log(`WebServer running at http${config.server.https ? 's' : ''}://localhost:${config.server.port}`);
      resolve();
    });
  });
  return async () => await new Promise<void>(resolve => httpServer.close(() => resolve()));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  start();
}
