/* Autor: Marvin Schulze Berge*/

import {Entity} from './entity'

export interface Bubble extends Entity {
    name: string;
    image: string;
    participants: string[];
    description: string[];
    interests: string[];
}
  