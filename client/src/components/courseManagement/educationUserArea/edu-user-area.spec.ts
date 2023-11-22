/* Autor: Simon Guyon */
import { expect } from 'chai';
import sinon from 'sinon';
import { fixture } from '@open-wc/testing-helpers';
import { LitElement } from 'lit';
import { httpClient } from '../../../http-client.js';
import './edu-user-area';

describe('app-course-user-area', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should render the component', async () => {
    const element = (await fixture('<app-course-user-area></app-course-user-area>')) as LitElement;
    expect(element).to.exist;
  });

  it('should fetch user and courses on first update', async () => {
    const stub = sinon
      .stub(httpClient, 'get')
      .onFirstCall()
      .resolves(new Response(JSON.stringify({ result: { id: '1', name: 'Test User', verified: true } })))
      .onSecondCall()
      .resolves(new Response(JSON.stringify({ results: [{ id: '1', coursename: 'Test Course' }] })));
    const element = (await fixture('<app-course-user-area></app-course-user-area>')) as LitElement;
    await element.updateComplete;
    expect(stub.calledTwice).to.be.true;
  });
});
