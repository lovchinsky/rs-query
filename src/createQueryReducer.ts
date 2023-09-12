import { AnyAction, Reducer } from 'redux';
import { Draft, nothing } from 'immer';
import { CaseReducer, CaseReducerMapBuilder, createReducer } from './toolkit';
import { getQueryKey } from './utils';
import { QueryActionCreators } from './createQueryActionCreators';

export enum QueryStatus {
  Idle = 'idle',
  Pending = 'pending',
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
}

export type QueryState<D = unknown, E = unknown> = {
  data?: D;
  error?: E;
  status: QueryStatus;
};

export type QueryStateMap<D = unknown, E = unknown> = {
  [key: string]: QueryState<D, E>;
};

export interface CreateQueryReducerOptions<D = unknown, E = unknown> {
  createCaseReducerMap?: (builder: CaseReducerMapBuilder<QueryStateMap<D, E>>) => void;
}

export type QueryReducer<D = unknown, E = unknown> = Reducer<QueryStateMap<D, E>>;

export const createInitialQueryState = <D = unknown, E = unknown>(state?: QueryState<D, E>): QueryState<D, E> => ({
  data: undefined,
  error: undefined,
  status: QueryStatus.Idle,
  ...state,
});

export const reduce = (
  draft: Draft<QueryStateMap>,
  action: AnyAction,
  reducer: CaseReducer<QueryState>,
): ReturnType<CaseReducer<QueryStateMap>> => {
  const queryKey = getQueryKey(action.payload?.args, action.meta?.queryId);
  const queryState = (draft[queryKey] ??= createInitialQueryState());

  const state = reducer(queryState, action);
  if (state === nothing) {
    delete draft[queryKey];
  } else if (state) {
    draft[queryKey] = state;
  }
};

const createQueryReducer = <A = void, D = unknown, E = unknown, N extends string = string>(
  actionCreators: QueryActionCreators<A, D, E, N>,
  options: CreateQueryReducerOptions<D, E>,
): QueryReducer<D, E> =>
  createReducer({}, (builder) => {
    builder
      .addCase(actionCreators.pending, (draft, action) =>
        reduce(draft, action, (draft) => {
          draft.status = QueryStatus.Pending;
        }),
      )
      .addCase(actionCreators.fulfilled, (draft, action) =>
        reduce(draft, action, (draft) => {
          draft.status = QueryStatus.Fulfilled;
          draft.data = action.payload.data;
        }),
      )
      .addCase(actionCreators.rejected, (draft, action) =>
        reduce(draft, action, (draft, action) => {
          draft.status = QueryStatus.Rejected;
          draft.error = action.payload.error;
        }),
      )
      .addCase(actionCreators.reset, (draft, action) => reduce(draft, action, () => nothing));

    if (options.createCaseReducerMap) {
      options.createCaseReducerMap(builder);
    }
  });

export default createQueryReducer;
