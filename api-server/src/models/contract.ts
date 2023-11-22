/*Autor: Harry Thünte*/
import { Entity } from './entity';

export interface Contract extends Entity {
  userId: string;
  title: string;
  requirements: string;
  budgetMin: number;
  budgetMax: number;
  language: string;
  deadline: Date;
}
