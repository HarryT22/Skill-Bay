/* Autor: Annika Junge */

import { expect } from 'chai';
import { UserSession } from './user-session.js';
import { User } from '../../src/models/user.js';

describe('/profile', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  it('should retrieve the user profile successfully', async () => {
    const expectedProfile = {
      name: 'name-test',
      lastname: 'lastname-test',
      birthday: '2002-05-15',
      highestDegree: 'Promotion',
      subject: 'Business informatics',
      type: 'client',
      interests: ['Java']
    };

    const response = await userSession.get('profile/user');

    const responseBody = await response.json();
    const profile = responseBody as User;

    expect(profile.name).to.equal(expectedProfile.name, 'Incorrect user name');
    expect(profile.lastname).to.equal(expectedProfile.lastname, 'Incorrect user lastname');
    expect(profile.birthday).to.equal(expectedProfile.birthday, 'Incorrect user birthday');
    expect(profile.type).to.equal(expectedProfile.type, 'Incorrect user type');
    expect(profile.interests).to.deep.equal(expectedProfile.interests, 'Incorrect user interests');
  });

  it('should return all possible interests', async () => {
    const response = await userSession.get('/users/interests');
    const checkInterests = [
      'Java',
      'Python',
      'JavaScript',
      'C++',
      'Ruby',
      'Go',
      'Swift',
      'PHP',
      'Rust',
      'TypeScript',
      'Kotlin',
      'C#',
      'HTML',
      'CSS',
      'SQL',
      'React',
      'Angular',
      'Vue.js',
      'Node.js',
      'Express.js'
    ];

    const interests = (await response.json()) as [{ name: string }];
    const interest: string[] = [];
    interests.forEach(e => {
      interest.push(e.name);
    });
    //sort arrays for correct comparison
    interest.sort();
    checkInterests.sort();

    expect(interest).to.deep.equal(checkInterests);
    userSession.deleteUser();
  });
});
