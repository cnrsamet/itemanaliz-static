import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './routes/HomePage';
import GameItemsPage from './routes/GameItemsPage';
import ItemDetailPage from './routes/ItemDetailPage';
import MainLayout from './layouts/MainLayout';

const router = createBrowserRouter([
    {
        element: <MainLayout />,
        children: [
            {
                path: '/',
                element: <HomePage />,
            },
            {
                path: '/knight-online-itemler',
                element: <GameItemsPage />,
            },
            {
                element: <GameItemsPage />,
            },
            {
                path: '/rise-online-itemler',
                element: <GameItemsPage />,
            },
            {
                path: '/silkroad-itemler',
                element: <GameItemsPage />,
            },
            {
                path: '/:gameName/:itemName',
                element: <ItemDetailPage />,
            },
        ],
    },
]);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
