/* Autor: Annika Junge */

import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { PageMixin } from '../page.mixin.js';
import sharedStyle from '../shared.css?inline';
import { router } from '../../router/router.js';
import componentStyle from './change-details.css?inline';

interface User {
  id: string;
  name: string;
  lastname: string;
  type: string;
  image: string;
  highestDegree: string;
  subject: string;
  interests: string[];
  skills: string[];
}

@customElement('app-change-details')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class changeDetailsComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() userId!: string;
  @query('form') private form!: HTMLFormElement;
  @query('#name') private nameElement!: HTMLInputElement;
  @query('#lastname') private lastNameElement!: HTMLInputElement;
  @query('#highestDegree') private highestDegreeElement!: HTMLInputElement;
  @query('#subject') private subjectElement!: HTMLInputElement;
  @state() private image!: string;
  @state() private interests: { name: string }[] = [];
  private userInterests: string[] = [];
  private userSkills: string[] = [];

  private user!: User;

  async firstUpdated() {
    const response = await httpClient.get('/profile/user');
    this.user = await response.json();
    const res = await httpClient.get('users/interests');
    const interest = await res.json();
    this.interests = interest;
    this.userInterests = this.user.interests;
    this.userSkills = this.user.skills;
    this.image = this.user.image;
    this.requestUpdate();
    await this.updateComplete;
  }

  render() {
    return html`
      <div>
        <app-sidebar></app-sidebar>
        ${this.renderNotification()}
        <div id="wrapper">
          <h1>User Information</h1>
          <form novalidate>
            <div class="form-group">
              <div class="image-container">
                <img style="max-width: 200px; max-height: 200px;" src="${this.image}" />
                <br />
                <br />
                <input @change="${this.handleImageChange}" type="file" accept="image/*" id="image" />
              </div>
            </div>
            <div class="form-group">
              <label for="name">Name</label>
              <input
                class="form-control is-invalid"
                id="name"
                .value=${this.user?.name || ''}
                type="text"
                pattern="^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$"
                maxlength="30"
                required
              />
              <div class="invalid-feedback">Name is required and must not contain any numbers or similar</div>
            </div>
            <div class="form-group">
              <label for="lastname">Lastname</label>
              <input
                class="form-control is-invalid"
                id="lastname"
                .value=${this.user?.lastname || ''}
                type="text"
                pattern="^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$"
                maxlength="30"
                required
              />
              <div class="invalid-feedback">Lastname is required and must not contain any numbers or similar</div>
            </div>
            <div class="form-group">
              <div>
                <label>Highest Degree:</label>
                <select id="highestDegree" required>
                  <option></option>
                  <option value="No Degree" ?selected=${this.user?.highestDegree === 'No Degree'}>No Degree</option>
                  <option value="Graduation" ?selected=${this.user?.highestDegree === 'Graduation'}>Graduation</option>
                  <option value="Vocational training" ?selected=${this.user?.highestDegree === 'Vocational training'}>
                    Vocational training
                  </option>
                  <option value="Bachelor (B.Sc.)" ?selected=${this.user?.highestDegree === 'Bachelor (B.Sc.)'}>
                    Bachelor of Science
                  </option>
                  <option value="Master (M.Sc.)" ?selected=${this.user?.highestDegree === 'Master (M.Sc.)'}>
                    Master of Science
                  </option>
                  <option value="Promotion" ?selected=${this.user?.highestDegree === 'Promotion'}>Promotion</option>
                  <option value="other" ?selected=${this.user?.highestDegree === 'other'}>Other</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <div>
                <label>Subject of study/training if you have a degree:</label>
                <select id="subject" required>
                  <option></option>
                  <option value="Informatics" ?selected=${this.user?.subject === 'Informatics'}>Informatics</option>
                  <option value="Business informatics" ?selected=${this.user?.subject === 'Business informatics'}>
                    Business Informatics
                  </option>
                  <option value="Natural Sciences" ?selected=${this.user?.subject === 'Natural Sciences'}>
                    Natural Sciences
                  </option>
                  <option value="Engineer science" ?selected=${this.user?.subject === 'Engineer science'}>
                    Engineer science
                  </option>
                  <option value="something similar" ?selected=${this.user?.subject === 'something similar'}>
                    Something similar
                  </option>
                  <option value="other" ?selected=${this.user?.subject === 'other'}>Other</option>
                </select>
              </div>
            </div>
            <div>
              <label>Choose your interests:</label>
              ${this.interests.map(
                interest => html`<div
                  class="interest ${this.userInterests.includes(interest.name) ? 'selected' : ''}"
                  @click=${() => this.toggleInterest(interest.name)}
                >
                  ${interest.name}
                </div>`
              )}
            </div>
            <div>
              <label>Choose your skills:</label>
              ${this.interests.map(
                skill => html`<div
                  class="interest ${this.userSkills.includes(skill.name) ? 'selected' : ''}"
                  @click=${() => this.toggleSkill(skill.name)}
                >
                  ${skill.name}
                </div>`
              )}
            </div>
            <button type="button" @click="${this.submit}">Save</button>
            <button type="button" @click="${this.cancel}">Cancel</button>
          </form>
        </div>
      </div>
    `;
  }
  cancel() {
    router.navigate('profile');
  }

  async handleImageChange(e: InputEvent) {
    const toBase64 = (file: Blob): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    const input = e.target as HTMLInputElement;
    this.image = await toBase64(input.files![0]);
  }

  toggleInterest(interest: string) {
    if (this.userInterests.includes(interest)) {
      this.userInterests = this.userInterests.filter(i => i !== interest);
    } else {
      this.userInterests.push(interest);
    }
    this.requestUpdate();
  }

  toggleSkill(interest: string) {
    if (this.userSkills.includes(interest)) {
      this.userSkills = this.userSkills.filter(i => i !== interest);
    } else {
      this.userSkills.push(interest);
    }
    this.requestUpdate();
  }

  async submit() {
    if (this.isFormValid()) {
      const updatedUser: User = {
        ...this.user,
        name: this.nameElement.value,
        lastname: this.lastNameElement.value,
        highestDegree: this.highestDegreeElement.value,
        subject: this.subjectElement.value,
        interests: this.userInterests,
        skills: this.userSkills,
        image: this.image
      };
      try {
        const response = await httpClient.patch('users/update-user', updatedUser);
        const json = await response.json();
        this.showNotification(json.message, 'info');
        setTimeout(() => router.navigate('profile'), 1500);
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }
  isFormValid() {
    return this.form.checkValidity();
  }
}
