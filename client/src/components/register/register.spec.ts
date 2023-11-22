/* Autor: Annika Junge */

import { expect } from 'chai';
import { LitElement } from 'lit';
import { fixture } from '@open-wc/testing-helpers';
import './register';
import sinon from 'sinon';
import { httpClient } from '../../http-client';

describe('app-sign-up', () => {
  let element: LitElement;

  before(async () => {
    element = await fixture('<app-sign-up></app-sign-up>');
  });

  describe('app-sign-up', () => {
    it('should render the title "Register"', async () => {
      const h1Elem = element.shadowRoot!.querySelector('h1') as HTMLElement;
      expect(h1Elem.innerText).to.equal('Register');
    });
    it('should have a form element', async () => {
      const form = element.shadowRoot!.querySelector('form') as HTMLFormElement;
      expect(form).to.exist;
    });
    it('should display an error message when name input is invalid', async () => {
      const nameInput = element.shadowRoot!.querySelector('#name') as HTMLInputElement;
      nameInput.value = '123';
      nameInput.dispatchEvent(new Event('input'));

      const invalidFeedback = element.shadowRoot!.querySelector('#name ~ .invalid-feedback') as HTMLElement;
      const expectedErrorMessage = 'Name is required and must not contain any numbers or similar';

      expect(invalidFeedback.innerText.trim()).to.equal(expectedErrorMessage.trim());
    });
    it('should render the inputs', async () => {
      const nameElement = element.shadowRoot!.getElementById('name') as HTMLInputElement;
      expect(nameElement).to.have.property('type', 'text');
      const lastnameElement = element.shadowRoot!.getElementById('lastname') as HTMLInputElement;
      expect(lastnameElement).to.have.property('type', 'text');
      const birthdayElement = element.shadowRoot!.getElementById('birthday') as HTMLInputElement;
      expect(birthdayElement).to.have.property('type', 'date');
      const emailElement = element.shadowRoot!.getElementById('email') as HTMLInputElement;
      expect(emailElement).to.have.property('type', 'email');
    });
    it('should render the interests', async () => {
      const interests = [
        'Java',
        'Python',
        'JavaScript',
        'C++',
        'Ruby',
        'Go',
        'Swift',
        'PHP',
        'Rust',
        'TypeScript',
        'Kotlin',
        'C#',
        'HTML',
        'CSS',
        'SQL',
        'React',
        'Angular',
        'Vue.js',
        'Node.js',
        'Express.js'
      ];

      sinon.stub(httpClient, 'get').returns(
        Promise.resolve({
          json() {
            return Promise.resolve(interests);
          }
        } as Response)
      );

      const elem = (await fixture('<app-sign-up></app-sign-up>')) as LitElement;
      await elem.updateComplete;

      const interestsElements = elem.shadowRoot!.querySelectorAll('.interest');
      expect(interestsElements.length).to.equal(40); // 40 because it should be rendered for the interest and the skills
    });
  });
});
