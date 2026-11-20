import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router';
import { TaskForm } from '../components/Forms.jsx';
import { ConfirmDialog, Dialog } from '../components/Dialog.jsx';
import { Subtasks } from '../components/Subtasks.jsx';
import { useTodos } from '../state/TodoContext.jsx';
import { listPath } from '../navigation.js';
import { copyText, shareLinks } from '../share.js';
import { NotFound } from './States.jsx';

const dateFormat = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
const services = { vk: 'ВКонтакте', telegram: 'Telegram', whatsapp: 'WhatsApp', facebook: 'Facebook' };

function TaskDetails({ task, back }) {
  const { dispatch } = useTodos();
  const { visible } = useOutletContext();
  const navigate = useNavigate();
  const panel = useRef(null);
  const heading = useRef(null);
  const [dialog, setDialog] = useState(null);
  const [notice, setNotice] = useState('');
  const closeDialog = () => setDialog(null);
  useLayoutEffect(() => { heading.current.focus(); }, []);
  const { pathname, search } = back;

  useEffect(() => {
    function dismissOnOutsideClick(event) {
      if (event.defaultPrevented || !(event.target instanceof Element)) return;
      if (event.composedPath().includes(panel.current) || event.target.closest('dialog, a[href], .filters button')) return;
      navigate({ pathname, search }, { replace: true });
    }

    function dismissOnEscape(event) {
      if (event.key !== 'Escape' || event.defaultPrevented || document.querySelector('dialog[open]')) return;
      event.preventDefault();
      navigate({ pathname, search }, { replace: true });
    }

    document.addEventListener('click', dismissOnOutsideClick);
    document.addEventListener('keydown', dismissOnEscape);
    return () => {
      document.removeEventListener('click', dismissOnOutsideClick);
      document.removeEventListener('keydown', dismissOnEscape);
    };
  }, [navigate, pathname, search]);
  const text = task.body ? `${task.title}\n${task.body}` : task.title;

  function removeTask() {
    const index = visible.findIndex(({ id }) => id === task.id);
    const neighbour = index < 0 ? undefined : visible[index + 1] ?? visible[index - 1];
    closeDialog();
    dispatch({ type: 'task/removed', id: task.id });
    navigate(back, { replace: true, state: { focusTask: neighbour?.id } });
  }

  return (
    <section className="task-pane" ref={panel} aria-labelledby="card-heading">
      <Link to={back} className="back-link">Вернуться к списку</Link>
      <h1 id="card-heading" ref={heading} tabIndex={-1}>{task.title}</h1>
      {Math.abs(task.createdAt) <= 8.64e15 && task.createdAt > 0 &&
        <p className="muted">Создана {dateFormat.format(task.createdAt)}</p>}
      <label className="check-label">
        <input type="checkbox" checked={task.done}
          onChange={() => dispatch({ type: 'task/toggled', id: task.id })} />
        Задача выполнена
      </label>
      <TaskForm task={task} onSave={(values) => {
        dispatch({ type: 'task/updated', id: task.id, values });
        setNotice('Изменения сохранены');
      }} />
      <Subtasks task={task} />
      <div className="button-row task-actions">
        <button type="button" onClick={() => setDialog('share')}>Поделиться</button>
        <button className="danger" type="button" onClick={() => setDialog('delete')}>Удалить задачу</button>
      </div>
      <p className="muted" role="status">{notice}</p>
      {dialog === 'delete' && <ConfirmDialog title="Удалить задачу?"
        description={`Задача «${task.title}» и её подзадачи будут удалены.`}
        onCancel={closeDialog} onConfirm={removeTask} />}
      {dialog === 'share' && (
        <Dialog title="Поделиться задачей" onClose={closeDialog}>
          <div className="button-row">
            <button type="button" onClick={async () => {
              const copied = await copyText(text);
              setDialog((current) => current === 'share' ? null : current);
              setNotice(copied ? 'Текст задачи скопирован' : 'Не удалось скопировать текст');
            }}>Копировать текст</button>
            {Object.entries(shareLinks({ title: task.title, text, url: window.location.href.split('#')[0] }))
              .map(([key, href]) => <a className="button" key={key} href={href}
                target="_blank" rel="noopener noreferrer" onClick={closeDialog}>{services[key]}</a>)}
            <button type="button" onClick={closeDialog}>Закрыть</button>
          </div>
        </Dialog>
      )}
    </section>
  );
}

export function TaskCard() {
  const { listId, taskId } = useParams();
  const { search } = useLocation();
  const { state } = useTodos();
  const task = state.tasks.find((item) => item.listId === listId && item.id === taskId);
  const back = { pathname: listPath(listId), search };
  return task ? <TaskDetails key={task.id} task={task} back={back} /> :
    <NotFound title="Задача не найдена" back={back} />;
}
