/* Autor: Annika Junge */

export interface User {
  id: string;
  name: string;
  lastname: string;
  email: string;
  type: string;
  image: string;
  highestDegree: string;
  subject: string;
  interests: string[];
  skills: string[];
  verified: boolean;
}
