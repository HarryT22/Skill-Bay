/* Autor: Simon Guyon */
import { expect } from 'chai';
import sinon from 'sinon';
import { fixture, html } from '@open-wc/testing-helpers';
import { LitElement } from 'lit';
import { httpClient } from '../../../http-client.js';
import './course-dialog';

describe('app-course-dialog', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should render the component', async () => {
    const element = (await fixture(html`<app-course-dialog></app-course-dialog>`)) as LitElement;
    expect(element).to.exist;
  });


  // it('should render the course name', async () => {
  //   const element = (await fixture(html`<app-course-dialog></app-course-dialog>`)) as any;
  //   const courseName = element.shadowRoot!.querySelector('h1');
  //   expect(courseName!.textContent).to.include('Test Course');
  // });

  // it('should call joinCourse when the "Join" button is clicked', async () => {
  //   const element = (await fixture(html`<app-course-dialog></app-course-dialog>`)) as any;
  //   const joinCourseSpy = sinon.spy(element, 'joinCourse');
  //   const joinButton = element.shadowRoot!.querySelector('.join-button') as HTMLButtonElement;
  //   joinButton.click();
  //   expect(joinCourseSpy.calledOnce).to.be.true;
  // });

  it('should render the component', async () => {
    const element = (await fixture(html`<app-course-dialog></app-course-dialog>`)) as LitElement;
    expect(element.shadowRoot).to.exist;
  });

  it('should open and close the dialog', async () => {
    const element = (await fixture(html`<app-course-dialog></app-course-dialog>`)) as any;
    element.open();
    expect(element.style.display).to.equal('block');
    element.close();
    expect(element.style.display).to.equal('none');
  });

  // it('should make a POST request when joinCourse is called', async () => {
  //   const httpClientPostStub = sinon.stub(httpClient, 'post');
  //   const element = (await fixture(html`<app-course-dialog></app-course-dialog>`)) as any;
  //   element.joinCourse();
  //   expect(httpClientPostStub.calledOnce).to.be.true;
  //   expect(httpClientPostStub.calledWith('/courses/joinCourse', { id: 'f50f845d-b52e-4e15-9a94-29bd5a4f0cd1' })).to.be.true;
  // });
});
