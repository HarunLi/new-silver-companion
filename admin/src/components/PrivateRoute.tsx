import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  element: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/user/login" replace />;
  }

  return element;
};

export default PrivateRoute;
