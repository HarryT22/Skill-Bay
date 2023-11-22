/* Autor: Simon Guyon */
import { expect } from 'chai';
import sinon from 'sinon';
import { fixture } from '@open-wc/testing-helpers';
import { LitElement } from 'lit';
import { httpClient } from '../../../http-client.js';
import './my-courses';

describe('app-my-courses', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should render the component', async () => {
    const element = (await fixture('<app-my-courses></app-my-courses>')) as LitElement;
    expect(element).to.exist;
  });

  it('should fetch user and courses on first update', async () => {
    const stub = sinon
      .stub(httpClient, 'get')
      .onFirstCall()
      .resolves(new Response(JSON.stringify({ result: { id: '1', name: 'Test User', verified: true } })))
      .onSecondCall()
      .resolves(new Response(JSON.stringify({ results: [{ id: '1', coursename: 'Test Course' }] })))
      .onThirdCall()
      .resolves(new Response(JSON.stringify({ results: [{ id: '1', coursename: 'Test Course' }] })))
      .onCall(3)
      .resolves(new Response(JSON.stringify({ results: [{ id: '1', coursename: 'Test Course' }] })));
    const element = (await fixture('<app-my-courses></app-my-courses>')) as LitElement;
    await element.updateComplete;
    expect(stub.callCount).to.equal(4);
  });
});
