function updateTask(state, id, update) {
  return { ...state, tasks: state.tasks.map((task) => task.id === id ? update(task) : task) };
}

function updateSubtasks(state, taskId, update) {
  return updateTask(state, taskId, (task) => ({ ...task, subtasks: update(task.subtasks) }));
}

export function todoReducer(state, action) {
  switch (action.type) {
    case 'list/added':
      return { ...state, lists: [...state.lists, action.list] };
    case 'list/renamed':
      return {
        ...state,
        lists: state.lists.map((list) => list.id === action.id ? { ...list, title: action.title } : list),
      };
    case 'list/removed':
      return {
        lists: state.lists.filter(({ id }) => id !== action.id),
        tasks: state.tasks.filter(({ listId }) => listId !== action.id),
      };
    case 'task/added':
      return { ...state, tasks: [...state.tasks, action.task] };
    case 'task/updated':
      return updateTask(state, action.id, (task) => ({ ...task, ...action.values }));
    case 'task/toggled':
      return updateTask(state, action.id, (task) => ({ ...task, done: !task.done }));
    case 'task/removed':
      return { ...state, tasks: state.tasks.filter(({ id }) => id !== action.id) };
    case 'task/cleared':
      return { ...state, tasks: state.tasks.filter(({ done, listId }) => !done || listId !== action.listId) };
    case 'subtask/added':
      return updateSubtasks(state, action.taskId, (items) => [...items, action.subtask]);
    case 'subtask/renamed':
      return updateSubtasks(state, action.taskId, (items) => items.map(
        (item) => item.id === action.id ? { ...item, title: action.title } : item,
      ));
    case 'subtask/toggled':
      return updateSubtasks(state, action.taskId, (items) => items.map(
        (item) => item.id === action.id ? { ...item, done: !item.done } : item,
      ));
    case 'subtask/removed':
      return updateSubtasks(state, action.taskId, (items) => items.filter(({ id }) => id !== action.id));
    default:
      throw new Error(`Неизвестное действие: ${action.type}`);
  }
}
