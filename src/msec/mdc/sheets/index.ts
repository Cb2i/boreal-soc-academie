import type { MdcSheet } from '../model.ts';
import { SHEETS_D02 } from './d02.ts';
import { SHEETS_D03 } from './d03.ts';
import { SHEETS_D04 } from './d04.ts';
import { SHEETS_D05 } from './d05.ts';
import { SHEETS_D06 } from './d06.ts';
import { SHEETS_D07 } from './d07.ts';
import { SHEETS_D08 } from './d08.ts';
import { SHEETS_D09 } from './d09.ts';
import { SHEETS_D10 } from './d10.ts';
import { SHEETS_D11 } from './d11.ts';

export const SHEETS: MdcSheet[] = [...SHEETS_D02, ...SHEETS_D03, ...SHEETS_D04, ...SHEETS_D05, ...SHEETS_D06, ...SHEETS_D07, ...SHEETS_D08, ...SHEETS_D09, ...SHEETS_D10, ...SHEETS_D11];
