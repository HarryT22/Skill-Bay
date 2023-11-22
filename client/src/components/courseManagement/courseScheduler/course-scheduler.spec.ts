/* Autor: Simon Guyon */
import { expect } from 'chai';
import sinon from 'sinon';
import { fixture } from '@open-wc/testing-helpers';
import { LitElement } from 'lit';
import './course-scheduler';

describe('Course Scheduler Component', () => {
  afterEach(() => {
    sinon.restore();
  });
});

it('renders a table', async () => {
  const element = (await fixture(`<app-course-scheduler></app-course-scheduler>`)) as LitElement;
  const table = element.shadowRoot!.querySelector('table');
  expect(table).to.exist;
});

it('renders correct number of rows for hours', async () => {
  const element = (await fixture(`<app-course-scheduler></app-course-scheduler>`)) as LitElement;

  const rows = element.shadowRoot!.querySelectorAll('tr');
  expect(rows.length).to.equal(16);
});
