/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import startDB from './db.js';
import { corsService } from './services/cors.service.js';
import { pathToFileURL } from 'node:url';
// TODO: Routen importieren
import users from './routes/users.js';
import courses from './routes/courses.js';
import contracts from './routes/contracts.js';
import posts from './routes/posts.js';
import config from '../config.json' assert { type: 'json' };
import inquiry from './routes/inquiry.js';
import friendRequests from './routes/friendRequests.js';
import bubbles from './routes/bubbles.js';
import chats from './routes/chats.js';
import messages from './routes/messages.js';
import profile from './routes/profile.js';
import community from './routes/community.js';

function configureApp(app: Express) {
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(corsService.corsMiddleware);
  app.use(function (req, res, next) {
    res.set(
      'Content-Security-Policy',
      "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'"
    );
    res.set('Strict-Transport-Security', 'max-age=31536000');
    res.set('X-Frame-Options', 'DENY');
    res.set('X-XSS-Protection', '1');
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Cross-Origin-Resource-Policy', 'same-origin');
    res.set(
      'Permissions-Policy',
      'accelerometer=(), ambient-light-sensor=(), autoplay=(), camera=(), fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), picture-in-picture=(), web-share=()'
    );
    next();
  });

  app.use('/api/users', users);
  // TODO: Routen einbinden
  app.use('/api/inquirys', inquiry);
  app.use('/api/contracts', contracts);
  app.use('/api/courses', courses);
  app.use('/api/posts', posts);
  app.use('/api/friendRequests', friendRequests);
  app.use('/api/bubbles', bubbles);
  app.use('/api/chats', chats);
  app.use('/api/messages', messages);
  app.use('/api/community', community);
  app.use('/api/profile', profile);
}

export async function start(testmodus: string) {
  const app = express();

  configureApp(app);
  const stopDB = await startDB(app);
  const stopHttpServer = await startHttpServer(app, config.server.port);

  if (testmodus.includes('testmodus')) {
    app.locals.testmodus = true;
  }
  return async () => {
    await stopHttpServer();
    await stopDB();
  };
}
async function startHttpServer(app: Express, port: number) {
  const createOptions = () => {
    const basedir = fileURLToPath(path.dirname(import.meta.url));
    const certDir = path.join(basedir, 'certs');
    return {
      key: fs.readFileSync(path.join(certDir, 'server.key.pem')),
      cert: fs.readFileSync(path.join(certDir, 'server.cert.pem')),
      ca: fs.readFileSync(path.join(certDir, 'intermediate-ca.cert.pem'))
    };
  };
  app.use((req, res, next) => {
    res.set('Content-Security-Policy', "frame-ancestors 'none'");
    next();
  });
  app.use(function (req, res, next) {
    if (req.secure) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    next();
  });

  const httpServer = config.server.https ? https.createServer(createOptions(), app) : http.createServer(app);
  await new Promise<void>(resolve => {
    httpServer.listen(port, () => {
      console.log(`Server running at http${config.server.https ? 's' : ''}://localhost:${port}`);
      resolve();
    });
  });
  return async () => await new Promise<void>(resolve => httpServer.close(() => resolve()));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  start('');
}
