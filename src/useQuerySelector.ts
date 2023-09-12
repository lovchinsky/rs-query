import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ExtendedQueryState } from './createQuerySelectors';
import { QueryModuleLike } from './types';

export type UseQuerySelectorOptions<A, R> = {
  args?: Partial<A> | Partial<Record<keyof A, null>>;
  queryId?: string;
  selector?: (state: any, args: A, queryId?: string) => R;
};

export const useQuerySelector = <A, D, E, N extends string, R = ExtendedQueryState<D, E>>(
  queryModule: QueryModuleLike<A, D, E, N>,
  options: UseQuerySelectorOptions<A, R>,
) => {
  const { args, queryId, selector } = options;

  return useSelector(
    useMemo(() => {
      const currentSelector = selector ? selector : queryModule.selectorCreators.makeExtendedStateSelector();
      return (state: any) => currentSelector(state, args as A, queryId) as R;
    }, [selector, args, queryId]),
  );
};
