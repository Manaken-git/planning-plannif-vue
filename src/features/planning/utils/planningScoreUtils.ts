import type { Score } from '../types/planning';

export function formatScore(score?: Score | string): string {
  if (!score) return '0hard/0soft';
  if (typeof score === 'string') return score;

  const hard = score.hardScore ?? 0;
  const soft = score.softScore ?? 0;

  return `${hard}hard/${soft}soft`;
}

