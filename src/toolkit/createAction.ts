export type ActionDescriptor<P = void, M = never, E = never> = {
  payload: P;
} & ([M] extends [never]
  ? {}
  : {
      meta: M;
    }) &
  ([E] extends [never]
    ? {}
    : {
        error: E;
      });

export type Action<P = void, T extends PropertyKey = string, M = never, E = never> = ActionDescriptor<P, M, E> & {
  type: T;
};

export type ActionDescriptorCreator<P = void> =
  | ((...args: any[]) => ActionDescriptor<P>)
  | ((...args: any[]) => ActionDescriptor<P, any>)
  | ((...args: any[]) => ActionDescriptor<P, never, any>)
  | ((...args: any[]) => ActionDescriptor<P, any, any>);

export type ActionCreator<P, T extends PropertyKey = string> = (P extends ActionDescriptorCreator<any>
  ? (...args: Parameters<P>) => Action<
      ReturnType<P>['payload'],
      T,
      ReturnType<P> extends {
        meta: infer M;
      }
        ? M
        : never,
      ReturnType<P> extends {
        error: infer E;
      }
        ? E
        : never
    >
  : (arg: P) => Action<P, T>) & {
  type: T;
  toString: () => T;
};

export function createAction<P = void, T extends PropertyKey = string>(type: T): ActionCreator<P, T>;

export function createAction<P extends ActionDescriptorCreator<any>, T extends PropertyKey = string>(
  type: T,
  actionDescriptorCreator: P,
): ActionCreator<P, T>;

export function createAction(type: any, actionDescriptorCreator?: any) {
  function actionCreator(...args: any[]) {
    if (typeof actionDescriptorCreator === 'function') {
      const prepared = actionDescriptorCreator(...args);
      return {
        type,
        ...prepared,
      };
    }

    return {
      type,
      payload: args[0],
    };
  }

  actionCreator.type = type;
  actionCreator.toString = () => type;

  return actionCreator;
}
