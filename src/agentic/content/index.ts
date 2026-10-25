import type { ModuleContent } from '../types.ts';
import { buildContent } from './build.ts';
import { AI_LEVELS } from './levels.ts';
import { IA_FINAL_LABS } from './labsF.ts';
import { IA_LABS_1 } from './labs1.ts';
import { IA_LABS_2 } from './labs2.ts';
import { IA_LABS_3 } from './labs3.ts';
import { withLabs } from '../../msec/labs.ts';
import { RESOURCES } from './resources.ts';
import { m01 } from './m01.ts';
import { m02 } from './m02.ts';
import { m03 } from './m03.ts';
import { m04 } from './m04.ts';
import { m05 } from './m05.ts';
import { m06 } from './m06.ts';
import { m07 } from './m07.ts';
import { m08 } from './m08.ts';
import { m09 } from './m09.ts';
import { m10 } from './m10.ts';
import { m11 } from './m11.ts';
import { m12 } from './m12.ts';
import { m13 } from './m13.ts';
import { m14 } from './m14.ts';
import { m15 } from './m15.ts';
import { m16 } from './m16.ts';
import { m17 } from './m17.ts';
import { m18 } from './m18.ts';

/** Tous les modules livrés, dans l'ordre pédagogique. */
export const MODULE_CONTENT: ModuleContent[] = withLabs([m01, m02, m03, m04, m05, m06, m07, m08, m09, m10, m11, m12, m13, m14, m15, m16, m17, m18], [...IA_LABS_1, ...IA_LABS_2, ...IA_LABS_3]);

export const CONTENT = buildContent(AI_LEVELS, MODULE_CONTENT, IA_FINAL_LABS, RESOURCES);
export const { LEVELS, MODULES, LESSONS, EXERCISES, COMPETENCIES, CASES, PROJECTS, MODULE_BY_ID, LESSON_BY_ID, EX_BY_ID, COMP_BY_ID, CASE_BY_MODULE, PROJECT_BY_ID } = CONTENT;
export { RESOURCES };
