/* Autor: Annika Junge */

import { Entity } from './entity';

export interface Token extends Entity {
  userId: string;
  token: string;
  validationCode?: number;
  email: string;
}
