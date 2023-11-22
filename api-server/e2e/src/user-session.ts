/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */
/* Autor: Annika Junge */

import fetch, { RequestInit, Response } from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import config from './config.js';

export class UserSession {
  name: string;
  lastname: string;
  username: string;
  email: string;
  birthday: string;
  highestDegree: string;
  subject: string;
  type: string;
  interests: string[];
  password: string;
  token?: string;

  private cookies = new Map<string, string>();

  constructor() {
    const uuid = uuidv4();
    this.name = `name-test`;
    this.lastname = `lastname-test`;
    this.username = `username_${uuid}`;
    this.email = `email_${uuid}@example.org`;
    this.birthday = `2002-05-15`;
    this.highestDegree = 'Promotion';
    this.subject = 'Business informatics';
    this.type = `client`;
    this.interests = ['Java'];
    this.password = `pw_${uuid}T!`;
  }

  get(url: string) {
    return this.createFetch('GET', url);
  }

  post(url: string, body: unknown) {
    return this.createFetch('POST', url, body);
  }

  put(url: string, body: unknown) {
    return this.createFetch('PUT', url, body);
  }

  patch(url: string, body: unknown) {
    return this.createFetch('PATCH', url, body);
  }

  delete(url: string) {
    return this.createFetch('DELETE', url);
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
      subject: this.subject,
      type: this.type,
      interests: this.interests,
      password: this.password,
      passwordCheck: this.password
    };
  }

  async registerUser() {
    await this.post('users/sign-up', this.signUpData());
    if (!this.hasCookie('jwt-token')) {
      throw new Error('Failed to extract jwt-token');
    }
  }

  async deleteUser() {
    await this.delete('users/delete-user');
    this.clearCookies();
  }

  private hasCookie(name: string) {
    return this.cookies.has(name);
  }

  private clearCookies() {
    this.cookies.clear();
  }

  private async createFetch(method: string, relUrl: string, body?: unknown) {
    const requestOptions: RequestInit = {
      headers: this.createHeaders(),
      method: method
    };
    if (body) {
      requestOptions.body = JSON.stringify(body);
    }
    const response = await fetch(config.url(relUrl), requestOptions);
    this.parseCookies(response);
    return response;
  }

  private parseCookies(response: Response) {
    const entries = response.headers.raw()['set-cookie'];
    if (entries) {
      for (const entry of entries) {
        const cookie = entry.split(';')[0].split('=');
        const cookieName = cookie[0].trim();
        const cookieValue = cookie[1].trim();
        if (cookieValue) {
          this.cookies.set(cookieName, cookieValue);
        } else {
          this.cookies.delete(cookieName);
        }
      }
    }
  }

  private createHeaders() {
    let headers: Record<string, string> = { 'Content-Type': 'application/json; charset=utf-8' };

    if (this.cookies.size) {
      const cookie = Array.from(this.cookies.entries())
        .map(([name, value]) => `${name}=${value}`)
        .join(';');
      headers = { ...headers, cookie };
    }
    return headers;
  }
}
