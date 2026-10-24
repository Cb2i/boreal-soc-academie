import type { Dyn } from './types.ts';

export interface Pos {
  line: number;
  col: number;
}

export type Expr =
  | { k: 'num'; v: number; pos: Pos }
  | { k: 'str'; v: string; pos: Pos }
  | { k: 'bool'; v: boolean; pos: Pos }
  | { k: 'null'; ty: string; pos: Pos }
  | { k: 'span'; ms: number; pos: Pos }
  | { k: 'datetime'; v: number; pos: Pos }
  | { k: 'dyn'; v: Dyn; pos: Pos }
  | { k: 'id'; name: string; pos: Pos }
  | { k: 'member'; obj: Expr; name: string; pos: Pos }
  | { k: 'index'; obj: Expr; idx: Expr; pos: Pos }
  | { k: 'call'; name: string; args: Expr[]; pos: Pos }
  | { k: 'star'; pos: Pos }
  | { k: 'unary'; op: '-' | '+'; e: Expr; pos: Pos }
  | { k: 'bin'; op: string; l: Expr; r: Expr; pos: Pos }
  | { k: 'in'; neg: boolean; ci: boolean; l: Expr; items: Expr[]; pos: Pos }
  | { k: 'between'; neg: boolean; l: Expr; lo: Expr; hi: Expr; pos: Pos }
  | { k: 'hasany'; all: boolean; l: Expr; items: Expr[]; pos: Pos }
  | { k: 'subquery'; q: Pipeline; pos: Pos };

export interface Named {
  name?: string;
  expr: Expr;
  pos: Pos;
}

export interface SortKey {
  expr: Expr;
  desc: boolean;
  nullsFirst?: boolean;
}

export type Source =
  | { kind: 'expr'; expr: Expr }
  | { kind: 'datatable'; cols: { name: string; ty: string }[]; values: Expr[]; pos: Pos }
  | { kind: 'print'; items: Named[]; pos: Pos }
  | { kind: 'union'; withsource?: string; items: Pipeline[]; pos: Pos };

export type Op =
  | { op: 'where'; pred: Expr; pos: Pos }
  | { op: 'project'; items: Named[]; pos: Pos }
  | { op: 'project-away'; cols: string[]; pos: Pos }
  | { op: 'project-keep'; cols: string[]; pos: Pos }
  | { op: 'project-rename'; items: { to: string; from: string }[]; pos: Pos }
  | { op: 'extend'; items: Named[]; pos: Pos }
  | { op: 'take'; n: Expr; pos: Pos }
  | { op: 'top'; n: Expr; by: Expr; desc: boolean; nullsFirst?: boolean; pos: Pos }
  | { op: 'sort'; keys: SortKey[]; pos: Pos }
  | { op: 'summarize'; aggs: Named[]; by: Named[]; pos: Pos }
  | { op: 'distinct'; cols: Named[]; star: boolean; pos: Pos }
  | { op: 'count'; pos: Pos }
  | { op: 'join'; kind: string; right: Pipeline; on: Expr[]; pos: Pos }
  | { op: 'union'; withsource?: string; items: Pipeline[]; pos: Pos }
  | { op: 'mv-expand'; items: { name?: string; expr: Expr; ty?: string }[]; pos: Pos }
  | { op: 'getschema'; pos: Pos }
  | { op: 'render'; kind: string; pos: Pos };

export interface Pipeline {
  source: Source;
  ops: Op[];
}

export interface LetDef {
  name: string;
  params: { name: string; ty?: string }[] | null;
  body: Pipeline;
  pos: Pos;
}

export interface QueryAst {
  lets: LetDef[];
  body: Pipeline;
}
