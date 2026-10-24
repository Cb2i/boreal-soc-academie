// Langue de l'interface et du contenu : français (par défaut) ou anglais.
// Le choix est mémorisé dans le navigateur uniquement (clé boreal.lang).
import { useSyncExternalStore } from 'react';

export type Lang = 'fr' | 'en';
const KEY = 'boreal.lang';

function readStored(): Lang {
  try {
    const v = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
    return v === 'en' ? 'en' : 'fr';
  } catch {
    return 'fr';
  }
}

let current: Lang = readStored();
const listeners = new Set<() => void>();
const before = new Set<(l: Lang) => void | Promise<void>>();

/** Appelé avant les abonnés React : permet de charger et de remplacer les données localisées. */
export function onBeforeLangChange(f: (l: Lang) => void | Promise<void>): void {
  before.add(f);
}

/** À appeler avant le premier rendu : charge le contenu de la langue mémorisée. */
export async function initLang(): Promise<void> {
  await Promise.all([...before].map((f) => f(current)));
}

export function getLang(): Lang {
  return current;
}

export async function setLang(l: Lang): Promise<void> {
  if (l === current) return;
  try {
    await Promise.all([...before].map((f) => f(l)));
  } catch {
    return; // chargement impossible : on reste dans la langue actuelle
  }
  current = l;
  try {
    localStorage.setItem(KEY, l);
  } catch {
    /* stockage indisponible : le choix vaut pour la session */
  }
  if (typeof document !== 'undefined') document.documentElement.lang = l === 'en' ? 'en' : 'fr-CA';
  listeners.forEach((f) => f());
}

export function subscribeLang(f: () => void): () => void {
  listeners.add(f);
  return () => listeners.delete(f);
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribeLang, getLang, getLang);
}

/** Choisit le texte selon la langue courante : tr('Accueil', 'Home'). */
export function tr<T>(fr: T, en: T): T {
  return current === 'en' ? en : fr;
}

if (typeof document !== 'undefined') document.documentElement.lang = current === 'en' ? 'en' : 'fr-CA';
