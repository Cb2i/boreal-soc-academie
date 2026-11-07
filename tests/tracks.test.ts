import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { CONTENT_LOADERS } from '../src/tracks/loaders.ts';
import { TRACKS } from '../src/tracks/meta.ts';
import { ALL_EXERCISES, ALL_LABS, ALL_LESSONS } from '../src/content/index.ts';
import { PATHS } from '../src/content/paths.ts';

describe('parcours : registre et effectifs', () => {
  it('stats.json est à jour (npx tsx scripts/gen-track-stats.ts)', async () => {
    const stats = JSON.parse(readFileSync('src/tracks/stats.json', 'utf8'));
    for (const [id, load] of Object.entries(CONTENT_LOADERS)) {
      const c = await load();
      expect(stats[id], id).toEqual({ modules: c.MODULES.length, lessons: c.LESSONS.length, exercises: c.EXERCISES.length, projects: c.PROJECTS.length, competencies: c.COMPETENCIES.length, resources: c.RESOURCES.length });
    }
  });
  it('azure-stats.json est à jour (npx tsx scripts/gen-track-stats.ts)', () => {
    const stats = JSON.parse(readFileSync('src/content/azure-stats.json', 'utf8'));
    expect(stats).toEqual({ paths: PATHS.length, lessons: ALL_LESSONS.length, exercises: ALL_EXERCISES.length, labs: ALL_LABS.length });
  });
  it('clés de stockage et routes uniques, séparées de la section Azure', () => {
    expect(new Set(TRACKS.map((t) => t.storageKey)).size).toBe(TRACKS.length);
    expect(new Set(TRACKS.map((t) => t.route)).size).toBe(TRACKS.length);
    for (const t of TRACKS) expect(t.storageKey).not.toBe('boreal.progress.v1');
  });
});
