/* Autor: Annika Junge */

import { expect } from 'chai';
import { fixture } from '@open-wc/testing-helpers';
import './email-verification';

describe('app-email-verification', () => {
  it('should render the title "Email Verification"', async () => {
    const element = await fixture('<app-email-verification></app-email-verification>');
    const h1Elem = element.shadowRoot!.querySelector('h1') as HTMLElement;
    expect(h1Elem.innerText).to.equal('Please Verify Your Email');
  });
  it('should render the email verification form', async () => {
    const element = await fixture('<app-email-verification></app-email-verification>');
    const codeElement = element.shadowRoot!.getElementById('code') as HTMLInputElement;
    expect(codeElement).to.have.property('type', 'number');
    expect(element.shadowRoot!.querySelector('input#code')).to.exist;
    expect(element.shadowRoot!.querySelector('button[type="button"]')).to.exist;
  });
});
