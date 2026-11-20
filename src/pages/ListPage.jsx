import { useLayoutEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useMatch, useNavigate, useSearchParams } from 'react-router';
import { NameForm, TaskForm } from '../components/Forms.jsx';
import { ConfirmDialog, Dialog } from '../components/Dialog.jsx';
import { TaskRow } from '../components/TaskRow.jsx';
import { useDebounce } from '../hooks/useDebounce.js';
import { createTask } from '../state/model.js';
import { useTodos } from '../state/TodoContext.jsx';
import { listPath, taskPath } from '../navigation.js';
import { NotFound } from './States.jsx';
import emptyLine from '../assets/empty-task-line.svg';

const FILTERS = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Выполненные' },
];

export function TaskFilters({ value, onChange }) {
  return (
    <div className="filters" role="group" aria-label="Фильтр задач">
      {FILTERS.map((filter) => (
        <button key={filter.value} type="button" aria-pressed={value === filter.value}
          onClick={() => onChange(filter.value)}>{filter.label}</button>
      ))}
    </div>
  );
}

export function ListPage({ listId }) {
  const { state, dispatch } = useTodos();
  const list = state.lists.find(({ id }) => id === listId);
  const navigate = useNavigate();
  const { search, state: navigationState } = useLocation();
  const [params, setParams] = useSearchParams();
  const selected = useMatch('/lists/:listId/tasks/:taskId')?.params.taskId;
  const [query, setQuery] = useState('');
  const [dialog, setDialog] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [notice, setNotice] = useState('');
  const heading = useRef(null);
  const addInput = useRef(null);
  const searchInput = useRef(null);
  const links = useRef(new Map());
  const previousTask = useRef(null);
  const focusAfterRemoval = useRef(null);
  const debouncedQuery = useDebounce(query).trim();
  const term = query.trim() ? debouncedQuery : '';

  useLayoutEffect(() => {
    if (selected) {
      previousTask.current = selected;
      return;
    }
    const previous = previousTask.current;
    previousTask.current = null;
    if (previous) {
      const target = links.current.get(navigationState?.focusTask ?? previous) ?? addInput.current;
      target?.focus();
      return;
    }
    heading.current?.focus();
  }, [selected, navigationState]);

  useLayoutEffect(() => {
    if (taskToDelete || !focusAfterRemoval.current) return;
    const { id } = focusAfterRemoval.current;
    focusAfterRemoval.current = null;
    (links.current.get(id) ?? addInput.current)?.focus();
  }, [taskToDelete]);

  if (!list) return <NotFound title="Список не найден" />;
  const tasks = state.tasks.filter((task) => task.listId === listId);
  const activeCount = tasks.filter((task) => !task.done).length;
  const filter = FILTERS.find(({ value }) => value === params.get('filter'))?.value ?? 'all';
  const filtered = tasks.filter((task) => filter === 'all' || task.done === (filter === 'completed'));
  const normalizedTerm = term.toLocaleLowerCase('ru');
  const visible = filtered.filter((task) => task.title.toLocaleLowerCase('ru').includes(normalizedTerm));
  const closeDialog = () => setDialog(null);

  function changeFilter(value) {
    if (value === filter && !selected) return;
    const next = new URLSearchParams(params);
    if (value === 'all') next.delete('filter');
    else next.set('filter', value);
    if (selected) {
      navigate({ pathname: listPath(listId), search: next.toString() });
    } else {
      setParams(next);
    }
  }

  function clearCompleted() {
    dispatch({ type: 'task/cleared', listId });
    setNotice('Выполненные задачи удалены');
    if (tasks.find((task) => task.id === selected)?.done) {
      navigate({ pathname: listPath(listId), search }, { replace: true });
    } else {
      addInput.current.focus();
    }
  }

  function toggleTask(task, index) {
    if (filter !== 'all') {
      const neighbour = visible[index + 1] ?? visible[index - 1];
      const target = links.current.get(neighbour?.id) ?? addInput.current;
      target.focus();
    }
    dispatch({ type: 'task/toggled', id: task.id });
  }

  function removeFromList() {
    const index = visible.findIndex((task) => task.id === taskToDelete.id);
    const neighbour = index < 0 ? undefined : visible[index + 1] ?? visible[index - 1];
    if (selected === taskToDelete.id) {
      navigate({ pathname: listPath(listId), search }, { replace: true, state: { focusTask: neighbour?.id } });
    } else {
      focusAfterRemoval.current = { id: neighbour?.id };
    }
    dispatch({ type: 'task/removed', id: taskToDelete.id });
    setNotice(`Задача «${taskToDelete.title}» удалена`);
    setTaskToDelete(null);
  }

  return (
    <div className={selected ? 'list-workspace list-workspace--detail' : 'list-workspace'}>
      <section className="list-pane" aria-labelledby="list-heading">
        <div className="section-head">
          <h1 id="list-heading" ref={heading} tabIndex={-1}>{list.title}</h1>
          <div className="button-row">
            <button type="button" onClick={() => setDialog('rename')}>Переименовать</button>
            <button className="danger" type="button" onClick={() => setDialog('delete')}>Удалить список</button>
          </div>
        </div>
        <div className="list-tools">
          <label htmlFor="task-search">Поиск по названию</label>
          <input id="task-search" ref={searchInput} type="search" value={query} maxLength={100}
            onChange={(event) => setQuery(event.target.value)} />
          <TaskFilters value={filter} onChange={changeFilter} />
        </div>
        <TaskForm inputRef={addInput} onSave={(values) => {
          dispatch({ type: 'task/added', task: createTask(listId, values) });
          setNotice(`Добавлена задача «${values.title}»`);
        }} />
        <p className="visually-hidden" role="status">{term ? `Найдено задач: ${visible.length}` : ''}</p>
        {visible.length > 0 ? (
          <ul className="tasks" aria-label="Задачи">
            {visible.map((task, index) => (
              <TaskRow key={task.id} task={task} selected={task.id === selected}
                address={{ pathname: taskPath(listId, task.id), search }}
                linkRef={(element) => {
                  if (element) links.current.set(task.id, element);
                  else links.current.delete(task.id);
                }}
                onToggle={() => toggleTask(task, index)} onDelete={() => setTaskToDelete(task)} />
            ))}
          </ul>
        ) : !tasks.length && !term ? (
          <div className="task-list-empty">
            <img alt="" src={emptyLine} width="64" height="3" />
            <p>В этом списке пока нет задач</p>
            <img alt="" src={emptyLine} width="64" height="3" />
          </div>
        ) : (
          <div className="empty-state">
            <p>{term ? `По запросу «${term}» ничего не найдено` : 'Задач с таким статусом пока нет'}</p>
            {term && <button type="button" onClick={() => { setQuery(''); searchInput.current.focus(); }}>
              Сбросить поиск
            </button>}
          </div>
        )}
        <div className="list-footer">
          <p aria-live="polite">Активных задач: <strong>{activeCount}</strong></p>
          <button type="button" disabled={activeCount === tasks.length} onClick={clearCompleted}>Очистить выполненные</button>
        </div>
        <p className="visually-hidden" role="status">{notice}</p>
      </section>
      <Outlet context={{ visible }} />
      {taskToDelete && (
        <ConfirmDialog title="Удалить задачу?" description={`Задача «${taskToDelete.title}» и её подзадачи будут удалены.`}
          onCancel={() => setTaskToDelete(null)} onConfirm={removeFromList} />
      )}
      {dialog === 'rename' && (
        <Dialog title="Переименовать список" onClose={closeDialog}>
          <NameForm label="Название списка" initial={list.title} button="Сохранить" onCancel={closeDialog}
            onSave={(title) => {
              dispatch({ type: 'list/renamed', id: listId, title });
              closeDialog();
            }} />
        </Dialog>
      )}
      {dialog === 'delete' && (
        <ConfirmDialog title="Удалить список?" description={`Список «${list.title}» и все его задачи будут удалены.`}
          onCancel={closeDialog} onConfirm={() => {
            closeDialog();
            dispatch({ type: 'list/removed', id: listId });
            navigate('/', { replace: true });
          }} />
      )}
    </div>
  );
}
