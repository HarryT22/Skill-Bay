/* Autor: Simon Guyon */
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { httpClient } from '../../../http-client.js';
import { router } from '../../../router/router.js';
import { PageMixin } from '../../page.mixin.js';

import sharedStyle from '../../shared.css?inline';
import componentStyle from './course-display.css?inline';

interface Course {
  id: string;
  coursename: string;
  difficulty: Difficulty;
  tutor: string;
  startDate: Date;
  finishDate: Date;
  maxParticipants?: number;
  price: string;
  type: 'Synchronous' | 'Asynchronous';
  courseDay: string;
  courseTime: string;
  categories: string[];
}

export enum Difficulty {
  Easy = 'Easy',
  Moderate = 'Moderate',
  Advanced = 'Advanced'
}
@customElement('app-course-display')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class CourseDisplayComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() courseId!: string;
  @property() userId!: string;
  @property() tutorName!: string;
  @property() course!: Course;

  async connectedCallback() {
    super.connectedCallback();
    try {
      const response = await httpClient.get('courses/get/' + this.courseId);
      this.course = await response.json();
      const response2 = await httpClient.get('courses/getTutorByCourseIDandUserID/' + this.courseId);
      const tutor1 = await response2.json();
      this.tutorName = `${tutor1.name} ${tutor1.lastname}`;
      const response3 = await httpClient.get('courses/myUser');
      const user = await response3.json();
      this.userId = user.id;
    } catch (e) {
      if ((e as { statusCode: number }).statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.showNotification((e as Error).message, 'error');
      }
    }
  }

  async deleteCourseByTutor() {
    if (confirm('Are you sure you want to delete this course?')) {
      try {
        await httpClient.delete('/courses/deleteByTutor/' + this.courseId);
        router.navigate('/edu/my-edu-area');
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
      }
    }
  }

  async leaveCourse() {
    if (confirm('Are you sure you want to leave this course?')) {
      try {
        await httpClient.delete('/courses/deleteByUser/' + this.courseId);
        router.navigate('/edu/my-edu-area');
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
      }
    }
  }

  async updateCourse() {
    try {
      router.navigate('/edu/course-profile/' + this.courseId);
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }
  render() {
    const startDate = new Date(this.course?.startDate);
    const finishDate = new Date(this.course?.finishDate);
    const formattedStartDate = startDate.toLocaleDateString('en-US');
    const formattedFinishDate = finishDate.toLocaleDateString('en-US');
    return html`
      <div class="display-content">
        <h1>${this.course?.coursename}</h1>
        <div id="category">
          <h3>Languages and skills used:</h3>
          <p>${this.course?.categories.join(', ')}</p>
        </div>
        <div id="difficulty">
          <h3>Difficulty:</h3>
          <p>${this.course?.difficulty}</p>
        </div>
        <div id="tutor">
          <h3>Your tutor:</h3>
          <p>${this.tutorName}</p>
        </div>
        <div id="price">
          <h3>Price:</h3>
          <p>${this.course?.price || ''} Euro</p>
        </div>
        <div id="startDate">
          <h3>Start date:</h3>
          <p>${formattedStartDate || ''}</p>
        </div>
        ${this.course?.type === 'Synchronous'
          ? html`
              <div id="finishDate">
                <h3>Finish date:</h3>
                <p>${formattedFinishDate || ''}</p>
              </div>
              <div id="maxParticipants">
                <h3>Max participants:</h3>
                <p>${this.course?.maxParticipants || ''}</p>
              </div>
              <div id="courseDay">
                <h3>Course day:</h3>
                <p>${this.course?.courseDay || ''}</p>
              </div>
              <div id="courseTime">
                <h3>Course time:</h3>
                <p>${this.course?.courseTime || ''}</p>
              </div>
            `
          : ''}
        <div class="button-container">
          ${this.course && this.userId === this.course.tutor
            ? html`
                <button @click="${this.updateCourse}">Update Course</button>
                <button @click="${this.deleteCourseByTutor}">Delete Course</button>
              `
            : html` <button @click="${this.leaveCourse}">Leave this course</button> `}
        </div>
      </div>
    `;
  }
}
