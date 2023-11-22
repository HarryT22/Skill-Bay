import { expect } from 'chai';
import { fixture } from '@open-wc/testing-helpers';
import { html } from 'lit';
import './inquiryElement';
describe('inquiryElement', () => {
  it('should render the correct values', async () => {
    const pE = 22;
    const lang = 'German';
    const element = await fixture(html`<app-inquiry-element pE="${pE}" lang="${lang}"></app-inquiry-element>`);
    const div = element.shadowRoot!.querySelector('div');
    expect(div?.innerText).to.equal('22$');
  });
});
