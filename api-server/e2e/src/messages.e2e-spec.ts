/* Autor: Marvin Schulze Berge */

import { expect } from 'chai';
import { UserSession } from './user-session.js';
import { Message } from '../../src/models/message.js';
import { Chat } from '../../src/models/chat.js';
import { cryptoService } from '../../src/services/crypto.service.js';

describe('/messages', () => {
  let userSession: UserSession;
  let chat: Chat;
  const receiverId = 12345;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
    const chatResponse = await userSession.post('/chats/createChat', { receiverId: receiverId });
    chat = (await chatResponse.json()) as Chat;
  });

  afterEach(async () => {
    await userSession.deleteUser();
    await userSession.delete('/chats/delete/' + chat.id);
  });

  describe('/sendMessage', () => {
    it('should send a message and return the created message', async () => {
      const response = await userSession.post('/messages/sendMessage', {
        chatId: chat.id,
        receiverId: receiverId,
        text: 'Hello, how are you?'
      });
      expect(response.status).to.equal(201);
      const json = (await response.json()) as Message;
      expect(json.receiverId).to.equal(receiverId);
      expect(cryptoService.decrypt(json.text)).to.equal('Hello, how are you?');
      await userSession.delete('/messages/delete/' + json.id);
    });
  });

  describe('/getByChatId/:id', () => {
    it('should return a list of messages for the specified chat', async () => {
      await userSession.post('/messages/sendMessage', {
        chatId: chat.id,
        receiverId: receiverId,
        text: 'Hello, how are you?'
      });

      await userSession.post('/messages/sendMessage', {
        chatId: chat.id,
        receiverId: receiverId,
        text: 'Hello again.'
      });

      const response = await userSession.get(`/messages/getByChatId/${chat.id}`);
      expect(response.status).to.equal(200);
      const json = (await response.json()) as { results: Array<Message> };
      // Assert that each message's chatId is correct
      for (const message of json.results) {
        expect(message.chatId).to.equal(chat.id);
      }
      expect(json.results.length).to.equal(2);
      await userSession.delete('/messages/delete/' + json.results[0].id);
      await userSession.delete('/messages/delete/' + json.results[1].id);
    });
  });
});
