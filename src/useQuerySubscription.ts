import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { nanoid } from './utils';
import { QueryModuleLike } from './types';

export type UseQuerySubscriptionOptions<A> = {
  args?: Partial<A> | Partial<Record<keyof A, null>>;
  queryId?: string;
  enabled?: boolean;
};

export const useQuerySubscription = <A, D, E, N extends string>(
  queryModule: QueryModuleLike<A, D, E, N>,
  options: UseQuerySubscriptionOptions<A>,
) => {
  const { args, queryId, enabled = true } = options;

  const dispatch = useDispatch();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const action = dispatch(
      queryModule.actions.subscribe(args as A, {
        queryId,
        subscriptionId: nanoid(),
      }),
    );

    return () => {
      dispatch(
        queryModule.actions.unsubscribe(args as A, {
          queryId: action.meta.queryId,
          subscriptionId: action.meta.subscriptionId,
        }),
      );
    };
  }, [dispatch, args, queryId, enabled]);
};
