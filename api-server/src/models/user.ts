/* Autor: Annika Junge */

import { Entity } from './entity.js';

export interface User extends Entity {
  name: string;
  lastname: string;
  username: string;
  email: string;
  birthday: string;
  image: string;
  highestDegree: string;
  type: string;
  subject: string;
  interests: string[];
  skills: string[];
  friends: string[];
  password: string;
  //verified for beeing a tutor
  verified: boolean;
  contracts: string[];
  inquirys: string[];
  // email successfull verified
  activated: boolean;
  courses: string[];
}
