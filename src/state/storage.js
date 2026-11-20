const KEY = 'todo-app:v2';
const OLD_KEY = 'todo-app:v1';
const INBOX = { id: 'inbox', title: 'Входящие' };
const empty = () => ({ lists: [], tasks: [] });
const hasId = (item) => typeof item?.id === 'string' && item.id.length > 0;
const named = (item) => typeof item?.title === 'string' && item.title.trim().length > 0;

function unique(items, valid, normalize) {
  if (!Array.isArray(items)) return [];
  const ids = new Set();
  return items.flatMap((item) => {
    if (!hasId(item) || !valid(item) || ids.has(item.id)) return [];
    ids.add(item.id);
    return [normalize(item)];
  });
}

const validTask = (task) => named(task) && typeof task.done === 'boolean';
const namedItem = ({ id, title }) => ({ id, title: title.trim() });
const doneItem = (item) => ({ ...namedItem(item), done: item.done });

function normalizeTask(task, listId) {
  return {
    ...doneItem(task),
    listId,
    body: typeof task.body === 'string' ? task.body.trim() : '',
    createdAt: Number.isFinite(task.createdAt) ? task.createdAt : 0,
    subtasks: unique(task.subtasks, validTask, doneItem),
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) {
      const legacy = JSON.parse(localStorage.getItem(OLD_KEY));
      const tasks = unique(legacy?.tasks, validTask, (task) => normalizeTask(task, INBOX.id));
      return tasks.length ? { lists: [INBOX], tasks } : empty();
    }
    const saved = JSON.parse(raw);
    const lists = unique(saved?.lists, named, namedItem);
    const listIds = new Set(lists.map(({ id }) => id));
    const tasks = unique(saved?.tasks, (task) => validTask(task) && listIds.has(task.listId),
      (task) => normalizeTask(task, task.listId));
    return { lists, tasks };
  } catch {
    return empty();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // При недоступном хранилище менеджер продолжает работать в текущей вкладке.
  }
}
