import { createBrowserRouter } from 'react-router-dom';
import Layout from '@/layouts';
import Login from '@/pages/login';
import Pets from '@/pages/pets';
import Activities from '@/pages/activities';
import HealthIndicators from '@/pages/health/indicators';
import Diseases from '@/pages/health/diseases';
import Guidelines from '@/pages/guidelines';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'pets',
        element: <Pets />,
      },
      {
        path: 'activities',
        element: <Activities />,
      },
      {
        path: 'health/indicators',
        element: <HealthIndicators />,
      },
      {
        path: 'health/diseases',
        element: <Diseases />,
      },
      {
        path: 'guidelines',
        element: <Guidelines />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
]);

export default router;
