/*Autor: Marvin Schulze Berge*/

import { expect } from 'chai';
import { UserSession } from './user-session.js';
import { FriendRequest } from '../../src/models/friendRequest.js';

describe('/friendRequests', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  describe('/sendFriendRequest', () => {
    it('should send a friend request and return the created friend request', async () => {
      const response = await userSession.post('/friendRequests/sendFriendRequest', {
        receiverId: 12345
      });
      expect(response.status).to.equal(201);
      const json = (await response.json()) as FriendRequest;
      expect(json.receiverId).to.equal(12345);
      await userSession.delete('/friendRequests/delete/' + json.id);
    });
  });

  describe('/delete/:id', () => {
    it('should delete the friend request and return status 200', async () => {
      const response = await userSession.post('/friendRequests/sendFriendRequest', {
        receiverId: 12345
      });
      const json = (await response.json()) as FriendRequest;
      const responseDelete = await userSession.delete(`/friendRequests/delete/${json.id}`);
      expect(responseDelete.status).to.equal(200);
    });
  });
});
