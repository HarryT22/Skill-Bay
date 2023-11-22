/* Autor: Marvin Schulze Berge */

import { expect } from 'chai';
import { UserSession } from './user-session.js';
import { Chat } from '../../src/models/chat.js';

describe('/chat', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  describe('/createChat', () => {
    it('should create a chat and return the created chat', async () => {
      const response = await userSession.post('chats/createChat', {
        receiverId: 'f868d583-0a19-4408-a33d-9b0ca942c177'
      });
      expect(response.status).to.equal(201);
      const json = (await response.json()) as Chat;
      expect(json.participants).to.include('f868d583-0a19-4408-a33d-9b0ca942c177');
      await userSession.delete('/chats/delete/' + json.id);
    });
  });

  describe('/getChatById/:id', () => {
    it('should return the chat with the specified ID', async () => {
      const chat = await userSession.post('chats/createChat', {
        receiverId: 'f868d583-0a19-4408-a33d-9b0ca942c177'
      });
      const json = (await chat.json()) as Chat;
      const response = await userSession.get(`chats/getChatById/${json.id}`);
      console.log(json.participants);
      expect(response.status).to.equal(200);
      const retrievedChat = (await response.json()) as Chat;
      expect(retrievedChat.id).to.equal(json.id);
      expect(retrievedChat.participants).to.include('f868d583-0a19-4408-a33d-9b0ca942c177');
      await userSession.delete('/chats/delete/' + json.id);
    });

    it('should return a 200 status code for non-existent chat ID', async () => {
      const response = await userSession.get('chats/getChatById/nonexistent-id');
      expect(response.status).to.equal(200);
    });
  });
});
