# RS Query

A library for data fetching, caching, and managing, built on Redux Saga

## Installation

```
npm install rs-query
```

## Documentation

### createQuery

The `createQuery` function serves as the core of **rs-query**. This function creates a module that encapsulates all the logic needed for a particular query. It provides a set of actions, selectors, a reducer, and a saga, all specifically tailored to manage and interact with the state of a given API query.

[Read more](https://github.com/lovchinsky/rs-query/wiki/API#createquery)

### useQuery

The `useQuery` hook is designed to manage the lifecycle of a query. It handles query initiation, state selection, and cleanup in a React component.

[Read more](https://github.com/lovchinsky/rs-query/wiki/API#usequery)

### useMutation

The `useMutation` hook provides a way to manage mutation operations in a React component.

[Read more](https://github.com/lovchinsky/rs-query/wiki/API#usemutation)

## Quick Start

Create Query
```typescript
import { createQuery } from 'rs-query';
import { getTodos, GetTodosParams, GetTodosResponse } from './api';

const getTodosQuery = createQuery<GetTodosParams, GetTodosResponse>()({
  queryName: 'getTodos',
  queryFn: (args) => getTodos(args),
});
```
Add Query reducer to root reducer
```typescript
const rootReducer = combineReducers({
  [getTodoQuery.queryName]: getTodoQuery.reducer,
});
```
Run Query saga
```typescript
function* rootSaga() {
  yield all([
    getTodoQuery.saga(),
  ]);
}
```
Use Query in React component
```typescript jsx
import { useQuery } from 'rs-query';
import { getTodosQuery } from './queries'

const TodoList = () => {
  const [todosState] = useQuery(getTodosQuery);

  if (todosState.isPending) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {todosState.data.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
};
```

## License

MIT

---
