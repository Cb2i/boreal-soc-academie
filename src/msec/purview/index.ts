import { buildContent } from '../../agentic/content/build.ts';
import type { AiProject, ModuleContent, ResourceDef } from '../../agentic/types.ts';
import { PURVIEW_LEVELS } from './levels.ts';
import { p01 } from './p01.ts';
import { p02 } from './p02.ts';
import { p03 } from './p03.ts';
import { p04 } from './p04.ts';
import { p05 } from './p05.ts';
import { p06 } from './p06.ts';
import { PURVIEW_FINAL_PROJECTS } from './finalProjects.ts';

export const PURVIEW_MODULES: ModuleContent[] = [p01, p02, p03, p04, p05, p06];
const finalProjects: AiProject[] = PURVIEW_FINAL_PROJECTS;
const resources: ResourceDef[] = [];
export const CONTENT = buildContent(PURVIEW_LEVELS, PURVIEW_MODULES, finalProjects, resources);
