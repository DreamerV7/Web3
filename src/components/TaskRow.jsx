import { Link } from 'react-router';
import { completedCount } from '../state/model.js';
import { TaskIconButton } from './TaskIconButton.jsx';

export function TaskRow({ task, address, selected, onToggle, onDelete, linkRef }) {
  const total = task.subtasks.length;
  const done = completedCount(task.subtasks);
  return (
    <li className={task.done ? 'task-row task-row--done' : 'task-row'}>
      <div className="task-row-text">
        <Link to={address} ref={linkRef} aria-current={selected ? 'page' : undefined}>{task.title}</Link>
        {task.body && <p>{task.body}</p>}
        {total > 0 && <span className="progress-count" aria-label={`Подзадачи: ${done} из ${total}`}>
          {done}/{total}
        </span>}
      </div>
      <input type="checkbox" checked={task.done} onChange={onToggle}
        aria-label={`Выполнено: ${task.title}`} />
      <TaskIconButton action="delete" label={`Удалить задачу «${task.title}»`} onClick={onDelete} />
    </li>
  );
}
