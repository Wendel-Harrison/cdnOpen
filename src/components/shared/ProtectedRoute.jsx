// src/components/ProtectedRoute.jsx
import { useAuth } from '../../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner'; // 1. Importe o toast
import { useEffect } from 'react'; // 2. Importe o useEffect

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // 1. Verifica se está logado
  if (!isAuthenticated) {
    // Se não estiver, vai para o login (não precisa de toast aqui)
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2. Verifica se a rota tem restrição E se o usuário NÃO tem a permissão
  const isAuthorized = allowedRoles ? allowedRoles.includes(user.role) : true;
  //    antes de navegar.
  useEffect(() => {
    if (!isAuthorized) {
      toast.error("Acesso Negado", {
        description: "Você não tem permissão para acessar esta página.",
        duration: 3000,
      });
    }
  }, [isAuthorized]); // Este efeito roda se o status de autorização mudar

  // 4. Se não estiver autorizado, redireciona
  if (!isAuthorized) {
    return <Navigate to="/distributions" replace />;
  }

  // Se passou em tudo, mostra a página
  return children;
}

export default ProtectedRoute;