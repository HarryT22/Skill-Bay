/* Autor: Annika Junge */

import pg from 'pg';

import config from '../config.json' assert { type: 'json' };

const { Client } = pg;

const client = new Client({
  user: config.db.connect.user,
  host: config.db.connect.host,
  database: config.db.connect.database,
  password: config.db.connect.password,
  port: config.db.connect.port.psql
});

async function createScheme() {
  await client.connect();
  await client.query('DROP TABLE IF EXISTS users');
  await client.query(`CREATE TABLE user(
    id VARCHAR(40) PRIMARY KEY,
    "createdAt" bigint NOT NULL,
    name VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    birthday VARCHAR(10) NOT NULL,
    image BYTEA,
    highestDegree VARCHAR(100) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    type VARCHAR(10) NOT NULL,
    interests VARCHAR(100)[] NOT NULL,
    skills VARCHAR(100)[] NOT NULL,
    friends VARCHAR(100)[] NOT NULL,
    password VARCHAR(255)),
    verified BOOLEAN NOT NULL default false,
    contracts VARCHAR(100)[] NOT NULL,
    inquirys VARCHAR(100)[] NOT NULL,
    activated BOOLEAN NOT NULL DEFAULT false`);

  await client.query(`CREATE TABLE interest(
  id VARCHAR(40) PRIMARY KEY,
  "createdAt" bigint NOT NULL,
  name VARCHAR(100) NOT NULL,`);
}

createScheme().then(() => {
  client.end();
  console.log('finished');
});
