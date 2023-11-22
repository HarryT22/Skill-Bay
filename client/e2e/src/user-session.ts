/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */
/* Autor: Annika Junge */

import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { BrowserContext } from 'playwright';
import config from './config.js';

export class UserSession {
  name: string;
  lastname: string;
  username: string;
  email: string;
  birthday: string;
  image: string;
  highestDegree: string;
  type: string;
  subject: string;
  interests: string[];
  skills: string[];
  inquirys: string[];
  contracts: string[];
  password: string;
  verified: boolean;
  activated: boolean;
  token?: string;

  constructor(public context: BrowserContext) {
    const uuid = uuidv4();
    this.name = `nametest`;
    this.lastname = `lastnametest`;
    this.username = `username${uuid}`;
    this.email = `email${uuid}@example.org`;
    this.birthday = `2000-10-06`;
    this.image = '';
    this.highestDegree = 'Graduation';
    this.subject = 'Informatics';
    this.type = 'Client';
    this.interests = ['Java'];
    this.skills = ['Python'];
    this.inquirys = [];
    this.contracts = [];
    this.verified = true;
    this.activated = true;
    this.password = `pw_${uuid}T!`;
  }

  signInData() {
    return { usernameOrEmail: this.username, password: this.password };
  }

  signUpData() {
    return {
      name: this.name,
      lastname: this.lastname,
      username: this.username,
      email: this.email,
      birthday: this.birthday,
      highestDegree: this.highestDegree,
      type: this.type,
      subject: this.subject,
      interests: this.interests,
      skills: this.skills,
      password: this.password,
      passwordCheck: this.password,
      verified: this.verified,
      activated: this.activated
    };
  }

  async registerUser() {
    const response = await fetch(config.serverUrl('/users/sign-up'), {
      method: 'POST',
      body: JSON.stringify(this.signUpData()),
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(response);
    const cookie = response.headers.raw()['set-cookie'].find(cookie => cookie.startsWith('jwt-token'));
    if (!cookie) {
      throw new Error('Failed to extract jwt-token');
    }

    this.token = cookie.split('=')[1].split(';')[0];
    await this.context.addCookies([
      { name: 'jwt-token', value: this.token!, domain: new URL(config.serverUrl('')).hostname, path: '/' }
    ]);
    console.log('done');
  }

  async deleteUser() {
    const response = await fetch(config.serverUrl('/users/delete-user'), {
      method: 'DELETE',
      headers: { Cookie: `jwt-token=${this.token}` }
    });
    if (response.status !== 200) {
      throw new Error('Failed to delete user for token ' + this.token);
    }
    await this.context.clearCookies();
  }
}
