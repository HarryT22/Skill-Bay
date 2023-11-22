/* Autor: Marvin Schulze Berge*/

import { Entity } from './entity';

export interface FriendRequest extends Entity {
  senderId: string;
  receiverId: string;
}


