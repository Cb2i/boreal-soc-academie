export type Icon = 'user' | 'device' | 'cloud' | 'shield' | 'mail' | 'db' | 'key' | 'gear' | 'doc' | 'alert' | 'globe' | 'code' | 'bot' | 'chart';
/** Nœud : id, étiquette, sous-titre, icône. */
export type FNode = [id: string, label: string, sub: string, icon: Icon];
/** Étape : source, destination, titre court, explication. */
export type FStep = [from: string, to: string, label: string, detail: string];
export interface Flow { lesson: string; title: string; caption: string; nodes: FNode[]; steps: FStep[] }
export const F = (lesson: string, title: string, caption: string, nodes: FNode[], steps: FStep[]): Flow => ({ lesson, title, caption, nodes, steps });
