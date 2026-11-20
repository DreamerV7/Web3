import { createBrowserRouter, useParams } from 'react-router';
import { Layout } from './pages/Layout.jsx';
import { Home, NotFound } from './pages/States.jsx';
import { ListPage } from './pages/ListPage.jsx';
import { TaskCard } from './pages/TaskCard.jsx';

function ListRoute() {
  const { listId } = useParams();
  return <ListPage key={listId} listId={listId} />;
}

export const router = createBrowserRouter([{
  path: '/',
  element: <Layout />,
  children: [
    { index: true, element: <Home /> },
    {
      path: 'lists/:listId',
      element: <ListRoute />,
      children: [{ path: 'tasks/:taskId', element: <TaskCard /> }],
    },
    { path: '*', element: <NotFound /> },
  ],
}], { basename: import.meta.env.BASE_URL });
