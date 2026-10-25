import type { Flow } from './types.ts';
import { FLOWS_XDR } from './xdr.ts';
import { FLOWS_INTUNE } from './intune.ts';
import { FLOWS_SCEN } from './scenarios.ts';
import { FLOWS_IA } from './ia.ts';

export const FLOWS: Flow[] = [...FLOWS_XDR, ...FLOWS_INTUNE, ...FLOWS_SCEN, ...FLOWS_IA];
export const FLOW_BY_LESSON: Record<string, Flow> = Object.fromEntries(FLOWS.map((f) => [f.lesson, f]));
