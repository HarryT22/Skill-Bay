/* Autor: Marvin Schulze Berge */

import { expect } from 'chai';
import sinon from 'sinon';
import { LitElement, html } from 'lit';
import { fixture, nextFrame } from '@open-wc/testing-helpers';
import { httpClient } from '../../http-client.js';
import './bubbleOverview';

describe('app-bubble-overview', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should render the fetched bubbles', async () => {
    const bubbles = [
      {
        name: 'Bubble 1',
        description: 'Description 1',
        id: '1'
      },
      {
        name: 'Bubble 2',
        description: 'Description 2',
        id: '2'
      }
    ];

    const bubblesResponse = {
      async json() {
        return Promise.resolve({ results: bubbles });
      }
    } as Response;

    const interests = [{ name: 'Interest 1' }, { name: 'Interest 2' }];

    const interestsResponse = {
      async json() {
        return Promise.resolve(interests);
      }
    } as Response;

    const getStub = sinon.stub(httpClient, 'get');

    getStub.withArgs('bubbles/getAllBubbles').returns(Promise.resolve(bubblesResponse));
    getStub.withArgs('users/interests').returns(Promise.resolve(interestsResponse));

    // Create the component
    const element = (await fixture(html`<app-bubble-overview></app-bubble-overview>`)) as LitElement;
    await element.updateComplete;

    // Wait for the component's rendering to complete
    await new Promise(resolve => setTimeout(resolve));

    const bubbleElems = element.shadowRoot!.querySelectorAll('.bubble');
    expect(bubbleElems.length).to.equal(2);
  });

  it('should filter bubbles based on search input', async () => {
    const bubbles = [
      {
        name: 'Bubble 1',
        description: 'Description 1',
        id: '1'
      },
      {
        name: 'Bubble 2',
        description: 'Description 2',
        id: '2'
      },
      {
        name: 'Bubble 3',
        description: 'Description 3',
        id: '3'
      }
    ];

    const bubblesResponse = {
      async json() {
        return Promise.resolve({ results: bubbles });
      }
    } as Response;

    const interests = [{ name: 'Interest 1' }, { name: 'Interest 2' }];

    const interestsResponse = {
      async json() {
        return Promise.resolve(interests);
      }
    } as Response;

    const getStub = sinon.stub(httpClient, 'get');

    getStub.withArgs('bubbles/getAllBubbles').returns(Promise.resolve(bubblesResponse));
    getStub.withArgs('users/interests').returns(Promise.resolve(interestsResponse));

    // Create the component
    const element = (await fixture(html`<app-bubble-overview></app-bubble-overview>`)) as LitElement;
    await element.updateComplete;

    // Wait for the component's rendering to complete
    await new Promise(resolve => setTimeout(resolve));

    const bubbleSearchInput = element.shadowRoot!.querySelector('#bubbleSearchInput') as HTMLInputElement;
    bubbleSearchInput.value = 'Bubble 1';
    bubbleSearchInput.dispatchEvent(new InputEvent('input'));
    await element.updateComplete;

    const bubbleElems = element.shadowRoot!.querySelectorAll('.bubble');
    expect(bubbleElems.length).to.equal(1);
  });

  it('should toggle bubble interests', async () => {
    const bubbles = [
      {
        name: 'Bubble 1',
        description: 'Description 1',
        id: '1'
      }
    ];

    const bubblesResponse = {
      async json() {
        return Promise.resolve({ results: bubbles });
      }
    } as Response;

    const interests = [{ name: 'Interest 1' }, { name: 'Interest 2' }];

    const interestsResponse = {
      async json() {
        return Promise.resolve(interests);
      }
    } as Response;

    const getStub = sinon.stub(httpClient, 'get');

    getStub.withArgs('bubbles/getAllBubbles').returns(Promise.resolve(bubblesResponse));
    getStub.withArgs('users/interests').returns(Promise.resolve(interestsResponse));

    // Create the component
    const element = (await fixture(html`<app-bubble-overview></app-bubble-overview>`)) as LitElement; // Cast the element to BubbleOverviewComponent
    await element.updateComplete;
    await nextFrame(); // Wait for the next rendering frame

    const interestElem = element.shadowRoot!.querySelector('#interest-0') as HTMLElement;
    interestElem.click();
    await element.updateComplete;
    const selectedInterests = Array.from(element.shadowRoot!.querySelectorAll('.interest.selected'));
    expect(selectedInterests.length).to.equal(1);
    expect(selectedInterests[0].textContent?.trim()).to.equal('Interest 1'); // Trim whitespace before asserting
  });
});
