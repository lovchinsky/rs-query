import { QueryActionCreators } from './createQueryActionCreators';
import { QuerySelectors } from './createQuerySelectors';
import { QuerySelectorCreators } from './createQuerySelectorCreators';

export type QueryModuleLike<A, D, E, N extends string> = {
  queryName: N;
  actions: QueryActionCreators<A, D, E, N>;
  selectors: QuerySelectors<A, D, E>;
  selectorCreators: QuerySelectorCreators<A, D, E>;
};
