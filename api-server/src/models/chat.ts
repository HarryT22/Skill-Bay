/* Autor: Marvin Schulze Berge*/

import {Entity} from './entity'

export interface Chat extends Entity {
    participants: string[]; //UserIDs
}
