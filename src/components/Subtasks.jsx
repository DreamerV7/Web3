import { useLayoutEffect, useRef, useState } from 'react';
import { NameForm } from './Forms.jsx';
import { completedCount, newId } from '../state/model.js';
import { useTodos } from '../state/TodoContext.jsx';

export function Subtasks({ task }) {
  const { dispatch } = useTodos();
  const [editing, setEditing] = useState(null);
  const editInput = useRef(null);
  const addInput = useRef(null);
  const editButtons = useRef(new Map());
  const done = completedCount(task.subtasks);
  const total = task.subtasks.length;
  useLayoutEffect(() => {
    if (editing) editInput.current?.focus();
  }, [editing]);

  function editSubtask(type, values) {
    dispatch({ type: `subtask/${type}`, taskId: task.id, ...values });
  }

  function stopEditing(id) {
    setEditing(null);
    requestAnimationFrame(() => editButtons.current.get(id)?.focus());
  }

  return (
    <section aria-label="Подзадачи" className="subtasks">
      <h2>Подзадачи</h2>
      <p className="muted" aria-live="polite">Выполнено {done} из {total}</p>
      {total > 0 && <progress value={done} max={total} aria-label="Прогресс выполнения подзадач" />}
      {total > 0 && (
        <ul>
          {task.subtasks.map((subtask) => (
            <li key={subtask.id} className="subtask">
              {editing === subtask.id ? (
                <NameForm label="Название подзадачи" button="Сохранить" initial={subtask.title}
                  inputRef={editInput} onCancel={() => stopEditing(subtask.id)} onSave={(title) => {
                    editSubtask('renamed', { id: subtask.id, title });
                    stopEditing(subtask.id);
                  }} />
              ) : (
                <>
                  <label className="subtask-label">
                    <input type="checkbox" checked={subtask.done}
                      onChange={() => editSubtask('toggled', { id: subtask.id })} />
                    <span>{subtask.title}</span>
                  </label>
                  <div className="button-row">
                    <button type="button" ref={(element) => {
                      if (element) editButtons.current.set(subtask.id, element);
                      else editButtons.current.delete(subtask.id);
                    }} aria-label={`Изменить подзадачу «${subtask.title}»`}
                      onClick={() => setEditing(subtask.id)}>Изменить</button>
                    <button className="danger" type="button" aria-label={`Удалить подзадачу «${subtask.title}»`}
                      onClick={() => {
                        editSubtask('removed', { id: subtask.id });
                        addInput.current.focus();
                      }}>Удалить</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      <NameForm label="Новая подзадача" button="Добавить подзадачу" inputRef={addInput}
        onSave={(title) => editSubtask('added', { subtask: { id: newId(), title, done: false } })} />
    </section>
  );
}
