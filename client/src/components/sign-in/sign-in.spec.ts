/* Autor: Annika Junge */

import { expect } from 'chai';
import { fixture } from '@open-wc/testing-helpers';
import './sign-in';

describe('app-sign-in', () => {
  it('should render the title "Login"', async () => {
    const element = await fixture('<app-sign-in></app-sign-in>');
    const h1Elem = element.shadowRoot!.querySelector('h1') as HTMLElement;
    expect(h1Elem.innerText).to.equal('Login');
  });
  it('should render the input "Username"', async () => {
    const element = await fixture('<app-sign-in></app-sign-in>');
    const inputElement = element.shadowRoot!.getElementById('usernameOrEmail') as HTMLInputElement;
    expect(inputElement).to.have.property('type', 'text');
  });

  it('should render the input "Password"', async () => {
    const element = await fixture('<app-sign-in></app-sign-in>');
    const inputElement = element.shadowRoot!.getElementById('password') as HTMLInputElement;
    expect(inputElement).to.have.property('type', 'password');
  });
});
