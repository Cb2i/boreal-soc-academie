export type Icon = 'user' | 'device' | 'cloud' | 'shield' | 'mail' | 'db' | 'key' | 'gear' | 'doc' | 'alert' | 'globe' | 'code' | 'bot' | 'chart';
/** Nœud : id, étiquette, sous-titre, icône. */
export type Tone = 'atk' | 'ctl' | 'ok';
export type FNode = [id: string, label: string, sub: string, icon: Icon, tone?: Tone];
/** Étape : source, destination, titre court, explication. */
/** Étape : source, destination, titre court, explication, contenu du paquet, ce qui se passe dans la destination, nature (attaque, contrôle, normal). */
export type FStep = [from: string, to: string, label: string, detail: string, payload?: string, inside?: string, kind?: Tone];
export interface Flow { lesson: string; title: string; caption: string; nodes: FNode[]; steps: FStep[] }
export const F = (lesson: string, title: string, caption: string, nodes: FNode[], steps: FStep[]): Flow => ({ lesson, title, caption, nodes, steps });
