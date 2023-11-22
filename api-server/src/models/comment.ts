/* Autor: Marvin Schulze Berge*/

import {Entity} from './entity'

export interface Comment extends Entity {
    postId: string;
    creator: string;
    text: string;
}