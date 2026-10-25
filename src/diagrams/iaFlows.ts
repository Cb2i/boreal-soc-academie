import type { Flow } from './types.ts';
import { M01 } from './ia/m01.ts'; import { M02 } from './ia/m02.ts'; import { M03 } from './ia/m03.ts';
import { M04 } from './ia/m04.ts'; import { M05 } from './ia/m05.ts'; import { M06 } from './ia/m06.ts';
import { M07 } from './ia/m07.ts'; import { M08 } from './ia/m08.ts'; import { M09 } from './ia/m09.ts';
import { M10 } from './ia/m10.ts'; import { M11 } from './ia/m11.ts'; import { M12 } from './ia/m12.ts';
import { M13 } from './ia/m13.ts'; import { M14 } from './ia/m14.ts'; import { M15 } from './ia/m15.ts';
import { M16 } from './ia/m16.ts'; import { M17 } from './ia/m17.ts'; import { M18 } from './ia/m18.ts';

export const FLOWS_IA: Flow[] = [
  ...M01, ...M02, ...M03, ...M04, ...M05, ...M06, ...M07, ...M08, ...M09,
  ...M10, ...M11, ...M12, ...M13, ...M14, ...M15, ...M16, ...M17, ...M18,
];
