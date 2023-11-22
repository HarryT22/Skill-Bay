/* Autor: Harry Thünte */

import { expect } from 'chai';
import sinon from 'sinon';
import { LitElement } from 'lit';
import { fixture } from '@open-wc/testing-helpers';
import { httpClient } from '../../http-client.js';
import './inquiryDetails.ts';

describe('app-inquiry-details', () => {
  afterEach(() => {
    sinon.restore();
  });
  it('should render the title Contract Details', async () => {
    const element = await fixture('<app-inquiry-details></app-inquiry-details>');
    const h1Elem = element.shadowRoot!.querySelector('h1') as HTMLElement;
    expect(h1Elem.innerText).to.equal('Inquiry Details');
  });

  it('should fetch the contract on first update', async () => {
    const stub = sinon.stub(httpClient, 'get');
    const element = (await fixture('<app-inquiry-details></app-inquiry-details>')) as LitElement;
    await element.updateComplete;
    expect(stub.calledOnce).to.be.true;
  });

  it('should render the title Inquiry Details', async () => {
    const element = await fixture('<app-inquiry-details></app-inquiry-details>');
    const h1Elem = element.shadowRoot!.querySelector('h1') as HTMLElement;
    expect(h1Elem.innerText).to.equal('Inquiry Details');
  });
});
