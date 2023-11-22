/*Autor: Simon Guyon*/
import { Entity } from './entity';

export interface Course extends Entity {
  coursename: string;
  difficulty: Difficulty;
  tutor: string;
  students: string[];
  startDate: Date;
  finishDate?: Date;
  maxParticipants?: number;
  price: string;
  isActive: boolean;
  type: 'Synchronous' | 'Asynchronous';
  courseDay?: string;
  courseTime?: string;
  categories: string[];
}

enum Difficulty {
  Easy = 'Easy',
  Moderate = 'Moderate',
  Advanced = 'Advanced'
}
