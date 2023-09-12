import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useQuerySelector } from './useQuerySelector';
import { useQuerySubscription } from './useQuerySubscription';
import { nanoid } from './utils';
import { ExtendedQueryState } from './createQuerySelectors';
import { QueryModuleLike } from './types';

type Params<A> = {
  args?: A;
  queryId?: string;
};

export type UseMutationOptions<A, R> = {
  selector?: (state: any, args: A, queryId?: string) => R;
};

export const useMutation = <A, D, E, N extends string, R = ExtendedQueryState<D, E>>(
  queryModule: QueryModuleLike<A, D, E, N>,
  options: UseMutationOptions<A, R> = {},
) => {
  const { selector } = options;
  const [{ args, queryId }, setParams] = useState<Params<A>>({});

  const dispatch = useDispatch();

  const selected = useQuerySelector(queryModule, {
    args,
    queryId,
    selector,
  });

  useQuerySubscription(queryModule, {
    args,
    queryId,
  });

  const initiate = useCallback(
    (args: A, queryId = nanoid()) => {
      const action = dispatch(
        queryModule.actions.initiate(args, {
          force: true,
          queryId,
        }),
      );

      setParams({
        args: action.payload.args,
        queryId: action.meta.queryId,
      });
    },
    [dispatch, queryModule],
  );

  const reset = useCallback(() => {
    dispatch(
      queryModule.actions.reset(args as A, {
        queryId,
      }),
    );
  }, [dispatch, queryModule, args, queryId]);

  return [selected, { initiate, reset }, { args, queryId }] as const;
};
