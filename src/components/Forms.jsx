import { useId, useRef, useState } from 'react';
import { MAX_BODY, MAX_TITLE, validateTask } from '../state/model.js';
import { TaskIconButton } from './TaskIconButton.jsx';

export function NameForm({ label, button, initial = '', onSave, onCancel, inputRef }) {
  const id = useId();
  const fallbackRef = useRef(null);
  const field = inputRef ?? fallbackRef;
  const [name, setName] = useState(initial);
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    const result = validateTask(name);
    if (result.error) {
      setError(result.error);
      field.current.focus();
      return;
    }
    onSave(result.title);
    setName('');
  }

  return (
    <form className="name-form" onSubmit={submit} noValidate>
      <label htmlFor={id}>{label}</label>
      <input id={id} ref={field} value={name} maxLength={MAX_TITLE} required
        aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => { setName(event.target.value); setError(''); }} />
      {error && <p className="error" id={`${id}-error`} role="alert">{error}</p>}
      <div className="button-row">
        <button className="primary" type="submit">{button}</button>
        {onCancel && <button type="button" onClick={onCancel}>Отмена</button>}
      </div>
    </form>
  );
}

export function TaskForm({ task, onSave, inputRef }) {
  const id = useId();
  const fallbackRef = useRef(null);
  const field = inputRef ?? fallbackRef;
  const [title, setTitle] = useState(task?.title ?? '');
  const [body, setBody] = useState(task?.body ?? '');
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    const result = validateTask(title, body);
    if (result.error) {
      setError(result.error);
      field.current.focus();
      return;
    }
    onSave(result);
    if (!task) {
      setTitle('');
      setBody('');
      field.current.focus();
    }
  }

  const titleField = (
    <input id={`${id}-title`} ref={field} value={title} maxLength={MAX_TITLE} required
      placeholder={task ? undefined : 'Название…'}
      aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined}
      onChange={(event) => { setTitle(event.target.value); setError(''); }} />
  );
  const errorMessage = error && <p className="error" id={`${id}-error`} role="alert">{error}</p>;

  if (!task) return (
    <form className="add-task-form" noValidate onSubmit={submit}>
      <div className="add-task-fields">
        <label className="visually-hidden" htmlFor={`${id}-title`}>Название новой задачи</label>
        {titleField}
        <label className="visually-hidden" htmlFor={`${id}-body`}>Описание</label>
        <input id={`${id}-body`} value={body} maxLength={MAX_BODY} placeholder="Описание…"
          onChange={(event) => setBody(event.target.value)} />
      </div>
      <TaskIconButton action="add" label="Добавить задачу" />
      {errorMessage}
    </form>
  );

  return (
    <form className="task-form" noValidate onSubmit={submit}>
      <label htmlFor={`${id}-title`}>Название</label>
      {titleField}
      <label htmlFor={`${id}-body`}>Описание</label>
      <textarea id={`${id}-body`} value={body} maxLength={MAX_BODY} rows={4}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            event.currentTarget.form.requestSubmit();
          }
        }}
        onChange={(event) => setBody(event.target.value)} />
      {errorMessage}
      <button className="primary" type="submit">Сохранить задачу</button>
    </form>
  );
}
