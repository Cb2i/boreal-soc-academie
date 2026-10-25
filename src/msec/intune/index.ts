import { buildContent } from '../../agentic/content/build.ts';
import type { ModuleContent, ResourceDef } from '../../agentic/types.ts';
import { INTUNE_LEVELS } from './levels.ts';
import { i01 } from './i01.ts';
import { INTUNE_FINAL } from './final.ts';
import { INTUNE_RESOURCES } from './resources.ts';

export const INTUNE_MODULES: ModuleContent[] = [i01];
const resources: ResourceDef[] = INTUNE_RESOURCES;
export const CONTENT = buildContent(INTUNE_LEVELS, INTUNE_MODULES, INTUNE_FINAL, resources);
