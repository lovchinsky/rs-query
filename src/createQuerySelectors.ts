import { getQueryKey } from './utils';
import { QueryState, QueryStatus } from './createQueryReducer';

export type ExtendedQueryState<D = unknown, E = unknown> = QueryState<D, E> & {
  hasData: boolean;
  hasError: boolean;
  isIdle: boolean;
  isPending: boolean;
  isRejected: boolean;
  isFulfilled: boolean;
  isSettled: boolean;
};

export interface QuerySelectors<A = void, D = unknown, E = unknown> {
  selectState: <S>(state: S, args: A, queryId?: string) => undefined | QueryState<D, E>;
  selectData: <S>(state: S, args: A, queryId?: string) => QueryState<D, E>['data'];
  selectError: <S>(state: S, args: A, queryId?: string) => QueryState<D, E>['error'];
  selectStatus: <S>(state: S, args: A, queryId?: string) => QueryState<D, E>['status'];
  selectHasData: <S>(state: S, args: A, queryId?: string) => boolean;
  selectHasError: <S>(state: S, args: A, queryId?: string) => boolean;
  selectIsIdle: <S>(state: S, args: A, queryId?: string) => boolean;
  selectIsPending: <S>(state: S, args: A, queryId?: string) => boolean;
  selectIsRejected: <S>(state: S, args: A, queryId?: string) => boolean;
  selectIsFulfilled: <S>(state: S, args: A, queryId?: string) => boolean;
  selectIsSettled: <S>(state: S, args: A, queryId?: string) => boolean;
}

export interface CreateQuerySelectorsOptions<
  A,
  D,
  E,
  N extends string,
  S extends (selectors: QuerySelectors<A, D, E>) => Record<string, (state: any, ...args: any[]) => any>,
> {
  queryName: N;
  createSelectors?: S;
}

const createQuerySelectors = <
  A,
  D,
  E,
  N extends string,
  S extends (selectors: QuerySelectors<A, D, E>) => Record<string, (state: any, ...args: any[]) => any>,
>(
  options: CreateQuerySelectorsOptions<A, D, E, N, S>,
) => {
  const { queryName, createSelectors } = options;

  const selectors: QuerySelectors<A, D, E> = {
    selectState: (state, args, queryId) => (state as any)?.[queryName]?.[getQueryKey(args, queryId)],
    selectData: (state, args, queryId) => selectors.selectState(state, args, queryId)?.data,
    selectError: (state, args, queryId) => selectors.selectState(state, args, queryId)?.error,
    selectStatus: (state, args, queryId) => selectors.selectState(state, args, queryId)?.status ?? QueryStatus.Idle,
    selectHasData: (state, args, queryId) => selectors.selectData(state, args, queryId) !== undefined,
    selectHasError: (state, args, queryId) => selectors.selectError(state, args, queryId) !== undefined,
    selectIsIdle: (state, args, queryId) => selectors.selectStatus(state, args, queryId) === QueryStatus.Idle,
    selectIsPending: (state, args, queryId) => selectors.selectStatus(state, args, queryId) === QueryStatus.Pending,
    selectIsFulfilled: (state, args, queryId) => selectors.selectStatus(state, args, queryId) === QueryStatus.Fulfilled,
    selectIsRejected: (state, args, queryId) => selectors.selectStatus(state, args, queryId) === QueryStatus.Rejected,
    selectIsSettled: (state, args, queryId) =>
      selectors.selectIsFulfilled(state, args, queryId) || selectors.selectIsRejected(state, args, queryId),
  };

  return {
    ...selectors,
    ...(createSelectors && createSelectors(selectors)),
  } as S extends (...args: any[]) => any ? QuerySelectors<A, D, E> & ReturnType<S> : QuerySelectors<A, D, E>;
};

export default createQuerySelectors;
