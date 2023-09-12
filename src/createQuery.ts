import createQueryActionCreators, { CreateQueryActionCreatorsOptions } from './createQueryActionCreators';
import createQueryReducer, { CreateQueryReducerOptions } from './createQueryReducer';
import createQuerySaga, { CreateQuerySagaOptions } from './createQuerySaga';
import createQuerySelectors, { CreateQuerySelectorsOptions, QuerySelectors } from './createQuerySelectors';
import createQuerySelectorCreators, { CreateQuerySelectorCreatorsOptions } from './createQuerySelectorCreators';

export type CreateQueryOptions<
  A,
  D,
  E,
  N extends string,
  S extends (selectors: QuerySelectors<A, D, E>) => Record<string, (state: any, ...args: any[]) => any>,
  C extends (selectors: QuerySelectors<A, D, E>) => Record<string, () => (state: any, ...args: any[]) => any>,
> = CreateQueryActionCreatorsOptions<N> &
  CreateQuerySagaOptions<A, D, E, N> &
  CreateQueryReducerOptions<D, E> &
  CreateQuerySelectorsOptions<A, D, E, N, S> &
  CreateQuerySelectorCreatorsOptions<A, D, E, N, C>;

export const createQuery =
  <A = void, D = unknown, E = any>() =>
  <
    N extends string,
    S extends (selectors: QuerySelectors<A, D, E>) => Record<string, (state: any, ...args: any[]) => any>,
    C extends (selectors: QuerySelectors<A, D, E>) => Record<string, () => (state: any, ...args: any[]) => any>,
  >(
    options: CreateQueryOptions<A, D, E, N, S, C>,
  ) => {
    const actionCreators = createQueryActionCreators<A, D, E, N>(options);
    const reducer = createQueryReducer<A, D, E, N>(actionCreators, options);
    const saga = createQuerySaga<A, D, E, N>(actionCreators, options);
    const selectors = createQuerySelectors<A, D, E, N, S>(options);
    const selectorCreators = createQuerySelectorCreators<A, D, E, N, C>(selectors, options);

    return {
      queryName: options.queryName,
      actions: actionCreators,
      reducer,
      saga,
      selectors,
      selectorCreators,
    };
  };
