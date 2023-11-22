/* Autor: Simon Guyon */
import { expect } from 'chai';
import sinon from 'sinon';
import { fixture } from '@open-wc/testing-helpers';
import './course-overview';
import { httpClient } from '../../../http-client';
import { LitElement } from 'lit';

describe('app-course-overview', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should render the component', async () => {
    (await fixture(`<app-course-overview></app-course-overview>`)) as LitElement;
    const element = document.querySelector('app-course-overview');
    expect(element).to.exist;
  });

  it('shouldn´t fetch courses on first update', async () => {
    const stub = sinon
      .stub(httpClient, 'get')
      .resolves(new Response(JSON.stringify([{ id: '1', coursename: 'Test Course' }])));
    (await fixture(`<app-course-overview></app-course-overview>`)) as LitElement;
    expect(stub.calledOnce).to.be.false;
  });
});
