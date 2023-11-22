/* Autor: Harry Thünte */

import { expect } from 'chai';
import sinon from 'sinon';
import { LitElement } from 'lit';
import { fixture } from '@open-wc/testing-helpers';
import { httpClient } from '../../http-client.js';
import './marketplace.js';

describe('app-marketplace', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should fetch the contracts on first update', async () => {
    const contractStub = sinon.stub(httpClient, 'get');
    const element = (await fixture('<app-marketplace></app-marketplace>')) as LitElement;
    await element.updateComplete;
    expect(contractStub.callCount).to.equal(1);
  });

  it('should render the title Contract Details', async () => {
    const element = await fixture('<app-marketplace></app-marketplace>');
    const h1Elem = element.shadowRoot!.querySelector('h1') as HTMLElement;
    expect(h1Elem.innerText).to.equal('Contracts');
  });

  it('should render the fetched contracts', async () => {
    const contracts = [
      {
        id: '1',
        title: 'Software Developer',
        requirements: 'testtest',
        userId: '7f846621-15d7-4c03-9223-547f5c32459d',
        budgetMin: 20,
        budgetMax: 200,
        language: 'German',
        createdAt: 1684926666901
      },
      {
        id: '2',
        title: 'Web Developer',
        requirements: 'testtest',
        userId: '7f846621-15d7-4c03-9223-547f5c32459d',
        budgetMin: 20,
        budgetMax: 200,
        language: 'German',
        createdAt: 1684926666901
      }
    ];

    sinon
      .stub(httpClient, 'get')
      .onFirstCall()
      .returns(
        Promise.resolve({
          json() {
            return Promise.resolve({ results: contracts });
          }
        } as Response)
      );

    const element = (await fixture('<app-marketplace></app-marketplace>')) as LitElement;
    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    const contractElems = element.shadowRoot!.querySelectorAll('app-contract-element');

    expect(contractElems.length).to.equal(2);
  });
});
