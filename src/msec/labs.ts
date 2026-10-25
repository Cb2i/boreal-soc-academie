import type { AiProject, ModuleContent } from '../agentic/types.ts';

/** Remplace les anciennes fiches projet d'un module par ses labs guidés, quand le module en a. */
export function withLabs(modules: ModuleContent[], labs: AiProject[]): ModuleContent[] {
  return modules.map((m) => {
    const own = labs.filter((l) => l.module === m.module.id);
    return own.length > 0 ? { ...m, projects: own } : m;
  });
}
