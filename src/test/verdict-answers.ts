import type { Verdict } from '../lib/gauge';
import type { Answers } from '../lib/score';

const pick = (letters: string): Answers =>
  Object.fromEntries(letters.split('').map((l, i) => [`q${i + 1}`, l]));

/** Q1..Q7 answers that end in each final verdict. */
export const ANSWERS: Record<Verdict, Answers> = {
  bash: pick('bbbabbb'),
  'bash-1call': pick('aabbaaa'),
  burn: pick('ccccaac'),
  'let-it-write': pick('bbbabbc'),
};
