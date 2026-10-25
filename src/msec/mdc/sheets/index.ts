import type { MdcSheet } from '../model.ts';
import { SHEETS_D02 } from './d02.ts';
import { SHEETS_D03 } from './d03.ts';

export const SHEETS: MdcSheet[] = [...SHEETS_D02, ...SHEETS_D03];
