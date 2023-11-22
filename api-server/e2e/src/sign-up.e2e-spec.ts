/* Autor: Annika Junge */

import { expect } from 'chai';
import { UserSession } from './user-session.js';

describe('/sign-up', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  it('should fail password does not meet the reqirements', async () => {
    const response = await userSession.post('/users/sign-up', {
      ...userSession.signUpData(),
      password: 'Test1234',
      passwordCheck: 'Test1234'
    });
    expect(response.status).to.equal(400);
    const responseBody = await response.json();
    expect(responseBody).to.have.property('message', 'The password does not meet the requirements');
  });

  it('should fail passwords do not match', async () => {
    const response = await userSession.post('/users/sign-up', {
      ...userSession.signUpData(),
      password: 'Test1234!',
      passwordCheck: 'Test123'
    });
    expect(response.status).to.equal(400);
    const responseBody = await response.json();
    expect(responseBody).to.have.property('message', 'The passwords do not match');
  });

  it('should fail password not permitted', async () => {
    const response = await userSession.post('/users/sign-up', {
      ...userSession.signUpData(),
      password: 'P@ssword!1',
      passwordCheck: 'P@ssword!1'
    });
    expect(response.status).to.equal(400);
    const responseBody = await response.json();
    expect(responseBody).to.have.property('message', 'Your Password is not permitted');
  });

  it('should fail email not valid', async () => {
    const response = await userSession.post('/users/sign-up', {
      ...userSession.signUpData(),
      email: 'Halloooo.hallooo!'
    });
    expect(response.status).to.equal(400);
    const responseBody = await response.json();
    expect(responseBody).to.have.property('message', 'Please use a valide email adress!');
  });

  it('should fail user not 18 years old', async () => {
    const response = await userSession.post('/users/sign-up', {
      ...userSession.signUpData(),
      birthday: '2010-05-15'
    });
    expect(response.status).to.equal(400);
    const responseBody = await response.json();
    expect(responseBody).to.have.property('message', 'You must be at least 18 years old to sign up');
  });
  it('should fail username already exists', async () => {
    const response = await userSession.post('/users/sign-up', {
      ...userSession.signUpData(),
      username: 'lisamüller1'
    });
    expect(response.status).to.equal(400);
    const responseBody = await response.json();
    expect(responseBody).to.have.property('message', 'The username already exists');
  });
  it('should fail user not logged in', async () => {
    const response = await userSession.get('/users/secure');
    expect(response.status).to.equal(401);
  });

  it('should succeed given proper credentials', async () => {
    const response = await userSession.post('/users/sign-up', userSession.signUpData());
    expect(response.status).to.equal(201);
    const responseBody = await response.json();
    expect(responseBody).to.have.property('message', 'user signed up and registered with test account!');
  });
});

describe('/sign-out', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
  });

  afterEach(async () => {
    userSession.deleteUser();
  });

  it('should sign-out user when logged in', async () => {
    await userSession.registerUser();
    await userSession.post('/users/sign-in', userSession.signInData());
    const signedOut = await userSession.delete('/users/sign-out');
    expect(signedOut.status).to.equal(200);
    const responseBody = await signedOut.json();
    expect(responseBody).to.have.property('message', 'sign out successful');
    const secure = await userSession.get('users/secure');
    expect(secure.status).to.equal(401);
    userSession.deleteUser();
  });
});
