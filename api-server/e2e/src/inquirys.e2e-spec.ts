/* Autor: Harry Thünte */

import { expect } from 'chai';
import { UserSession } from './user-session.js';
import { Inquiry } from '../../src/models/inquiry.js';

describe('/inquirys', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  describe('/create', () => {
    it('should return a proper inquiry json document', async () => {
      const response = await userSession.post('/inquirys/create', {
        userId: '7f846621-15d7-4c03-9223-547f5c32459d',
        title: 'Testinquiry 1',
        skills: 'req',
        payEstimate: 10,
        language: 'German'
      });
      expect(response.status).to.equal(201);
      const json = (await response.json()) as Record<string, string>;
      expect(json.title).to.equal('Testinquiry 1');
      expect(json.skills).to.equal('req');
      expect(json.payEstimate).to.equal(10);
      await userSession.delete('/inquirys/delete/' + json.id);
    });
  });

  describe('/all', () => {
    it('should return a list with all inquirys', async () => {
      const response = await userSession.get('/inquirys/all');
      expect(response.status).to.equal(200);
      const json = (await response.json()) as { results: Array<Inquiry> };
      const leng = json.results.length;
      const inquiry = await userSession.post('/inquirys/create', {
        userId: '7f846621-15d7-4c03-9223-547f5c32459d',
        title: 'Testinquiry 1',
        requirements: 'req',
        payEstimate: 10
      });
      const jsond = (await inquiry.json()) as Record<string, string>;
      const response2 = await userSession.get('/inquirys/all');
      expect(response2.status).to.equal(200);
      const json2 = (await response2.json()) as { results: Array<Inquiry> };
      expect(json2.results.length).to.equal(leng + 1);
      await userSession.delete('/inquirys/delete/' + jsond.id);
    });
  });

  describe('/personal', () => {
    it('should return an empty list of tasks given a new user', async () => {
      const response = await userSession.get('/inquirys/personal');
      expect(response.status).to.equal(200);
      const json = (await response.json()) as { results: Array<Inquiry> };
      expect(json.results.length).to.equal(0);
    });

    it('return the created inquiry', async () => {
      const inquiry = await userSession.post('/inquirys/create', {
        userId: 'f868d583-0a19-4408-a33d-9b0ca942c177',
        title: 'Testinquiry 1',
        skills: 'req',
        payEstimate: 10
      });
      const jsond = (await inquiry.json()) as Record<string, string>;

      const response = await userSession.get('/inquirys/personal');
      const json = (await response.json()) as { results: Array<Inquiry> };
      expect(json.results[0].title).to.equal('Testinquiry 1');
      await userSession.delete('/inquirys/delete/' + jsond.id);
    });
  });

  describe('/get/:id', () => {
    it('return the inquiry', async () => {
      const inquiry = await userSession.post('/inquirys/create', {
        userId: 'f868d583-0a19-4408-a33d-9b0ca942c177',
        title: 'Testinquiry 1',
        skills: 'req',
        payEstimate: 10
      });
      const jsond = (await inquiry.json()) as Record<string, string>;
      const response = await userSession.get('/inquirys/get/' + jsond.id);
      const json = (await response.json()) as Record<string, string>;
      expect(json.title).to.equal('Testinquiry 1');
      await userSession.delete('/inquirys/delete/' + jsond.id);
    });
  });

  describe('/update/:id', () => {
    it('return the created inquiry', async () => {
      const response = await userSession.post('/inquirys/create', {
        userId: 'f868d583-0a19-4408-a33d-9b0ca942c177',
        title: 'Testinquiry 1',
        skills: 'req',
        payEstimate: 10
      });
      const json = (await response.json()) as Record<string, string>;
      await userSession.patch('/inquirys/update/' + json.id, { title: 'UPDATED TITLE' });
      const response2 = await userSession.get('/inquirys/get/' + json.id);
      const json2 = (await response2.json()) as Record<string, string>;
      expect(json2.title).to.equal('UPDATED TITLE');
      await userSession.delete('/inquirys/delete/' + json.id);
    });
  });

  describe('/delete/:id', () => {
    it('should delete the inquiry and return status 200', async () => {
      const response = await userSession.post('/inquirys/create', {
        userId: 'f868d583-0a19-4408-a33d-9b0ca942c177',
        title: 'Testinquiry 1',
        skills: 'req',
        payEstimate: 10
      });
      const json = (await response.json()) as Record<string, string>;
      const result = await userSession.delete('/inquirys/delete/' + json.id);
      expect(result.status).to.equal(200);
    });
  });

  describe('/bookings', () => {
    it('should be empty given a new user', async () => {
      const response = await userSession.get('/inquirys/bookings');
      const json = (await response.json()) as { results: Array<Record<string, string>> };
      expect(json.results.length).to.equal(0);
    });
  });

  describe('/addBookings', () => {
    it('should have one entry', async () => {
      const response = await userSession.post('/inquirys/create', {
        userId: 'f868d583-0a19-4408-a33d-9b0ca942c177',
        title: 'Testinquiry 1',
        skills: 'skills',
        payEstimate: 10,
        language: 'German'
      });
      const json = (await response.json()) as Record<string, string>;
      const response2 = await userSession.post('/inquirys/addBookings', { id: json.id });
      expect(response2.status).to.equal(200);
      await userSession.delete('/inquirys/delete/' + json.id);
    });
  });
});
