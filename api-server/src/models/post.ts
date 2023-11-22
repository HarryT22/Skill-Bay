/* Autor: Marvin Schulze Berge*/

import { Entity } from './entity';

export interface Post extends Entity {
  creator: string;
  title: string;
  text: string;
  bubbleId?: string;
}
