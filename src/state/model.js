export const MAX_TITLE = 100;
export const MAX_BODY = 500;

export function validateTask(rawTitle, rawBody = '') {
  const title = rawTitle.trim();
  const body = rawBody.trim();
  if (!title) return { error: 'Введите название' };
  if (title.length > MAX_TITLE) return { error: `Название длиннее ${MAX_TITLE} символов` };
  if (body.length > MAX_BODY) return { error: `Описание длиннее ${MAX_BODY} символов` };
  return { title, body };
}

export function createTask(listId, values) {
  return { ...values, id: newId(), listId, done: false, createdAt: Date.now(), subtasks: [] };
}

export function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export const completedCount = (subtasks) => subtasks.filter(({ done }) => done).length;
