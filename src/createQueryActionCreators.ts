import { createAction, ActionCreator, ActionDescriptor } from './toolkit';

type QueryActionPayload<A = void> = {
  args: A;
};

type QueryActionMeta = {
  queryId?: string;
};

export type InitiateActionPayload<A = void> = QueryActionPayload<A>;

export type InitiateActionMeta = QueryActionMeta & {
  force?: boolean;
};

export type SubscribeActionPayload<A = void> = QueryActionPayload<A>;

export type SubscribeActionMeta = QueryActionMeta & {
  subscriptionId: string;
};

export type UnsubscribeActionPayload<A = void> = QueryActionPayload<A>;

export type UnsubscribeActionMeta = SubscribeActionMeta;

export type ResetActionPayload<A = void> = InitiateActionPayload<A>;

export type PendingActionPayload<A = void> = InitiateActionPayload<A>;

export type SettledActionPayload<A = void> = InitiateActionPayload<A>;

export type FulfilledActionPayload<A = void, D = unknown> = InitiateActionPayload<A> & {
  data: D;
};

export type RejectedActionPayload<A = void, E = unknown> = InitiateActionPayload<A> & {
  error: E;
};

export type InitiateActionCreator<A = void, T extends PropertyKey = string> = ActionCreator<
  (args: A, meta?: InitiateActionMeta) => ActionDescriptor<InitiateActionPayload<A>, InitiateActionMeta>,
  T
>;

export type SubscribeActionCreator<A = void, T extends PropertyKey = string> = ActionCreator<
  (args: A, meta: SubscribeActionMeta) => ActionDescriptor<SubscribeActionPayload<A>, SubscribeActionMeta>,
  T
>;

export type UnsubscribeActionCreator<A = void, T extends PropertyKey = string> = ActionCreator<
  (args: A, meta: UnsubscribeActionMeta) => ActionDescriptor<UnsubscribeActionPayload<A>, UnsubscribeActionMeta>,
  T
>;

export type ResetActionCreator<A = void, T extends PropertyKey = string> = ActionCreator<
  (args: A, meta?: QueryActionMeta) => ActionDescriptor<ResetActionPayload<A>, QueryActionMeta>,
  T
>;

export type PendingActionCreator<A = void, T extends PropertyKey = string> = ActionCreator<
  (args: A, meta?: QueryActionMeta) => ActionDescriptor<PendingActionPayload<A>, QueryActionMeta>,
  T
>;

export type SettledActionCreator<A = void, T extends PropertyKey = string> = ActionCreator<
  (args: A, meta?: QueryActionMeta) => ActionDescriptor<SettledActionPayload<A>, QueryActionMeta>,
  T
>;

export type FulfilledActionCreator<A = void, D = unknown, T extends PropertyKey = string> = ActionCreator<
  (data: D, args: A, meta?: QueryActionMeta) => ActionDescriptor<FulfilledActionPayload<A, D>, QueryActionMeta>,
  T
>;

export type RejectedActionCreator<A = void, E = unknown, T extends PropertyKey = string> = ActionCreator<
  (error: E, args: A, meta?: QueryActionMeta) => ActionDescriptor<RejectedActionPayload<A, E>, QueryActionMeta>,
  T
>;

export type QueryActionCreators<A = void, D = unknown, E = unknown, N extends string = string> = {
  initiate: InitiateActionCreator<A, `${N}/initiate`>;
  subscribe: SubscribeActionCreator<A, `${N}/subscribe`>;
  unsubscribe: UnsubscribeActionCreator<A, `${N}/unsubscribe`>;
  reset: ResetActionCreator<A, `${N}/reset`>;
  pending: PendingActionCreator<A, `${N}/pending`>;
  settled: SettledActionCreator<A, `${N}/settled`>;
  fulfilled: FulfilledActionCreator<A, D, `${N}/fulfilled`>;
  rejected: RejectedActionCreator<A, E, `${N}/rejected`>;
};

export type InitiateAction<A = void, D = unknown, E = unknown, N extends string = string> = ReturnType<
  QueryActionCreators<A, D, E, N>['initiate']
>;

export type SubscribeAction<A = void, D = unknown, E = unknown, N extends string = string> = ReturnType<
  QueryActionCreators<A, D, E, N>['subscribe']
>;

export type UnsubscribeAction<A = void, D = unknown, E = unknown, N extends string = string> = ReturnType<
  QueryActionCreators<A, D, E, N>['unsubscribe']
>;

export type ResetAction<A = void, D = unknown, E = unknown, N extends string = string> = ReturnType<
  QueryActionCreators<A, D, E, N>['reset']
>;

export type PendingAction<A = void, D = unknown, E = unknown, N extends string = string> = ReturnType<
  QueryActionCreators<A, D, E, N>['pending']
>;

export type SettledAction<A = void, D = unknown, E = unknown, N extends string = string> = ReturnType<
  QueryActionCreators<A, D, E, N>['settled']
>;

export type FulfilledAction<A = void, D = unknown, E = unknown, N extends string = string> = ReturnType<
  QueryActionCreators<A, D, E, N>['fulfilled']
>;

export type RejectedAction<A = void, D = unknown, E = unknown, N extends string = string> = ReturnType<
  QueryActionCreators<A, D, E, N>['rejected']
>;

export interface CreateQueryActionCreatorsOptions<N extends string = string> {
  queryName: N;
}

const createQueryActionCreators = <A = void, D = unknown, E = unknown, N extends string = string>(
  options: CreateQueryActionCreatorsOptions<N>,
): QueryActionCreators<A, D, E, N> => ({
  initiate: createAction(`${options.queryName}/initiate`, (args, meta = {}) => ({ payload: { args }, meta })),
  subscribe: createAction(`${options.queryName}/subscribe`, (args, meta) => ({ payload: { args }, meta })),
  unsubscribe: createAction(`${options.queryName}/unsubscribe`, (args, meta) => ({ payload: { args }, meta })),
  reset: createAction(`${options.queryName}/reset`, (args, meta = {}) => ({ payload: { args }, meta })),
  pending: createAction(`${options.queryName}/pending`, (args, meta = {}) => ({ payload: { args }, meta })),
  settled: createAction(`${options.queryName}/settled`, (args, meta = {}) => ({ payload: { args }, meta })),
  fulfilled: createAction(`${options.queryName}/fulfilled`, (data, args, meta = {}) => ({
    payload: { data, args },
    meta,
  })),
  rejected: createAction(`${options.queryName}/rejected`, (error, args, meta = {}) => ({
    payload: { error, args },
    meta,
  })),
});

export default createQueryActionCreators;
