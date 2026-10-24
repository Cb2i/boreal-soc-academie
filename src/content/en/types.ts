export type Overlay = Record<string, unknown>;
export interface EnBundle {
  exercises: Record<string, Overlay>;
  lessons: Record<string, Overlay>;
  labs: Record<string, Overlay>;
  paths: Record<string, Overlay>;
  competencies: Record<string, Overlay>;
}
