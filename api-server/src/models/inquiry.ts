/*Autor: Harry Thünte*/
import { Entity } from './entity';

export interface Inquiry extends Entity {
  userId: number;
  title: string;
  skills: string;
  payEstimate: number;
  language: string;
}
