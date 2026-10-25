import { buildContent } from '../../agentic/content/build.ts';
import type { AiProject, ModuleContent, ResourceDef } from '../../agentic/types.ts';
import { MDC_LEVELS } from './levels.ts';
import { d01 } from './d01.ts';

export const MDC_MODULES: ModuleContent[] = [d01];
const finalProjects: AiProject[] = [];
const resources: ResourceDef[] = [];
export const CONTENT = buildContent(MDC_LEVELS, MDC_MODULES, finalProjects, resources);
