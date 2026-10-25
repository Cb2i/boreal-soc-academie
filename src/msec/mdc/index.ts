import { buildContent } from '../../agentic/content/build.ts';
import type { AiProject, ModuleContent, ResourceDef } from '../../agentic/types.ts';
import { MDC_LEVELS } from './levels.ts';
import { d01 } from './d01.ts';
import { d02 } from './d02.ts';
import { d03 } from './d03.ts';
import { d04 } from './d04.ts';
import { d05 } from './d05.ts';
import { d06 } from './d06.ts';
import { d07 } from './d07.ts';
import { d08 } from './d08.ts';
import { d09 } from './d09.ts';
import { d10 } from './d10.ts';
import { d11 } from './d11.ts';

export const MDC_MODULES: ModuleContent[] = [d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11];
const finalProjects: AiProject[] = [];
const resources: ResourceDef[] = [];
export const CONTENT = buildContent(MDC_LEVELS, MDC_MODULES, finalProjects, resources);
