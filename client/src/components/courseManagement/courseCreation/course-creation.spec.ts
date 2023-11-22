/* Autor: Simon Guyon */
import { expect } from 'chai';
import sinon from 'sinon';
import { fixture } from '@open-wc/testing-helpers';
import './course-creation';
import { httpClient } from '../../../http-client';
import { LitElement } from 'lit';

describe('app-course-create', () => {
  afterEach(() => {
    sinon.restore();
  });
  it('should render the title "Course registration:"', async () => {
    const element = await fixture('<app-course-create></app-course-create>');
    const h1Elem = element.shadowRoot!.querySelector('h1') as HTMLElement;
    expect(h1Elem.innerText).to.equal('Course registration:');
  });

  it('should render the text input "Price:"', async () => {
    const element = await fixture('<app-course-create></app-course-create>');
    const priceInput = element.shadowRoot!.getElementById('price') as HTMLInputElement;
    expect(priceInput.placeholder).to.equal('0.00');
  });

  it('should fetch the skills of a tutor on first update', async () => {
    const stub = sinon.stub(httpClient, 'get');
    const element = (await fixture('<app-course-create></app-course-create>')) as LitElement;
    await element.updateComplete;
    expect(stub.calledOnce).to.be.true;
  });
  it('should reset the form when the "Delete input" button is clicked', async () => {
    const element = await fixture('<app-course-create></app-course-create>');
    const deleteButton = element.shadowRoot!.querySelector('#delete') as HTMLButtonElement;
    const form = element.shadowRoot!.querySelector('form') as HTMLFormElement;
    const resetSpy = sinon.spy(form, 'reset');
    deleteButton.click();
    expect(resetSpy.calledOnce).to.be.true;
  });
  it('should toggle course type correctly', async () => {
    const element = (await fixture('<app-course-create></app-course-create>')) as any;
    const typeSelect = element.shadowRoot!.querySelector('#type') as HTMLSelectElement;
    typeSelect.value = 'Synchronous';
    typeSelect.dispatchEvent(new Event('change'));
    expect(element.courseType).to.equal('Synchronous');
  });

  it('should display error messages when form fields are invalid', async () => {
    const element = (await fixture('<app-course-create></app-course-create>')) as any;
    const showInvalidFieldsSpy = sinon.spy(element, 'showInvalidFields');
    const submitButton = element.shadowRoot!.querySelector('#submit') as HTMLButtonElement;
    submitButton.click();
    expect(showInvalidFieldsSpy.calledOnce).to.be.false;
  });
});
