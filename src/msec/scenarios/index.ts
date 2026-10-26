import { registerTrackI18n } from '../../i18n/trackLang.ts';
import { loadDict } from '../../i18n/dicts.ts';
import { loadDictFr } from '../../i18n/dictsFr.ts';
import { buildContent } from '../../agentic/content/build.ts';
import type { ModuleContent, ResourceDef } from '../../agentic/types.ts';
import { buildScenario } from './build.ts';
import type { ScenarioDef } from './def.ts';
import { SCENARIO_LEVELS } from './levels.ts';
import { SCENARIO_FINAL_LABS } from './labsF.ts';
import { SCENARIO_LABS } from './labs1.ts';
import { withLabs } from '../labs.ts';
import { SCENARIO_RESOURCES } from './resources.ts';
import { S01 } from './s01.ts';
import { S02 } from './s02.ts';
import { S03 } from './s03.ts';
import { S04 } from './s04.ts';
import { S05 } from './s05.ts';
import { S06 } from './s06.ts';
import { S07 } from './s07.ts';
import { S08 } from './s08.ts';

/** Scénarios dans l’ordre du parcours. */
export const SCENARIOS: ScenarioDef[] = [S01, S02, S03, S04, S05, S06, S07, S08];
export const SCENARIO_MODULES: ModuleContent[] = withLabs(SCENARIOS.map(buildScenario), SCENARIO_LABS);
const resources: ResourceDef[] = SCENARIO_RESOURCES;
export const CONTENT = buildContent(SCENARIO_LEVELS, SCENARIO_MODULES, SCENARIO_FINAL_LABS, resources);

await registerTrackI18n(CONTENT, () => loadDict('scenarios'), () => loadDictFr('scenarios'));
