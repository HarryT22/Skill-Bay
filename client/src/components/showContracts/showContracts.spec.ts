/*Autor: Harry Thünte*/

import { expect } from 'chai';
import { fixture } from '@open-wc/testing-helpers';
import { LitElement } from 'lit';
import './showContracts';
import sinon from 'sinon';
import { httpClient } from '../../http-client';

describe('showContracts', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should fetch the tasks on first update', async () => {
    const stub = sinon.stub(httpClient, 'get');
    const element = (await fixture('<app-show-contract></app-show-contract>')) as LitElement;
    await element.updateComplete;
    expect(stub.calledOnce).to.be.true;
  });

  it('should render the fetched tasks', async () => {
    const tasks = {
      id: '1',
      title: 'Software Developer',
      requirements: 'testtest',
      userId: '7f846621-15d7-4c03-9223-547f5c32459d',
      budgetMin: 20,
      budgetMax: 200,
      language: 'German',
      createdAt: 1684926666901
    };

    sinon.stub(httpClient, 'get').returns(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: tasks });
        }
      } as Response)
    );

    const element = (await fixture('<app-show-contract></app-show-contract>')) as LitElement;
    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    const taskElems = element.shadowRoot!.querySelectorAll('div');
    expect(taskElems.length).to.equal(5);
  });
});
