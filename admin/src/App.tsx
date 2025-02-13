import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { App as AntdApp } from 'antd';
import BasicLayout from './layouts/BasicLayout';
import LoginPage from './pages/login';
import DashboardPage from './pages/dashboard';
import AppUserList from './pages/app-users/list';
import PetList from './pages/pets/list';
import ActivityList from './pages/activities/list';
import HealthPage from './pages/health';
import HealthIndicatorList from './pages/health/indicators/list';
import DiseaseList from './pages/health/diseases/list';
import GuidelinesPage from './pages/guidelines';

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const RequireNoAuth = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (token) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return children;
};

const App: React.FC = () => {
  return (
    <AntdApp>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            <RequireNoAuth>
              <LoginPage />
            </RequireNoAuth>
          } />
          <Route path="/" element={
            <RequireAuth>
              <BasicLayout />
            </RequireAuth>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="app-users" element={<AppUserList />} />
            <Route path="pets" element={<PetList />} />
            <Route path="activities" element={<ActivityList />} />
            <Route path="health" element={<HealthPage />}>
              <Route index element={<Navigate to="/health/indicators" replace />} />
              <Route path="indicators" element={<HealthIndicatorList />} />
              <Route path="diseases" element={<DiseaseList />} />
            </Route>
            <Route path="guidelines" element={<GuidelinesPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AntdApp>
  );
};

export default App;
