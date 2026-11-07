import { UC_A } from './a.ts';
import { UC_B } from './b.ts';
import { UC_C } from './c.ts';
import { UC_D } from './d.ts';
import { UC_E } from './e.ts';
import type { UseCase } from './model.ts';

export { GROUPS } from './model.ts';
export type { UseCase, UcGroup } from './model.ts';
export const USE_CASES: UseCase[] = [...UC_A, ...UC_B, ...UC_C, ...UC_D, ...UC_E];

/** Blogues et articles hors Microsoft rattaches a des cas existants (en plus des sources Learn de chaque cas). */
const EXTRA: Record<string, string[]> = {
  'uc-cc-detect': ['blog-ninjaone-dlp'], 'uc-dlp-cc-email': ['blog-ninjaone-dlp'], 'uc-dlp-deploy': ['blog-ninjaone-dlp', 'blog-lighthouse-ai-dlp'],
  'uc-paste-browser': ['blog-lighthouse-ai-dlp'], 'uc-edge-ai': ['blog-nikki-browser'], 'uc-network-dlp': ['blog-2tolead-network-dlp'],
  'uc-ai-shadow': ['blog-adam-shadow-ai', 'blog-nikki-browser'], 'uc-ai-web': ['blog-adam-shadow-ai'], 'uc-ai-dspm': ['blog-sra-ai-data'],
  'uc-ai-audit-edisc': ['blog-nikki-copilot-investigate'], 'uc-ai-retention': ['blog-o365itpros-retention'],
  'uc-label-base': ['blog-ciaops-labels'], 'uc-autolabel-library': ['blog-ciaops-labels'], 'uc-over-reports': ['blog-sra-ai-data'],
};
for (const x of USE_CASES) for (const b of EXTRA[x.id] ?? []) if (!x.sources.includes(b)) x.sources.push(b);
