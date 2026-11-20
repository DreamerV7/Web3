import { NavLink, useNavigate } from 'react-router';
import { useTodos } from '../state/TodoContext.jsx';
import { newId } from '../state/model.js';
import { listPath } from '../navigation.js';
import { NameForm } from './Forms.jsx';

export function Sidebar({ open, onClose, inputRef, onEscape }) {
  const { state, dispatch } = useTodos();
  const navigate = useNavigate();
  const counts = new Map();
  for (const task of state.tasks) {
    if (!task.done) counts.set(task.listId, (counts.get(task.listId) ?? 0) + 1);
  }

  function addList(title) {
    const id = newId();
    dispatch({ type: 'list/added', list: { id, title } });
    onClose();
    navigate(listPath(id));
  }

  return (
    <aside className={open ? 'sidebar sidebar--open' : 'sidebar'} id="list-sidebar"
      onKeyDown={(event) => { if (event.key === 'Escape') onEscape(); }}>
      <nav aria-label="Списки задач">
        <h2>Списки</h2>
        {state.lists.length > 0 ? (
          <ul className="list-nav">
            {state.lists.map((list) => (
              <li key={list.id}>
                <NavLink to={listPath(list.id)} onClick={onClose}>
                  <span>{list.title}</span>
                  <span className="list-count" aria-label={`Активных задач: ${counts.get(list.id) ?? 0}`}>
                    {counts.get(list.id) ?? 0}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        ) : <p className="muted">Списков пока нет.</p>}
      </nav>
      <NameForm label="Новый список" button="Создать список" inputRef={inputRef} onSave={addList} />
    </aside>
  );
}
