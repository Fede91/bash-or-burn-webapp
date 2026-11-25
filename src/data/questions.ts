import type { MessageKey } from '../i18n';
import raw from './questions.json';

export interface Answer {
  id: string;
  label: MessageKey;
  hint: MessageKey;
  points: number;
  flag?: 'ibrido';
  note?: MessageKey;
}

export interface Question {
  id: string;
  title: MessageKey;
  hint: MessageKey;
  answers: Answer[];
}

export const questions = raw as Question[];
