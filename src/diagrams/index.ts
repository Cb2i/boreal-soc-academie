import type { Flow } from './types.ts';
import { FLOWS_XDR } from './xdrFlows.ts';
import { FLOWS_INTUNE } from './intuneFlows.ts';
import { FLOWS_SCEN } from './scenarios.ts';
import { FLOWS_AZURE } from './azure.ts';
import { FLOWS_IA } from './iaFlows.ts';

export const FLOWS: Flow[] = [...FLOWS_XDR, ...FLOWS_INTUNE, ...FLOWS_SCEN, ...FLOWS_IA, ...FLOWS_AZURE];
export const FLOW_BY_LESSON: Record<string, Flow> = Object.fromEntries(FLOWS.map((f) => [f.lesson, f]));
