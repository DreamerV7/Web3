import { useLayoutEffect, useRef } from 'react';
import { Link, useOutletContext } from 'react-router';
import { useTodos } from '../state/TodoContext.jsx';
import { listPath } from '../navigation.js';

export function Home() {
  const { state } = useTodos();
  const { openLists } = useOutletContext();
  const heading = useRef(null);
  useLayoutEffect(() => { heading.current.focus(); }, []);
  const first = state.lists[0];

  return (
    <section className="home">
      <h1 ref={heading} tabIndex={-1}>{first ? 'Ваши списки' : 'Создайте первый список'}</h1>
      <p>{first ? 'Выберите список на боковой панели, чтобы открыть его задачи.' : 'Соберите задачи по теме: например, «Учёба» или «Дом».'}</p>
      {first ? <Link className="button primary" to={listPath(first.id)}>Открыть «{first.title}»</Link> :
        <button className="primary" type="button" onClick={openLists}>Создать список</button>}
    </section>
  );
}

export function NotFound({ title = 'Страница не найдена', back = '/' }) {
  const heading = useRef(null);
  useLayoutEffect(() => { heading.current.focus(); }, [title, back]);
  return (
    <section className="not-found">
      <h1 ref={heading} tabIndex={-1}>{title}</h1>
      <Link className="button" to={back}>{back === '/' ? 'На главную' : 'Вернуться к списку'}</Link>
    </section>
  );
}
