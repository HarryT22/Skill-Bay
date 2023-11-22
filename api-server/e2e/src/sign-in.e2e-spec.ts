/* Autor: Annika Junge */

import { expect } from 'chai';
import { UserSession } from './user-session.js';

describe('/sign-in', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
  });

  it('should fail given wrong login data', async () => {
    const response = await userSession.post('/users/sign-in', { ...userSession.signInData(), usernameOrEmail: 'test' });
    expect(response.status).to.equal(401);
  });

  it('should successful login user', async () => {
    await userSession.registerUser();
    const response = await userSession.post('/users/sign-in', userSession.signInData());
    expect(response.status).to.equal(201);
    await userSession.deleteUser();
  });

  it('should succeed when user is logged in', async () => {
    await userSession.registerUser();
    const response = await userSession.get('/users/secure');
    expect(response.status).to.equal(200);
    const responseBody = await response.json();
    expect(responseBody).to.have.property('message', 'User is logged in');
    await userSession.deleteUser();
  });
});
