/* Autor: Annika Junge */

import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css?inline';
import componentStyle from './registerStyle.css?inline';

@customElement('app-sign-up')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignUpComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @query('form') private form!: HTMLFormElement;
  @query('#name') private nameElement!: HTMLInputElement;
  @query('#lastname') private lastNameElement!: HTMLInputElement;
  @query('#username') private userNameElement!: HTMLInputElement;
  @query('#email') private emailElement!: HTMLInputElement;
  @query('#birthday') private birthdayElement!: HTMLInputElement;
  @query('#highestDegree') private highestDegreeElement!: HTMLInputElement;
  @query('input[type="radio"]:checked') private typeElement!: HTMLInputElement;
  @query('#subject') private subjectElement!: HTMLInputElement;
  @query('#password') private passwordElement!: HTMLInputElement;
  @query('#password-check') private passwordCheckElement!: HTMLInputElement;

  @state() private image!: string;
  @state() private passwordtext =
    'Must contain at least one number and one uppercase and lowercase letter, one special character and at least 8 or more characters, no withespaces';
  @state() private passwordTextForCheck!: string;

  @property() private interests: { name: string }[] = [];

  passwordRegex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&\-_=()])[A-Za-z\d@$!%*#?&\-_=()]{8,}$/);

  private userInterests: string[] = [];
  private userSkills: string[] = [];

  async firstUpdated() {
    try {
      const response = await httpClient.get('users/interests');
      const interest = await response.json();
      this.interests = interest;
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }

  render() {
    return html`
      ${this.renderNotification()}
      <h1>Register</h1>
      <form novalidate>
        <div>
        <label for="name">Name</label>
        <input
            class="form-control is-invalid"
            id="name"
            type="text"
            placeholder="Name"
            pattern="^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$"
            maxlength="50"
            required
          />
          <div class="invalid-feedback">Name is required and must not contain any numbers or similar </div>
        </div>
        <div>
          <label for="lastname">Lastname</label>
          <input
            class="form-control is-invalid"
            id="lastname"
            type="text"
            placeholder="Lastname"
            pattern="^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$"
            maxlength="50"
            required
          />
          <div class="invalid-feedback">Lastname is required and must not contain any numbers or similar</div>
        </div>
        <div>
          <label for="email">E-Mail</label>
          <input
            class="form-control is-invalid"
            id="email"
            type="email"
            placeholder="Email-address"
            pattern="^[a-zA-Z0-9._%+-]*@[a-z]*.[a-z]{2,4}$"
            maxlength="60"
            required
          />
          <div class="invalid-feedback">E-Mail is required and must be valid</div>
        </div>
        <div>
          <label for="username">Username</label>
          <input
            class="form-control is-invalid"
            id="username"
            type="text"
            pattern="^.{4,}$"
            placeholder="Username"
            maxlength="60"
            required
          />
          <div class="invalid-feedback">Username is required und must be at least 4 characters long</div>
        </div>
        <div>
          <label>Birthday:</label>
          <input
            class="form-control is-invalid"
            id="birthday"
            type="date"
            max=${new Date().toISOString().split('T')[0]} 
            required
          />
          <div class="invalid-feedback">Birthday is required and you need to be at least 18 years old to register</div>
        </div>
        <div>
          <label>Profile Picture:</label>
          <input @change="${this.handleImageUpload}" type="file" accept="image/*" id="image" />
        </div>
        <div>
           <label>What would you like to register as:</label>
            <p>If you are an engineer and want to be considered verified, please provide all the following information. If they are not done, you cannot accept orders or become a tutor. 
              As a customer, you can also leave out these fields. Only interests must please be specified by all.</p>
            <div style="display: flex; align-items: center;">
                <input type="radio" id="engineer" name="user_type" value="Engineer">
                <label for="engineer">Engineer</label>
                <input type="radio" id="client" name="user_type" value="Client">
                <label for="client">Client</label>
             </div>
          </div>
          <div>
            <label>Highest Degree:</label>
            <select id="highestDegree" required>
              <option></option>
              <option value="No Degree">No Degree</option>
              <option value="Graduation">Graduation</option>
              <option value="Vocational training">Vocational training</option>
              <option value="Bachelor (B.Sc.)">Bachelor of Science</option>
              <option value="Master (M.Sc.)">Master of Science</option>
              <option value="Promotion">Promotion</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label>Subject of study/training if you have a degree:</label>
            <select id="subject" required>
              <option></option>
              <option value="Informatics">Informatics</option>
              <option value="Business informatics">Business Informatics</option>
              <option value="Natural Sciences">Natural Sciences</option>
              <option value="Engineer science">Engineer science</option>
              <option value="something similar">Something similar</option>
              <option value="other">Other</option>
            </select>
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
            <div>Please select at least one interest</div>
          </div>
          <div>
            <label>Choose your skills when you are an Engineer:</label>
            ${this.interests.map(
              skill => html`<div
                class="interest ${this.userSkills.includes(skill.name) ? 'selected' : ''}"
                @click=${() => this.toggleSkill(skill.name)}
              >
                ${skill.name}
              </div>`
            )}
          </div>
          <div>
            <label for="password">Passwort</label>
            <input type="password" required id="password" @keyup="${this.checkPassword}" />
            <span>${this.passwordtext}</span>
          </div>
          <div>
            <label for="password-check">Passwort nochmals eingeben</label>
            <input type="password" required id="password-check" @input="${this.checkSecondPassword}"/>
            <span>${this.passwordTextForCheck}</span>
          </div>
          <button type="button" @click="${this.submit}">Register now</button>
        </form>
      </form>
    `;
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

  async handleImageUpload(e: InputEvent) {
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

  checkPassword() {
    const password = this.passwordElement.value;
    if (!this.passwordRegex.test(password)) {
      if (password.length < 8) {
        this.passwordtext = 'The password must be at least 8 characters long';
      } else if (!/(?=.*[a-z])/.test(password)) {
        this.passwordtext = 'The password must contain at least one lowercase letter';
      } else if (!/(?=.*[A-Z])/.test(password)) {
        this.passwordtext = 'The password must contain at least one uppercase letter';
      } else if (!/(?=.*\d)/.test(password)) {
        this.passwordtext = 'The password must contain at least one digit';
      } else if (!/(?=.*[@$!%*#?&\-_=()])/.test(password)) {
        this.passwordtext = 'The password must contain at least one special character';
      }
    } else {
      this.passwordtext = 'Good password!';
    }
  }

  checkSecondPassword() {
    if (this.passwordElement.value !== this.passwordCheckElement.value) {
      this.passwordTextForCheck = 'Passwords are not matching!';
    } else {
      this.passwordTextForCheck = 'Passwords are matching now';
    }
  }

  async submit() {
    if (this.form.checkValidity()) {
      if (this.passwordRegex.test(this.passwordElement.value)) {
        if (this.passwordElement.value === this.passwordCheckElement.value) {
          const accountData = {
            name: this.nameElement.value,
            lastname: this.lastNameElement.value,
            username: this.userNameElement.value,
            email: this.emailElement.value,
            birthday: this.birthdayElement.value,
            image: this.image,
            highestDegree: this.highestDegreeElement.value,
            type: this.typeElement.value,
            subject: this.subjectElement.value,
            interests: this.userInterests,
            skills: this.userSkills,
            password: this.passwordElement.value,
            passwordCheck: this.passwordCheckElement.value,
            verified: false
          };
          try {
            const response = await httpClient.post('users/sign-up', accountData);
            const json = await response.json();
            if (json.message === 'user signed up and registered with test account!') {
              router.navigate('landingpage');
            } else {
              this.showNotification(json.message, 'info');
              setTimeout(() => router.navigate('email-verification/' + json.id), 1500);
            }
          } catch (e) {
            this.showNotification((e as Error).message, 'error');
          }
        } else {
          this.showNotification('Passwords do not match.', 'error');
        }
      } else {
        this.showNotification('Password does not meet the requirements.', 'error');
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }
}
