import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/distributions" replace />;
  }

  return children;
}

export default PublicRoute;