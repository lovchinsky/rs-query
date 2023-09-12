import { AnyAction, Action, Reducer } from 'redux';
import { produce, nothing, Draft } from 'immer';

export interface TypedActionCreator<T extends string> {
  (...args: any[]): Action<T>;
  type: T;
  toString: () => T;
}

export type CaseReducer<S = any, A extends Action = AnyAction> = (
  draft: Draft<S>,
  action: A,
) => Draft<S> | S | void | typeof nothing;

export type CaseReducerMap<S, A extends { [T in string]: Action<T> } = { [T in string]: Action<T> }> = {
  [T in keyof A]: T extends string ? (A[T] extends Action<T> ? CaseReducer<S, A[T]> : void) : never;
};

export interface CaseReducerMapBuilder<S> {
  addCase<T extends string, A extends Action<T>>(type: T, reducer: CaseReducer<S, A>): CaseReducerMapBuilder<S>;
  addCase<T extends string, AC extends TypedActionCreator<T>>(
    createAction: AC,
    reducer: CaseReducer<S, ReturnType<AC>>,
  ): CaseReducerMapBuilder<S>;
}

const executeCaseReducersBuilderCallback = <S>(
  builderCallback: (builder: CaseReducerMapBuilder<S>) => void,
): CaseReducerMap<S> => {
  const caseReducers: CaseReducerMap<S> = {};
  const builder: CaseReducerMapBuilder<S> = {
    addCase(typeOrActionCreator: any, reducer: any) {
      const type = typeof typeOrActionCreator === 'string' ? typeOrActionCreator : typeOrActionCreator.type;
      if (type in caseReducers) {
        throw new Error('addCase cannot be called with two reducers for the same action type');
      }

      caseReducers[type] = reducer;
      return builder;
    },
  };

  builderCallback(builder);
  return caseReducers;
};

export const createReducer =
  <S>(initialState: S, builderCallback: (builder: CaseReducerMapBuilder<S>) => void): Reducer<S> =>
  (state = initialState, action) => {
    const caseReducers = executeCaseReducersBuilderCallback(builderCallback);
    return produce(state, (draft) => {
      const caseReducer = caseReducers[action.type];
      if (caseReducer) {
        return caseReducer(draft, action) as any;
      }
    });
  };
