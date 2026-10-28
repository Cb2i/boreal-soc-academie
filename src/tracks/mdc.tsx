import type { Route } from '../router.ts';
import { CONTENT } from '../msec/mdc/index.ts';
import type { Track } from '../agentic/TrackContext.tsx';
import { TrackRouter } from '../pages/track/TrackRouter.tsx';
import { STORES } from './stores.ts';
import { TRACK_BY_ROUTE } from './meta.ts';
import { SourcesPage } from '../pages/track/SourcesPage.tsx';
import { CapabilitiesPage, LimitsPage, ScenariosPage, SheetPage, SheetsPage } from '../pages/track/MdcPages.tsx';

export const mdcTrack: Track = {
  meta: TRACK_BY_ROUTE['defender-cloud'],
  store: STORES.mdc,
  content: CONTENT,
  pages: { sources: SourcesPage, capacites: CapabilitiesPage, fiches: SheetsPage, fiche: SheetPage, catalogue: ScenariosPage, limites: LimitsPage },
  home: {
    lead: 'Microsoft Defender for Cloud, la plateforme CNAPP de Microsoft : architecture, plans, licences et coûts, gouvernance, posture, chemins d’attaque, conformité, protection des charges de travail, AWS, GCP, Azure Arc, DevSecOps, alertes, intégration XDR et Sentinel, automatisation et exploitation. Le parcours principal fonctionne sans abonnement cloud : données fictives, résultats de requêtes identifiés, aucune interface ne prétend administrer Azure. Les laboratoires réels sont séparés, avec prérequis, coûts, tests inoffensifs et nettoyage.',
    notes: ['Chaque fait Microsoft cite une source du registre avec sa date de consultation (2026-10-25). Les plans payants ne sont jamais activés automatiquement, et rien n’a été validé dans un laboratoire Microsoft réel : les statuts de la matrice de capacités le disent explicitement.'],
    leadEn: 'Microsoft Defender for Cloud, Microsoft\'s CNAPP platform: architecture, plans, licensing and costs, governance, posture, attack paths, compliance, workload protection, AWS, GCP, Azure Arc, DevSecOps, alerts, XDR and Sentinel integration, automation and operations. The main path works without a cloud subscription: fictitious data, labelled query results, and no interface claims to administer Azure. The real labs are separate, with prerequisites, costs, harmless tests and cleanup.',
    notesEn: ['Every Microsoft fact cites a registry source with its consultation date (2026-10-25). Paid plans are never enabled automatically, and nothing has been validated in a real Microsoft lab: the capability matrix statuses say so explicitly.'],
  },
};

export default function MdcEntry({ route }: { route: Route }) {
  return <TrackRouter track={mdcTrack} route={route} />;
}
