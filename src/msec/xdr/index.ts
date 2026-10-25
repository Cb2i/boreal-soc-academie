import { buildContent } from '../../agentic/content/build.ts';
import type { ModuleContent, ResourceDef } from '../../agentic/types.ts';
import { XDR_LEVELS } from './levels.ts';
import { x01 } from './x01.ts';
import { x02 } from './x02.ts';
import { x03 } from './x03.ts';
import { x04 } from './x04.ts';
import { x05 } from './x05.ts';
import { x06 } from './x06.ts';
import { XDR_FINAL } from './final.ts';
import { XDR_RESOURCES } from './resources.ts';

export const XDR_MODULES: ModuleContent[] = [x01, x02, x03, x04, x05, x06];
const resources: ResourceDef[] = XDR_RESOURCES;
export const CONTENT = buildContent(XDR_LEVELS, XDR_MODULES, XDR_FINAL, resources);
