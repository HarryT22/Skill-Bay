/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import mongodb from 'mongodb';
import pg from 'pg';
import { Express } from 'express';
import { MongoGenericDAO } from './models/mongo-generic.dao.js';
import { PsqlGenericDAO } from './models/psql-generic.dao.js';
import { InMemoryGenericDAO } from './models/in-memory-generic.dao.js';

// TODO: Models importieren
import { Course } from './models/course.js';
import { User } from './models/user.js';
import { Post } from './models/post.js';
import { Contract } from './models/contract.js';
import { Interest } from './models/interest.js';
import { Inquiry } from './models/inquiry.js';
import { FriendRequest } from './models/friendRequest.js';
import { Bubble } from './models/bubble.js';
import { Comment } from './models/comment.js';
import { Message } from './models/message.js';
import { Chat } from './models/chat.js';
import config from '../config.json' assert { type: 'json' };
import { Token } from './models/token.js';
import { cryptoService } from './services/crypto.service.js';

const { MongoClient } = mongodb;
const { Client } = pg;

export default async function startDB(app: Express) {
  switch (config.db.use) {
    case 'mongodb':
      return await startMongoDB(app);
    case 'psql':
      return await startPsql(app);
    default:
      return await startInMemoryDB(app);
  }
}

async function startInMemoryDB(app: Express) {
  // TODO: DAOs erzeugen
  app.locals.inquiryDAO = new InMemoryGenericDAO<Inquiry>();
  app.locals.contractDAO = new InMemoryGenericDAO<Contract>();
  app.locals.userDAO = new InMemoryGenericDAO<User>();
  app.locals.courseDAO = new InMemoryGenericDAO<Course>();
  app.locals.interestDAO = new InMemoryGenericDAO<Interest>();
  app.locals.friendRequestDAO = new InMemoryGenericDAO<FriendRequest>();
  app.locals.bubbleDAO = new InMemoryGenericDAO<Bubble>();
  app.locals.commentDAO = new InMemoryGenericDAO<Comment>();
  app.locals.messageDAO = new InMemoryGenericDAO<Message>();
  app.locals.chatDAO = new InMemoryGenericDAO<Chat>();
  app.locals.tokenDAO = new InMemoryGenericDAO<Token>();
  return async () => Promise.resolve();
}

async function startMongoDB(app: Express) {
  const client = await connectToMongoDB();
  const db = client.db('myapp');
  // TODO: DAOs erzeugen
  app.locals.inquiryDAO = new MongoGenericDAO<Inquiry>(db, 'inquirys');
  app.locals.contractDAO = new MongoGenericDAO<Contract>(db, 'contracts');
  app.locals.userDAO = new MongoGenericDAO<User>(db, 'users');
  app.locals.courseDAO = new MongoGenericDAO<Course>(db, 'courses');
  app.locals.postDAO = new MongoGenericDAO<Post>(db, 'posts');
  app.locals.interestDAO = new MongoGenericDAO<Interest>(db, 'interests');
  app.locals.friendRequestDAO = new MongoGenericDAO<FriendRequest>(db, 'friendRequests');
  app.locals.bubbleDAO = new MongoGenericDAO<Bubble>(db, 'bubbles');
  app.locals.commentDAO = new MongoGenericDAO<Comment>(db, 'comments');
  app.locals.messageDAO = new MongoGenericDAO<Message>(db, 'messages');
  app.locals.chatDAO = new MongoGenericDAO<Chat>(db, 'chats');
  app.locals.tokenDAO = new MongoGenericDAO<Token>(db, 'tokens');

  // Insert initial data for interests
  const interests = [
    { name: 'Java' },
    { name: 'Python' },
    { name: 'JavaScript' },
    { name: 'C++' },
    { name: 'Ruby' },
    { name: 'Go' },
    { name: 'Swift' },
    { name: 'PHP' },
    { name: 'Rust' },
    { name: 'TypeScript' },
    { name: 'Kotlin' },
    { name: 'C#' },
    { name: 'HTML' },
    { name: 'CSS' },
    { name: 'SQL' },
    { name: 'React' },
    { name: 'Angular' },
    { name: 'Vue.js' },
    { name: 'Node.js' },
    { name: 'Express.js' }
  ];

  for (const interest of interests) {
    const existingInterest = await app.locals.interestDAO.findOne({ name: interest.name });
    if (!existingInterest) {
      await app.locals.interestDAO.create(interest);
    }
  }

  const testUser = {
    name: cryptoService.encrypt('Lisa'),
    lastname: cryptoService.encrypt('Müller'),
    email: 'email+test@example.org',
    username: 'lisamüller1',
    birthday: '2000-10-06',
    highestDegree: 'Graduation',
    type: 'Client',
    subject: 'Informatics',
    interests: ['Java'],
    skills: ['Python'],
    password: 'pw_c71ebe32-62cf-407f-9eef-305a85891b57T!',
    passwordCheck: 'pw_c71ebe32-62cf-407f-9eef-305a85891b57T!',
    verified: true,
    activated: true
  };
  const existingUser = await app.locals.userDAO.findOne({ username: testUser.username });
  if (!existingUser) {
    await app.locals.userDAO.create(testUser);
  }
  return async () => await client.close();
}

async function connectToMongoDB() {
  const url = `mongodb://${config.db.connect.host}:${config.db.connect.port.mongodb}`;
  const client = new MongoClient(url, {
    auth: { username: config.db.connect.user, password: config.db.connect.password },
    authSource: config.db.connect.database
  });

  try {
    await client.connect();
  } catch (err) {
    console.log('Could not connect to MongoDB: ', err);
    process.exit(1);
  }

  return client;
}

async function startPsql(app: Express) {
  const client = await connectToPsql();

  // TODO: DAOs erzeugen
  app.locals.inquiryDAO = new PsqlGenericDAO<Inquiry>(client!, 'inquirys');
  app.locals.contractDAO = new PsqlGenericDAO<Contract>(client!, 'contracts');
  app.locals.userDAO = new PsqlGenericDAO<User>(client!, 'users');
  app.locals.courseDAO = new PsqlGenericDAO<Course>(client!, 'courses');
  app.locals.postDAODAO = new PsqlGenericDAO<Course>(client!, 'posts');
  app.locals.interestDAO = new PsqlGenericDAO<Interest>(client!, 'interests');
  app.locals.tokenDAO = new PsqlGenericDAO<Token>(client!, 'tokens');
  app.locals.friendRequestDAO = new PsqlGenericDAO<FriendRequest>(client!, 'friendRequests');
  app.locals.bubbleDAO = new PsqlGenericDAO<Bubble>(client!, 'bubbles');
  app.locals.commentDAO = new PsqlGenericDAO<Comment>(client!, 'comments');
  app.locals.messageDAO = new PsqlGenericDAO<Message>(client!, 'messages');
  app.locals.chatDAO = new PsqlGenericDAO<Chat>(client!, 'chats');

  return async () => await client.end();
}

async function connectToPsql() {
  const client = new Client({
    user: config.db.connect.user,
    host: config.db.connect.host,
    database: config.db.connect.database,
    password: config.db.connect.password,
    port: config.db.connect.port.psql
  });

  try {
    await client.connect();
    return client;
  } catch (err) {
    console.log('Could not connect to PostgreSQL: ', err);
    process.exit(1);
  }
}
