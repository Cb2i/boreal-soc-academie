import type { MdcCapability } from '../model.ts';
import { CAPS_D01 } from './d01.ts';
import { CAPS_D02 } from './d02.ts';
import { CAPS_D03 } from './d03.ts';

export const CAPABILITIES: MdcCapability[] = [...CAPS_D01, ...CAPS_D02, ...CAPS_D03];
