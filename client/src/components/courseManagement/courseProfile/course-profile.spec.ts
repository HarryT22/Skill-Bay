import { expect } from 'chai';
import sinon from 'sinon';
import { fixture } from '@open-wc/testing-helpers';
import { httpClient } from '../../../http-client.js';
import { LitElement } from 'lit';
import './course-profile';

describe('app-course-profile', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should fetch the course on first update', async () => {
    const stub = sinon.stub(httpClient, 'get');
    const element = (await fixture('<app-course-profile></app-course-profile>')) as LitElement;
    await element.updateComplete;
    expect(stub.calledOnce).to.be.true;
  });

  it('should render course details', async () => {
    const course = {
      difficulty: 'Easy',
      maxParticipants: 10,
      price: '100',
      startDate: '2023-06-16',
      finishDate: '2023-12-16',
      type: 'Synchronous',
      courseDay: 'Monday',
      courseTime: '10:00'
    };

    sinon.stub(httpClient, 'get').returns(
      Promise.resolve({
        json() {
          return Promise.resolve({ result: course });
        }
      } as Response)
    );

    const element = (await fixture('<app-course-profile></app-course-profile>')) as LitElement;
    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    const difficultyElem = element.shadowRoot!.getElementById('difficulty') as HTMLSelectElement;
    expect(difficultyElem.value).to.equal(course.difficulty);
  });
});
