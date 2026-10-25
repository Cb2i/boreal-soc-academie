// Registre de sources et matrice de couverture des parcours Defender XDR, Intune Sécurité et scénarios croisés.
// Les statuts sont volontairement séparés : un seul « terminé » masquerait des différences réelles.

/** Statut d'une page de documentation officielle dans le registre. */
export type SourceStatus = 'ga' | 'preview' | 'retrait-annonce' | 'reference' | 'communautaire';

export interface SourceDef {
  id: string;
  title: string;
  url: string;
  product: string;
  topic: string;
  status: SourceStatus;
  /** Incertitude ou précaution à connaître avant de s'appuyer sur cette source. */
  uncertainty?: string;
}

/** Nature de la capacité : fonction native, intégration, dépendance, licence supplémentaire ou non prise en charge. */
export type Nature = 'native' | 'integration' | 'dependance' | 'licence-supplementaire' | 'non-prise-en-charge';

export const NATURE_LABELS: Record<Nature, string> = {
  native: 'Fonction native',
  integration: 'Intégration',
  dependance: 'Dépendance',
  'licence-supplementaire': 'Produit ou licence supplémentaire',
  'non-prise-en-charge': 'Non prise en charge',
};

export type DocStatus = 'verifiee' | 'partielle' | 'non-verifiee';
export type WriteStatus = 'redigee' | 'planifiee' | 'exclue';
export type ImplStatus = 'implementee' | 'partielle' | 'non';
export type SimStatus = 'simulee' | 'non';
/** Aucune validation en laboratoire Microsoft réel n'a été faite : le seul statut honnête livré est « non-realisee ». */
export type LabStatus = 'non-realisee' | 'realisee';

export interface Capability {
  /** Identifiant stable, p. ex. xdr.mde.isolation. */
  id: string;
  track: 'xdr' | 'intune' | 'scenarios';
  product: string;
  domain: string;
  title: string;
  description: string;
  risk: string;
  portal: string;
  platforms: string;
  /** Licences et permissions nécessaires. */
  licensing: string;
  prerequisites: string;
  integrations: string;
  limits: string;
  nature: Nature;
  /** Identifiants du registre de sources. */
  sources: string[];
  /** Date de vérification documentaire (AAAA-MM-JJ). */
  verified: string;
  status: { doc: DocStatus; redaction: WriteStatus; implementation: ImplStatus; simulation: SimStatus; lab: LabStatus };
  /** Où la capacité est enseignée. */
  teaches: { module?: string; lessons?: string[]; exercises?: string[]; projects?: string[] };
  /** Justification obligatoire quand la rédaction est « exclue » ou « planifiée ». */
  note?: string;
}
