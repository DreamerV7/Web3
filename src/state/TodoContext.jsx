import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { loadState, saveState } from './storage.js';
import { todoReducer } from './todoReducer.js';

const TodoContext = createContext(null);

export function TodoProvider({ children }) {
  const [state, dispatch] = useReducer(todoReducer, undefined, loadState);
  useEffect(() => saveState(state), [state]);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <TodoContext value={value}>{children}</TodoContext>;
}

export const useTodos = () => useContext(TodoContext);
