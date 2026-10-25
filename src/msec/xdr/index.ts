import { buildContent } from '../../agentic/content/build.ts';
import type { ModuleContent, ResourceDef } from '../../agentic/types.ts';
import { XDR_LEVELS } from './levels.ts';
import { x01 } from './x01.ts';
import { x02 } from './x02.ts';
import { x03 } from './x03.ts';
import { XDR_FINAL } from './final.ts';
import { XDR_RESOURCES } from './resources.ts';

export const XDR_MODULES: ModuleContent[] = [x01, x02, x03];
const resources: ResourceDef[] = XDR_RESOURCES;
export const CONTENT = buildContent(XDR_LEVELS, XDR_MODULES, XDR_FINAL, resources);
