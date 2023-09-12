import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useQuerySelector } from './useQuerySelector';
import { useQuerySubscription } from './useQuerySubscription';
import { InitiateActionMeta } from './createQueryActionCreators';
import { ExtendedQueryState } from './createQuerySelectors';
import { QueryModuleLike } from './types';

export type UseQueryOptions<A, R> = {
  args?: Partial<A> | Partial<Record<keyof A, null>>;
  queryId?: string;
  enabled?: boolean;
  selector?: (state: any, args: A, queryId?: string) => R;
};

export const useQuery = <A, D, E, N extends string, R = ExtendedQueryState<D, E>>(
  queryModule: QueryModuleLike<A, D, E, N>,
  options: UseQueryOptions<A, R> = {},
) => {
  const { args, queryId, selector, enabled = true } = options;

  const dispatch = useDispatch();

  const initiate = useCallback(
    (meta?: Omit<InitiateActionMeta, 'queryId'>) => {
      dispatch(
        queryModule.actions.initiate(args as A, {
          ...meta,
          queryId,
        }),
      );
    },
    [dispatch, queryModule, args, queryId],
  );

  const reset = useCallback(() => {
    dispatch(
      queryModule.actions.reset(args as A, {
        queryId,
      }),
    );
  }, [dispatch, queryModule, args, queryId]);

  const selected = useQuerySelector(queryModule, {
    args,
    queryId,
    selector,
  });

  useQuerySubscription(queryModule, {
    args,
    queryId,
    enabled,
  });

  useEffect(() => {
    if (enabled) {
      dispatch(
        queryModule.actions.initiate(args as A, {
          queryId,
        }),
      );
    }
  }, [initiate, enabled, args, queryId]);

  return [selected, { initiate, reset }] as const;
};
