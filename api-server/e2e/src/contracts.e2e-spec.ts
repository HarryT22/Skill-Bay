/* Autor: Harry Thünte */

import { expect } from 'chai';
import { UserSession } from './user-session.js';
import { Contract } from '../../src/models/contract.js';

describe('/contracts', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  describe('/create', () => {
    it('should return a proper task json document', async () => {
      const response = await userSession.post('/contracts/create', {
        userId: '7f846621-15d7-4c03-9223-547f5c32459d',
        title: 'Testcontract 1',
        requirements: 'req',
        budgetMin: 10,
        budgetMax: 20,
        deadline: '2023-05-26'
      });
      expect(response.status).to.equal(201);
      const json = (await response.json()) as Record<string, string>;
      expect(json.title).to.equal('Testcontract 1');
      expect(json.requirements).to.equal('req');
      expect(json.budgetMin).to.equal(10);
      expect(json.budgetMax).to.equal(20);
      expect(json.deadline).to.equal('2023-05-26');
      await userSession.delete('/contracts/delete/' + json.id);
    });
  });

  describe('/all', () => {
    it('should return a list with all contracts', async () => {
      const response = await userSession.get('/contracts/all');
      expect(response.status).to.equal(200);
      const json = (await response.json()) as { results: Array<Contract> };
      const leng = json.results.length;
      const contract = await userSession.post('/contracts/create', {
        userId: '7f846621-15d7-4c03-9223-547f5c32459d',
        title: 'Testcontract 1',
        requirements: 'req',
        budgetMin: 10,
        budgetMax: 20,
        deadline: '2023-05-26'
      });
      const jsond = (await contract.json()) as Record<string, string>;

      const response2 = await userSession.get('/contracts/all');
      expect(response2.status).to.equal(200);
      const json2 = (await response2.json()) as { results: Array<Contract> };
      expect(json2.results.length).to.equal(leng + 1);
      await userSession.delete('/contracts/delete/' + jsond.id);
    });
  });

  describe('/personal', () => {
    it('should return an empty list of tasks given a new user', async () => {
      const response = await userSession.get('/contracts/personal');
      expect(response.status).to.equal(200);
      const json = (await response.json()) as { results: Array<Contract> };
      expect(json.results.length).to.equal(0);
    });

    it('return the created contract', async () => {
      const contract = await userSession.post('/contracts/create', {
        userId: 'f868d583-0a19-4408-a33d-9b0ca942c177',
        title: 'Testcontract 1',
        requirements: 'req',
        budgetMin: 10,
        budgetMax: 20,
        deadline: '2023-05-26'
      });
      const jsond = (await contract.json()) as Record<string, string>;

      const response = await userSession.get('/contracts/personal');
      const json = (await response.json()) as { results: Array<Contract> };
      expect(json.results[0].title).to.equal('Testcontract 1');
      await userSession.delete('/contracts/delete/' + jsond.id);
    });
  });

  describe('/get/:id', () => {
    it('return the contract', async () => {
      const contract = await userSession.post('/contracts/create', {
        userId: 'f868d583-0a19-4408-a33d-9b0ca942c177',
        title: 'Testcontract 1',
        requirements: 'req',
        budgetMin: 10,
        budgetMax: 20,
        deadline: '2023-05-26'
      });
      const jsond = (await contract.json()) as Record<string, string>;
      const response = await userSession.get('/contracts/get/' + jsond.id);
      const json = (await response.json()) as Record<string, string>;
      expect(json.title).to.equal('Testcontract 1');
      await userSession.delete('/contracts/delete/' + jsond.id);
    });
  });

  describe('/update/:id', () => {
    it('return the created contract', async () => {
      const response = await userSession.post('/contracts/create', {
        userId: 'f868d583-0a19-4408-a33d-9b0ca942c177',
        title: 'Testcontract 1',
        requirements: 'req',
        budgetMin: 10,
        budgetMax: 20,
        deadline: '2023-05-26'
      });
      const json = (await response.json()) as Record<string, string>;
      await userSession.patch('/contracts/update/' + json.id, { title: 'UPDATED TITLE' });
      const response2 = await userSession.get('/contracts/get/' + json.id);
      const json2 = (await response2.json()) as Record<string, string>;
      expect(json2.title).to.equal('UPDATED TITLE');
      await userSession.delete('/contracts/delete/' + json.id);
    });
  });

  describe('/delete/:id', () => {
    it('should delete the contract and return status 200', async () => {
      const response = await userSession.post('/contracts/create', {
        userId: 'f868d583-0a19-4408-a33d-9b0ca942c177',
        title: 'Testcontract 1',
        requirements: 'req',
        budgetMin: 10,
        budgetMax: 20,
        deadline: '2023-05-26'
      });
      const json = (await response.json()) as Record<string, string>;
      const result = await userSession.delete('/contracts/delete/' + json.id);
      expect(result.status).to.equal(200);
    });
  });

  describe('/bookings', () => {
    it('should be empty given a new user', async () => {
      const response = await userSession.get('/contracts/bookings');
      const json = (await response.json()) as { results: Array<Record<string, string>> };
      expect(json.results.length).to.equal(0);
    });
  });

  describe('/addBookings', () => {
    it('should have one entry', async () => {
      const response = await userSession.post('/contracts/create', {
        userId: 'f868d583-0a19-4408-a33d-9b0ca942c177',
        title: 'Testcontract 1',
        requirements: 'req',
        budgetMin: 10,
        budgetMax: 20,
        deadline: '2023-05-26',
        language: 'German'
      });
      const json = (await response.json()) as Record<string, string>;
      const response2 = await userSession.post('/contracts/addBookings', { id: json.id });
      expect(response2.status).to.equal(200);
      await userSession.delete('/contracts/delete/' + json.id);
    });
  });
});
