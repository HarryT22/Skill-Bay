/* Autor: Simon Guyon */
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PageMixin } from '../../page.mixin';
import { httpClient } from '../../../http-client';
import { router } from '../../../router/router';

import sharedStyle from '../../shared.css?inline';
import componentStyle from './course-scheduler.css?inline';

interface Course {
  coursename: string;
  tutor: string;
  students: string[];
  startDate: Date;
  finishDate?: Date;
  type: 'Synchronous' | 'Asynchronous';
  courseDay?: string;
  courseTime?: string;
}

@customElement('app-course-scheduler')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class CourseSchedulerComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @state() private courses: Course[] = [];
  private coursesLength = 0;

  async firstUpdated() {
    try {
      this.startAsyncInit();
      const response = await httpClient.get('courses/scheduler');
      this.courses = (await response.json()).results;
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
      <div class="table-wrapper">
        <table>
          <tr>
            <th></th>
            <th>Monday</th>
            <th>Tuesday</th>
            <th>Wednesday</th>
            <th>Thursday</th>
            <th>Friday</th>
            <th>Saturday</th>
            <th>Sunday</th>
          </tr>
          ${Array.from({ length: 15 }, (_, i) => i + 7).map(hour => this.renderHour(hour))}
        </table>
      </div>
    `;
  }

  renderHour(hour: string) {
    return html`
      <tr>
        <th>${hour}:00</th>
        ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day =>
          this.renderCourseSlot(day, hour)
        )}
      </tr>
    `;
  }

  renderCourseSlot(day: string, hour: string) {
    const course = this.courses.find(c => c.courseDay === day && parseInt(c.courseTime) === hour);
    return html` <td>${course ? course.coursename : ''}</td> `;
  }
}
