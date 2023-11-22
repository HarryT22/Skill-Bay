/* Autor: Simon Guyon */
import { expect } from 'chai';
import sinon from 'sinon';
import { fixture } from '@open-wc/testing-helpers';
import './course-display';
import { httpClient } from '../../../http-client';
import { LitElement } from 'lit';

describe('app-course-display', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should render the course name', async () => {
    const element = (await fixture('<app-course-display></app-course-display>')) as any;
    const h1Elem = element.shadowRoot!.querySelector('h1') as HTMLElement;
    expect(h1Elem.innerText).to.equal(element.course.coursename);
  });

  it('should render the course price', async () => {
    const element = (await fixture('<app-course-display></app-course-display>')) as any;
    const priceElem = element.shadowRoot!.getElementById('price') as HTMLElement;
    expect(priceElem.innerText).to.include(element.course.price);
  });

  it('should fetch the course details on connectedCallback', async () => {
    const stub = sinon.stub(httpClient, 'get');
    const element = (await fixture('<app-course-display></app-course-display>')) as LitElement;
    await element.connectedCallback();
    expect(stub.calledTwice).to.be.true;
  });

  it('should navigate to course profile on updateCourse', async () => {
    const element = (await fixture('<app-course-display></app-course-display>')) as any;
    const stub = sinon.stub(element, 'updateCourse');
    const button = element.shadowRoot!.querySelector('button');
    button.click();
    expect(stub.calledOnce).to.be.true;
  });
});
