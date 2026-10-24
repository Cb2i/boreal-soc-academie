import type { Verdict } from '../engine/validate.ts';

export interface MechanicProps<E, A> {
  ex: E;
  answer: A;
  onAnswer: (a: A) => void;
  verdict: Verdict | null;
  disabled: boolean;
  announce: (msg: string) => void;
  onSubmit: () => void;
}
