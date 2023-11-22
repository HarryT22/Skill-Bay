/* Autor: Annika Junge */

import { expect } from 'chai';
import { fixture } from '@open-wc/testing-helpers';
import './change-email';

describe('app-change-email', () => {
  it('should render the title "Change Email"', async () => {
    const element = await fixture('<app-change-email></app-change-email>');
    const h1Elem = element.shadowRoot!.querySelector('h1') as HTMLElement;
    expect(h1Elem.innerText).to.equal('Change Email');
  });
  it('should render the input "Email"', async () => {
    const element = await fixture('<app-change-email></app-change-email>');
    const inputElement = element.shadowRoot!.getElementById('email') as HTMLInputElement;
    expect(inputElement).to.have.property('type', 'email');
  });
});
