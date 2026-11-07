import { UC_A } from './a.ts';
import { UC_B } from './b.ts';
import { UC_C } from './c.ts';
import { UC_D } from './d.ts';
import type { UseCase } from './model.ts';

export { GROUPS } from './model.ts';
export type { UseCase, UcGroup } from './model.ts';
export const USE_CASES: UseCase[] = [...UC_A, ...UC_B, ...UC_C, ...UC_D];
