/* Autor: Marvin Schulze Berge */

import { expect } from 'chai';
import { UserSession } from './user-session.js';
import { Bubble } from '../../src/models/bubble.js';

describe('/bubbles', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  describe('/createBubble', () => {
    it('should return a proper bubble json document', async () => {
      const response = await userSession.post('bubbles/createBubble', {
        name: 'TestBubble',
        image: 'test.jpg',
        description: ['This is a test bubble'],
        interests: ['Testing', 'E2E']
      });
      expect(response.status).to.equal(201);
      const json = (await response.json()) as Record<string, string>;
      expect(json.name).to.equal('TestBubble');
      expect(json.image).to.equal('test.jpg');
      expect(json.description[0]).to.equal('This is a test bubble');
      expect(json.interests[0]).to.equal('Testing');
      expect(json.interests[1]).to.equal('E2E');
      await userSession.delete('/bubbles/delete/' + json.id);
    });
  });

  describe('/getAllBubbles', () => {
    it('should return a list with all bubbles', async () => {
      const response = await userSession.get('bubbles/getAllBubbles');
      expect(response.status).to.equal(200);
      const json = (await response.json()) as { results: Array<Bubble> };
      const len = json.results.length;
      const bubble = await userSession.post('bubbles/createBubble', {
        name: 'TestBubble',
        image: 'test.jpg',
        description: ['This is a test bubble'],
        interests: ['Testing', 'E2E']
      });
      const response2 = await userSession.get('bubbles/getAllBubbles');
      expect(response2.status).to.equal(200);
      const json2 = (await response2.json()) as { results: Array<Bubble> };
      expect(json2.results.length).to.equal(len + 1);
      await userSession.delete('/bubbles/delete/' + json2.results[0].id);
    });
  });

  describe('/get/:id', () => {
    it('return the bubble', async () => {
      const bubble = await userSession.post('bubbles/createBubble', {
        name: 'TestBubble',
        image: 'test.jpg',
        participants: ['7f846621-15d7-4c03-9223-547f5c32459d'],
        description: ['This is a test bubble'],
        interests: ['Testing', 'E2E']
      });
      const json = (await bubble.json()) as Record<string, string>;
      const response = await userSession.get('bubbles/' + json.id);
      expect(response.status).to.equal(200);
      await userSession.delete('/bubbles/delete/' + json.id);
    });
  });
});
