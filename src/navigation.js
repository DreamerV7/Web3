export const listPath = (listId) => `/lists/${encodeURIComponent(listId)}`;
export const taskPath = (listId, taskId) => `${listPath(listId)}/tasks/${encodeURIComponent(taskId)}`;
