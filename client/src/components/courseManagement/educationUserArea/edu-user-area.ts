/* Autor: Simon Guyon */
import { LitElement, html, nothing } from 'lit';
import { PageMixin } from '../../page.mixin';
import { customElement, state } from 'lit/decorators.js';
import { httpClient } from '../../../http-client.js';
import { router } from '../../../router/router.js';

import sharedStyle from '../../shared.css?inline';
import componentStyle from './edu-user-area.css?inline';

interface User {
  id: string;
  name: string;
  verified: boolean;
}
@customElement('app-course-user-area')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class EduUserAreaComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @state() private user = {} as User;
  @state() private courseCount = 0;
  @state() private faqOpen = false;

  async firstUpdated() {
    try {
      this.startAsyncInit();
      const response = await httpClient.get('/courses/myUser');
      console.log(JSON.stringify(response));
      const user = await response.json();
      this.user = user;
      const courseResponse = await httpClient.get('courses/all');
      const courses = (await courseResponse.json()).results;
      this.courseCount = courses.length;
    } catch (e) {
      if ((e as { statusCode: number }).statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.showNotification((e as Error).message, 'error');
      }
    } finally {
      this.finishAsyncInit();
    }
  }

  toggleFaq() {
    this.faqOpen = !this.faqOpen;
  }

  render() {
    return html`
      ${this.renderNotification()}
      <h1>Welcome to the &#127758; of our courses ${this.user.name} &#128075;!</h1>
      <h4>Find out for yourself what you can discover and learn!</h4>
      <div id="area">
        <div class="button-container">
          <h3>Find new courses here:</h3>
          <a href="edu/overview"><button>🔍 Find courses</button></a>
        </div>
        <div class="button-container">
          <h3>Manage and visit your courses here:</h3>
          <a href="edu/my-courses"><button>📜 My courselist</button></a>
        </div>
        ${this.user.verified
          ? html`
              <div class="button-container">
                <h3>Create your own course here:</h3>
                <a href="edu/create"><button>&#128421; Become a tutor</button></a>
              </div>
            `
          : nothing}
      </div>
      <div id="courseCount">Currently we can offer you a total of <b> ${this.courseCount}</b> courses!</div>
      <div id="calendar">
        <app-course-scheduler></app-course-scheduler>
      </div>
      <div id="faq">
        <button @click="${this.toggleFaq}">FAQ's ${this.faqOpen ? '▲' : '▼'}</button>
        ${this.faqOpen
          ? html`
              <div class="faq-content">
                <div class="faq-question">How can I become a tutor?</div>
                <div class="faq-answer">
                  To become a verified tutor, you need to have a degree higher than graduation and your subject should
                  not be 'other'. Once you meet these criteria, you will be automatically verified as a tutor.
                </div>
                <div class="faq-question">Do I have to pay for a course?</div>
                <div class="faq-answer">
                  Ultimately yes, however at the moment we are testing our services and are not expecting users to have
                  a valid payment method. Instead we would like you to enjoy the launch of our website and benefit as
                  much as possible during your stay without paying. :)
                </div>
                <div class="faq-question">How much of the course fees do I receive as a tutor on this plattform?</div>
                <div class="faq-answer">
                  We as publishers of Skill-Bay highly appreciate the work of our tutors. A tutor receives 85% of the
                  user's fee, as we are providing a space to link humans from all over the world, we would like to
                  guarentee the safety and well-being of our user's. Therefore this commision is necessary to maintain
                  the website.
                </div>
                <div class="faq-question">Why are courses only scheduled once a week?</div>
                <div class="faq-answer">
                  In cooperation with experts from different areas of teaching and education we found that this is
                  optimal for learning. However, this counts only for synchronous courses as we would like you to
                  experience a learning curve with the group. By offering courses max. once a week, we make sure users
                  don't get overloaded with content. We are keen to teach our tutors to provide their students with the
                  suitable of course work as well.
                </div>
                <div class="faq-anouncer">&#8615; Soon you will find more FAQ's here &#8615;</div>
              </div>
            `
          : nothing}
      </div>
    `;
  }
}
