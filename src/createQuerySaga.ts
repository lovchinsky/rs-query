import { Task, Saga } from '@redux-saga/types';
import { ActionPattern, call, cancel, delay, fork, put, race, take, takeEvery } from 'redux-saga/effects';
import { getQueryKey } from './utils';
import {
  FulfilledAction,
  InitiateAction,
  QueryActionCreators,
  RejectedAction,
  SubscribeAction,
  UnsubscribeAction,
} from './createQueryActionCreators';
import { AnyAction } from 'redux';

export type CreateQuerySagaOptions<A = void, D = unknown, E = unknown, N extends string = string> = {
  queryFn: (args: A) => D | Promise<D> | Generator<any, D, any>;
  staleTime?: number | ((action: InitiateAction<A, D, E, N>) => number);
  cacheTime?: number | ((action: UnsubscribeAction<A, D, E, N>) => number);
  revalidateTime?:
    | number
    | ((fulfilledAction?: FulfilledAction<A, D, E, N>, rejectedAction?: RejectedAction<A, D, E, N>) => number);
};

const currentTime = <T extends undefined | number | ((...args: any[]) => number)>(time: T, ...args: any[]) => {
  return typeof time === 'function' ? time(...args) : (time as Exclude<T, (...args: any[]) => number>);
};

export const createActionPattern =
  (type: string, queryKey?: string, match?: (action: AnyAction) => boolean): ActionPattern =>
    (action: AnyAction) =>
      action.type === type &&
      (!queryKey || getQueryKey(action.payload?.args, action.meta?.queryId) === queryKey) &&
      (!match || match(action));

const createQuerySaga = <A = void, D = unknown, E = unknown, N extends string = string>(
  actionCreators: QueryActionCreators<A, D, E, N>,
  options: CreateQuerySagaOptions<A, D, E, N>,
): Saga => {
  const { queryFn, revalidateTime, staleTime = 0, cacheTime = 60 * 1000 } = options;

  return function* () {
    const initiateTasks = new Map<string, Task>();
    const revalidateTasks = new Map<string, Task>();
    const subscriptions = new Map<string, Set<string>>();

    yield takeEvery(actionCreators.subscribe.type, function* (action: SubscribeAction<A, D, E, N>): any {
      const queryKey = getQueryKey(action.payload.args, action.meta.queryId);
      if (!subscriptions.has(queryKey)) subscriptions.set(queryKey, new Set<string>());
      subscriptions.get(queryKey)!.add(action.meta.subscriptionId);
    });

    yield takeEvery(actionCreators.unsubscribe.type, function* (action: UnsubscribeAction<A, D, E, N>): any {
      const queryKey = getQueryKey(action.payload.args, action.meta.queryId);
      const set = subscriptions.get(queryKey);

      if (set) {
        set.delete(action.meta.subscriptionId);

        if (set.size === 0) {
          const [delayed] = yield race([
            delay(currentTime(cacheTime, action)),
            take(createActionPattern(actionCreators.reset.type, queryKey)),
            take(createActionPattern(actionCreators.subscribe.type, queryKey)),
          ]);

          if (delayed) {
            yield put(actionCreators.reset(action.payload.args));
          }
        }
      }
    });

    yield fork(function* () {
      const settledAt = new Map<string, number>();

      while (true) {
        const initiateAction: InitiateAction<A, D, E, N> = yield take(actionCreators.initiate.type);
        const queryKey = getQueryKey(initiateAction.payload.args, initiateAction.meta?.queryId);

        const initiateTask = initiateTasks.get(queryKey);
        if (initiateTask && initiateTask.isRunning()) {
          continue;
        }

        const ms = currentTime(staleTime, initiateAction);
        const isStale = Date.now() - (settledAt.get(queryKey) ?? 0) > ms;

        if (isStale || initiateAction.meta.force) {
          const revalidateTask = revalidateTasks.get(queryKey);
          if (revalidateTask && revalidateTask.isRunning()) {
            yield cancel(revalidateTask);
          }

          revalidateTasks.set(
            queryKey,
            yield fork(function* (): any {
              try {
                const [fulfilledAction, rejectedAction] = yield race([
                  take(createActionPattern(actionCreators.fulfilled.type, queryKey)),
                  take(createActionPattern(actionCreators.rejected.type, queryKey)),
                ]);

                const ms = currentTime(revalidateTime, fulfilledAction, rejectedAction);
                if (ms) {
                  yield delay(ms);
                  if (subscriptions.has(queryKey) && subscriptions.get(queryKey)!.size > 0) {
                    yield put(actionCreators.initiate((fulfilledAction || rejectedAction).payload.args));
                  }
                }
              } finally {
                revalidateTasks.delete(queryKey);
              }
            }),
          );

          initiateTasks.set(
            queryKey,
            yield fork(function* (): any {
              const args = initiateAction.payload.args;
              const meta = {
                queryId: initiateAction.meta.queryId,
              };

              try {
                yield put(actionCreators.pending(args, meta));
                const data = yield call(queryFn, args);
                yield put(actionCreators.fulfilled(data, args, meta));
              } catch (error) {
                yield put(actionCreators.rejected(error as E, args, meta));
              } finally {
                yield put(actionCreators.settled(args, meta));

                settledAt.set(queryKey, Date.now());
                initiateTasks.delete(queryKey);
              }
            }),
          );
        }
      }
    });
  };
};

export default createQuerySaga;
