import { expect } from 'chai';
import { fixture } from '@open-wc/testing-helpers';
import { html } from 'lit';
import './contractElement';
describe('contractElement', () => {
  it('should render the correct values', async () => {
    const min = 1;
    const max = 20;
    const lang = 'German';
    const element = await fixture(
      html`<app-contract-element min="${min}" max="${max}" lang="${lang}"></app-contract-element>`
    );
    const spans = element.shadowRoot!.querySelector('div');
    expect(spans?.innerText).to.equal('1 - 20$');
  });
});
