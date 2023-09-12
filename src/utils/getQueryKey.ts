import { stringify } from './stringify';

export const getQueryKey = <A = void>(args?: A, queryId?: string) => {
  const stringified = stringify(args);
  return queryId ? `${stringified}_${queryId}` : stringified;
};
