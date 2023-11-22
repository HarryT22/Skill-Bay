/* Autor: Simon Guyon */
import { LitElement, html, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { PageMixin } from '../../page.mixin';
import { customElement, state } from 'lit/decorators.js';
import { httpClient } from '../../../http-client.js';
import { router } from '../../../router/router.js';

import sharedStyle from '../../shared.css?inline';
import componentStyle from './my-courses.css?inline';

interface Course {
  id: string;
  coursename: string;
}
interface User {
  id: string;
  name: string;
  verified: boolean;
  username: string;
}
@customElement('app-my-courses')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MyCoursesComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @state() private myCurrentCourses: Course[] = [];
  @state() private myPastCourses: Course[] = [];
  @state() private myCourses: Course[] = [];
  @state() private myTutorCourses: Course[] = [];
  @state() private user = {} as User;

  async firstUpdated() {
    try {
      this.startAsyncInit();
      const response = await httpClient.get('courses/myCourses');
      this.myCourses = (await response.json()).results;
      const response2 = await httpClient.get('/courses/myTutorCourses');
      this.myTutorCourses = (await response2.json()).results;
      const response3 = await httpClient.get('courses/myUser');
      const user = await response3.json();
      this.user = user;
      const response4 = await httpClient.get('/courses/myCurrentCourses');
      this.myCurrentCourses = (await response4.json()).results;
      this.myPastCourses = this.myCourses.filter(
        course => !this.myCurrentCourses.some(currentCourse => currentCourse.id === course.id)
      );
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

  render() {
    return html`
      <div class="courses">
        <h1>Current courses</h1>
        ${
          this.myCurrentCourses.length > 0
            ? repeat(
                this.myCurrentCourses,
                course => course.id,
                course => html`
                  <div class="course-tile" @click="${() => this.showCourseDisplay(course.id)}">
                    <span>${course.coursename}</span>
                  </div>
                `
              )
            : html`<div class="empty-message">You have no current courses.</div>`
        }
      </div>
      <div class="courses">
        <h1>Past courses</h1>
        ${
          this.myPastCourses.length > 0
            ? repeat(
                this.myPastCourses,
                course => course.id,
                course => html`
                  <div class="course-tile" @click="${() => this.showCourseDisplay(course.id)}">
                    <span>${course.coursename}</span>
                  </div>
                `
              )
            : html`<div class="empty-message">You have no past courses.</div>`
        }
          </div>
        ${
          this.user.verified
            ? html`
                <div class="courses">
                  <h1>My tutored courses</h1>
                  ${this.myTutorCourses.length > 0
                    ? repeat(
                        this.myTutorCourses,
                        course => course.id,
                        course => html`
                          <div class="course-tile" @click="${() => this.showCourseDisplay(course.id)}">
                            <span>${course.coursename}</span>
                          </div>
                        `
                      )
                    : html`<div class="empty-message">You are not tutoring any courses yet.</div>`}
                </div>
              `
            : nothing
        }
      </div>
    `;
  }
  async showCourseDisplay(id: string) {
    router.navigate(`edu/my-courses/display/${id}/${this.user.name}`);
  }
}
