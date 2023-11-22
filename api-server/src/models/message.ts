/* Autor: Marvin Schulze Berge*/

import { Entity } from './entity';

export interface Message extends Entity {
  chatId: string;
  senderId: string;
  receiverId: string;
  text: string;
}
