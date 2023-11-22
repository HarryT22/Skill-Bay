/* Autor: Annika Junge */

import { expect } from 'chai';
import { UserSession } from './user-session.js';

describe('/profile-functions', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  it('should delete the user', async () => {
    await userSession.registerUser();
    await userSession.post('/users/sign-in', userSession.signInData());
    const secure = await userSession.get('users/secure');
    expect(secure.status).to.equal(200);
    const deleted = await userSession.delete('/users/delete-user');
    expect(deleted.status).to.equal(200);
  });
  it('should change the password', async () => {
    await userSession.registerUser();
    await userSession.post('/users/sign-in', userSession.signInData());
    const response = await userSession.patch('/users/change-password', {
      password: userSession.password,
      newPassword: 'Test1234!!',
      passwordCheck: 'Test1234!!'
    });
    expect(response.status).to.equal(201);
    const responseBody = await response.json();
    expect(responseBody).to.have.property('message', 'Changed password');
  });
  it('should return the currrent email address', async () => {
    await userSession.registerUser();
    await userSession.post('/users/sign-in', userSession.signInData());
    const response = await userSession.get('/users/email');
    expect(response.status).to.equal(200);
    const responseBody = (await response.json()) as { email: string };
    expect(responseBody.email).to.deep.equal(userSession.email);
  });
  it('should update the user', async () => {
    await userSession.registerUser();
    await userSession.post('/users/sign-in', userSession.signInData());
    const response = await userSession.patch('/users/update-user', {
      ...userSession.signUpData(),
      name: 'test',
      lastname: 'test'
    });
    expect(response.status).to.equal(200);
  });
});
