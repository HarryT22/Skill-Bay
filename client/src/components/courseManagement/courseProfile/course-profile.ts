/* Autor: Simon Guyon */
import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { httpClient } from '../../../http-client.js';
import { router } from '../../../router/router.js';
import { PageMixin } from '../../page.mixin.js';

import sharedStyle from '../../shared.css?inline';
import componentStyle from './course-profile.css?inline';

export interface Course {
  difficulty: Difficulty;
  maxParticipants: number;
  price: string;
  startDate: string;
  finishDate: string;
  type: 'Synchronous' | 'Asynchronous';
  courseDay: string;
  courseTime: string;
}

enum Difficulty {
  Easy = 'Easy',
  Moderate = 'Moderate',
  Advanced = 'Advanced'
}

@customElement('app-course-profile')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class CourseProfileComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() courseId!: string;

  @query('form') private form!: HTMLFormElement;
  @query('#difficulty') private difficulty!: HTMLSelectElement;
  @query('#price') private price!: HTMLInputElement;
  @query('#maxParticipants') private maxParticipants!: HTMLInputElement;
  @query('#startDate') private startDate!: HTMLInputElement;
  @query('#finishDate') private finishDate!: HTMLInputElement;
  @query('#courseDay') private courseDay!: HTMLSelectElement;
  @query('#courseTime') private courseTime!: HTMLInputElement;

  private course!: Course;

  async connectedCallback() {
    super.connectedCallback();
    try {
      const response = await httpClient.get('/courses/get/' + this.courseId);
      this.course = await response.json();
      this.requestUpdate();
      await this.updateComplete;
    } catch (e) {
      if ((e as { statusCode: number }).statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.showNotification((e as Error).message, 'error');
      }
    }
  }

  render() {
    return html`
      <h1>Course Profile</h1>
      <form novalidate>
        <div>
          <label for="difficulty">Difficulty:</label>
          <select id="difficulty" required value=${this.course?.difficulty || ''}>
            <option value="Easy">Easy</option>
            <option value="Moderate">Moderate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label for="price">Price</label>
          <input type="number" id="price" required value=${this.course?.price || ''} />
        </div>
        <div>
          <label for="maxParticipants">Max participants</label>
          <input type="number" id="maxParticipants" required value=${this.course?.maxParticipants || ''} />
        </div>
        <div>
          <label for="startDate">Start date</label>
          <input type="date" id="startDate" required value=${this.course?.startDate || ''} />
        </div>
        <div>
          <label for="finishDate">Finish date</label>
          <input type="date" id="finishDate" required value=${this.course?.finishDate || ''} />
        </div>
        <div>
          <label for="courseDay">Course Day</label>
          <select id="courseDay" required value=${this.course?.courseDay || ''}>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>
        </div>
        <div>
          <label for="courseTime">Course Time</label>
          <input type="time" id="courseTime" required value=${this.course?.courseTime || ''} />
        </div>
        <button type="button" @click="${this.submit}">Save</button>
        <button type="button" @click="${this.cancel}">Cancel</button>
      </form>
    `;
  }

  async submit() {
    if (this.isFormValid()) {
      const updatedCourse: Course = {
        ...this.course,
        difficulty: this.difficulty.value as Difficulty,
        price: this.price.value,
        maxParticipants: Number(this.maxParticipants.value),
        startDate: this.startDate.value,
        finishDate: this.finishDate.value,
        courseDay: this.courseDay.value,
        courseTime: this.courseTime.value
      };
      try {
        await httpClient.patch('/courses/update/' + this.courseId, updatedCourse);
        router.navigate('/edu/my-edu-area');
      } catch (e) {
        if ((e as { statusCode: number }).statusCode === 401) {
          router.navigate('/users/sign-in');
        } else {
          this.showNotification((e as Error).message, 'error');
        }
      }
    } else {
      this.form.classList.add('was-validated');
      this.showInvalidFields();
    }
  }

  isFormValid() {
    let isValid = true;

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const startDate = new Date(this.startDate.value);
    const finishDate = new Date(this.finishDate.value);

    if (!this.startDate.value || startDate < currentDate) {
      this.startDate.setCustomValidity('Start date is required and cannot be in the past.');
      isValid = false;
    } else {
      this.startDate.setCustomValidity('');
    }
    this.startDate.reportValidity();

    if (this.course.type === 'Synchronous') {
      if (!this.finishDate.value || finishDate < startDate) {
        this.finishDate.setCustomValidity(
          'Finish date is required for synchronous courses and cannot be before the start date.'
        );
        isValid = false;
      } else {
        const sixMonthsLater = new Date(startDate.getTime());
        sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

        if (finishDate > sixMonthsLater) {
          this.finishDate.setCustomValidity(
            'Finish date for a synchronous course must be within six months of the start date.'
          );
          isValid = false;
        } else {
          this.finishDate.setCustomValidity('');
        }
      }
    } else {
      this.finishDate.setCustomValidity('');
    }
    this.finishDate.reportValidity();

    if (Number(this.price.value) <= 0) {
      this.price.setCustomValidity('Price must be greater than 0');
      isValid = false;
    } else {
      this.price.setCustomValidity('');
    }
    this.price.reportValidity();

    return isValid;
  }

  showInvalidFields() {
    const elements = this.form.querySelectorAll('input, select');
    elements.forEach(element => {
      const inputElement = element as HTMLInputElement;
      if (!inputElement.validity.valid) {
        inputElement.classList.add('is-invalid');
      }
    });
  }
  cancel() {
    router.navigate('edu/my-edu-area');
  }
}
