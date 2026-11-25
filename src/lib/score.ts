import { questions } from '../data/questions';
import type { MessageKey } from '../i18n';
import { BASH_MAX, BURN_MIN, zoneFor, type Verdict, type Zone } from './gauge';

/** Question id to answer id. Unanswered questions are absent. */
export type Answers = Record<string, string | undefined>;

export interface Factor {
  questionId: string;
  answerId: string;
  points: number;
}

export interface Score {
  total: number;
  flags: string[];
  verdict: Verdict;
  topFactors: Factor[];
}

function answeredFactors(answers: Answers): Factor[] {
  return questions.flatMap((q) => {
    const answerId = answers[q.id];
    const answer = q.answers.find((a) => a.id === answerId);
    return answer ? [{ questionId: q.id, answerId: answer.id, points: answer.points }] : [];
  });
}

export function runningTotal(answers: Answers): number {
  return answeredFactors(answers).reduce((sum, f) => sum + f.points, 0);
}

export function flagsOf(answers: Answers): string[] {
  return questions.flatMap((q) => {
    const flag = q.answers.find((a) => a.id === answers[q.id])?.flag;
    return flag ? [flag] : [];
  });
}

/** Only a zone: Bash + 1 call never shows before the final verdict. */
export function provisionalZone(answers: Answers): Zone {
  return zoneFor(runningTotal(answers));
}

export function finalVerdict(answers: Answers): Verdict {
  const total = runningTotal(answers);
  if (flagsOf(answers).includes('ibrido') && answers.q3 !== 'c') return 'bash-1call';
  if (total <= BASH_MAX) return 'bash';
  if (total >= BURN_MIN) return 'burn';
  return 'let-it-write';
}

export function score(answers: Answers): Score {
  const topFactors = answeredFactors(answers)
    .map((f, order) => ({ f, order }))
    .sort((x, y) => Math.abs(y.f.points) - Math.abs(x.f.points) || x.order - y.order)
    .slice(0, 2)
    .map(({ f }) => f);
  return {
    total: runningTotal(answers),
    flags: flagsOf(answers),
    verdict: finalVerdict(answers),
    topFactors,
  };
}

/**
 * The two factors shown on the result. Bash + 1 call comes from the `ibrido` flag
 * plus Q3, not from the total, so it shows Q4 and Q3 instead of the largest points.
 */
export function resultFactors(answers: Answers): Factor[] {
  const { verdict, topFactors } = score(answers);
  if (verdict !== 'bash-1call') return topFactors;
  const all = answeredFactors(answers);
  return ['q4', 'q3'].flatMap((id) => all.filter((f) => f.questionId === id));
}

export interface FactorDetail {
  /** 1-based question number. */
  n: number;
  title: MessageKey;
  label: MessageKey;
}

export function factorDetail(factor: Factor): FactorDetail | null {
  const index = questions.findIndex((q) => q.id === factor.questionId);
  const question = questions[index];
  const answer = question?.answers.find((a) => a.id === factor.answerId);
  return question && answer ? { n: index + 1, title: question.title, label: answer.label } : null;
}
