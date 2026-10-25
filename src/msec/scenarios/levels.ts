import type { AiLevel } from '../../agentic/types.ts';

export const SCENARIO_LEVELS: AiLevel[] = [
  { n: 1, title: 'Menaces entrantes', summary: 'Courriel, web et réseau : empêcher l’accès initial.', accent: '#35c4a0' },
  { n: 2, title: 'Poste et périphériques', summary: 'WSL, réduction de la surface d’attaque et supports amovibles.', accent: '#4aa3ff' },
  { n: 3, title: 'Risque, résilience et réponse', summary: 'Risque appareil, perte de télémétrie, confinement et restauration.', accent: '#ef6f6c' },
  { n: 4, title: 'Projets de synthèse', summary: 'Trois projets qui comparent et relient les scénarios.', accent: '#5fd18d', capstone: true },
];
