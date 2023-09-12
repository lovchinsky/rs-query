import { createSelector } from 'reselect';
import { QueryStatus } from './createQueryReducer';
import { ExtendedQueryState, QuerySelectors } from './createQuerySelectors';

export interface QuerySelectorCreators<A = void, D = unknown, E = unknown> {
  makeExtendedStateSelector: () => <S>(state: S, args: A, queryId?: string) => ExtendedQueryState<D, E>;
}

export interface CreateQuerySelectorCreatorsOptions<
  A,
  D,
  E,
  N extends string,
  C extends (selectors: QuerySelectors<A, D, E>) => Record<string, () => (state: any, ...args: any[]) => any>,
> {
  queryName: N;
  createSelectorCreators?: C;
}

const createQuerySelectors = <
  A,
  D,
  E,
  N extends string,
  C extends (selectors: QuerySelectors<A, D, E>) => Record<string, () => (state: any, ...args: any[]) => any>,
>(
  selectors: QuerySelectors<A, D, E>,
  options: CreateQuerySelectorCreatorsOptions<A, D, E, N, C>,
) => {
  const { createSelectorCreators } = options;

  const selectorCreators: QuerySelectorCreators<A, D, E> = {
    makeExtendedStateSelector: () =>
      createSelector(selectors.selectState, (state) => ({
        status: QueryStatus.Idle,
        ...state,
        hasData: state?.data !== undefined,
        hasError: state?.error !== undefined,
        isIdle: !state?.status || state.status === QueryStatus.Idle,
        isPending: state?.status === QueryStatus.Pending,
        isFulfilled: state?.status === QueryStatus.Fulfilled,
        isRejected: state?.status === QueryStatus.Rejected,
        isSettled: state?.status === QueryStatus.Fulfilled || state?.status === QueryStatus.Rejected,
      })),
  };

  return {
    ...selectorCreators,
    ...(createSelectorCreators && createSelectorCreators(selectors)),
  } as C extends (...args: any[]) => any
    ? QuerySelectorCreators<A, D, E> & ReturnType<C>
    : QuerySelectorCreators<A, D, E>;
};

export default createQuerySelectors;
