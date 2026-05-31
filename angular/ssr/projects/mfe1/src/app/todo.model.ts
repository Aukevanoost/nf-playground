export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export type TodoFilter = 'all' | 'active' | 'completed';

/**
 * Key under which the todo list is persisted in `localStorage`.
 *
 * NOTE: `mfe2` (the insights dashboard) intentionally duplicates this constant
 * and the `Todo` shape instead of importing them. The two remotes share no
 * runtime state or DI singletons across the federation boundary — they only
 * agree on this storage contract.
 */
export const TODOS_STORAGE_KEY = 'nf-ssr-todos';
