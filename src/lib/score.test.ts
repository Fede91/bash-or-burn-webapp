import { describe, expect, it } from 'vitest';
import en from '../i18n/en.json';
import it_ from '../i18n/it.json';
import { questions } from '../data/questions';
import { finalVerdict, flagsOf, provisionalZone, runningTotal, score, type Answers } from './score';

const all = (id: string): Answers => Object.fromEntries(questions.map((q) => [q.id, id]));
const pts = (qid: string, aid: string) =>
  questions.find((q) => q.id === qid)!.answers.find((a) => a.id === aid)!.points;

/** Answers with the given Q1..Q7 letters. */
const pick = (letters: string): Answers =>
  Object.fromEntries(letters.split('').map((l, i) => [`q${i + 1}`, l]));

describe('runningTotal', () => {
  // The spec and the Gauge say -14..+14, but the real points give -13..+11.
  it('has real range -13 (all a) to +11 (all c)', () => {
    expect(runningTotal(all('a'))).toBe(-13);
    expect(runningTotal(all('c'))).toBe(11);
  });

  it('is 0 for empty answers and ignores unknown ids', () => {
    expect(runningTotal({})).toBe(0);
    expect(runningTotal({ q1: 'z', nope: 'a' })).toBe(0);
  });

  it('sums only the answered questions', () => {
    expect(runningTotal({ q1: 'c', q3: 'a' })).toBe(pts('q1', 'c') + pts('q3', 'a'));
  });
});

describe('cut boundaries', () => {
  // q4 'a' keeps the ibrido flag off, so only the total decides.
  it('-4 is bash', () => {
    const a = pick('bbbabbb');
    expect(runningTotal(a)).toBe(-4);
    expect(finalVerdict(a)).toBe('bash');
    expect(provisionalZone(a)).toBe('bash');
  });

  it('-3 is let-it-write', () => {
    const a = pick('bbbabbc');
    expect(runningTotal(a)).toBe(-3);
    expect(finalVerdict(a)).toBe('let-it-write');
  });

  it('+4 is let-it-write', () => {
    const a = pick('ccccaab');
    expect(runningTotal(a)).toBe(4);
    expect(finalVerdict(a)).toBe('let-it-write');
  });

  it('+5 is burn', () => {
    const a = pick('ccccaac');
    expect(runningTotal(a)).toBe(5);
    expect(finalVerdict(a)).toBe('burn');
    expect(provisionalZone(a)).toBe('burn');
  });
});

describe('ibrido flag override', () => {
  it('only q4.b carries the flag', () => {
    expect(flagsOf(pick('aabbaaa'))).toEqual(['ibrido']);
    expect(flagsOf(pick('aaacaaa'))).toEqual([]);
  });

  it('beats a bash total when Q3 is a or b', () => {
    for (const q3 of ['a', 'b']) {
      const a = { ...all('a'), q3, q4: 'b' };
      expect(runningTotal(a)).toBeLessThanOrEqual(-4);
      expect(finalVerdict(a)).toBe('bash-1call');
    }
  });

  it('beats a burn total when Q3 is not c', () => {
    const a = { ...all('c'), q3: 'b', q4: 'b' };
    expect(runningTotal(a)).toBeGreaterThanOrEqual(5);
    expect(finalVerdict(a)).toBe('bash-1call');
  });

  it('does not apply when Q3 is c', () => {
    const a = { ...all('c'), q4: 'b' };
    expect(finalVerdict(a)).toBe('burn');
  });

  it('is never a provisional zone', () => {
    expect(provisionalZone({ ...all('a'), q4: 'b' })).toBe('bash');
  });
});

describe('empty and partial answers', () => {
  it('empty is total 0, let-it-write', () => {
    expect(provisionalZone({})).toBe('let-it-write');
    expect(score({})).toEqual({
      total: 0,
      flags: [],
      verdict: 'let-it-write',
      topFactors: [],
    });
  });

  it('provisional zone follows the running total', () => {
    expect(provisionalZone({ q1: 'a', q2: 'a', q3: 'a' })).toBe('bash');
    expect(provisionalZone({ q1: 'c', q2: 'c', q3: 'c' })).toBe('burn');
  });
});

describe('score', () => {
  it('returns the 2 largest factors, ties by question order', () => {
    const s = score(pick('abcabcb'));
    expect(s.topFactors).toEqual([
      { questionId: 'q1', answerId: 'a', points: -2 },
      { questionId: 'q3', answerId: 'c', points: 2 },
    ]);
  });

  it('returns fewer factors when fewer answered', () => {
    expect(score({ q2: 'c' }).topFactors).toHaveLength(1);
  });
});

describe('questions data', () => {
  it('has 7 questions with 3 answers', () => {
    expect(questions).toHaveLength(7);
    for (const q of questions) expect(q.answers.map((a) => a.id)).toEqual(['a', 'b', 'c']);
  });

  it('has every i18n key in both languages', () => {
    const keys = questions.flatMap((q) => [
      q.title,
      q.hint,
      ...q.answers.flatMap((a) => [a.label, a.hint, ...(a.note ? [a.note] : [])]),
    ]);
    for (const k of keys) {
      expect(it_).toHaveProperty([k]);
      expect(en).toHaveProperty([k]);
    }
  });

  it('has the only flag on q4.b and the only note on q7.b', () => {
    const flagged = questions.flatMap((q) =>
      q.answers.filter((a) => a.flag).map((a) => `${q.id}.${a.id}:${a.flag}`),
    );
    const noted = questions.flatMap((q) =>
      q.answers.filter((a) => a.note).map((a) => `${q.id}.${a.id}`),
    );
    expect(flagged).toEqual(['q4.b:ibrido']);
    expect(noted).toEqual(['q7.b']);
  });
});
