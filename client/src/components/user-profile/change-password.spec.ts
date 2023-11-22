/* Autor: Annika Junge */

import { expect } from 'chai';
import { fixture } from '@open-wc/testing-helpers';
import './change-password';

describe('app-change-password', () => {
  it('should render the title "Change password"', async () => {
    const element = await fixture('<app-change-password></app-change-password>');
    const h1Elem = element.shadowRoot!.querySelector('h1') as HTMLElement;
    expect(h1Elem.innerText).to.equal('Change Password');
  });
  it('should render the input "Password"', async () => {
    const element = await fixture('<app-change-password></app-change-password>');
    const inputElement = element.shadowRoot!.getElementById('password') as HTMLInputElement;
    expect(inputElement).to.have.property('type', 'password');
  });
  it('should render the input "New Password"', async () => {
    const element = await fixture('<app-change-password></app-change-password>');
    const inputElement = element.shadowRoot!.getElementById('new-password') as HTMLInputElement;
    expect(inputElement).to.have.property('type', 'password');
  });
});
