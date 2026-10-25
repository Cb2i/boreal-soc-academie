import type { MdcCapability } from '../model.ts';
import { CAPS_D01 } from './d01.ts';
import { CAPS_D02 } from './d02.ts';
import { CAPS_D03 } from './d03.ts';
import { CAPS_D04 } from './d04.ts';
import { CAPS_D05 } from './d05.ts';
import { CAPS_D06 } from './d06.ts';
import { CAPS_D07 } from './d07.ts';
import { CAPS_D08 } from './d08.ts';

export const CAPABILITIES: MdcCapability[] = [...CAPS_D01, ...CAPS_D02, ...CAPS_D03, ...CAPS_D04, ...CAPS_D05, ...CAPS_D06, ...CAPS_D07, ...CAPS_D08];
