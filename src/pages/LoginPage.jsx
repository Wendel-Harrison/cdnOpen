// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner'; // <-- Importando o toast
import logo from "../../public/Claro.png";

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState(false); // <-- Estado de erro
  const [isLoading, setIsLoading] = useState(false); 
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasError(false);
    setIsLoading(true);

    try {
      // Tenta fazer o login
      await login(email, password);
    } catch (err) {
      setHasError(true);
      
      // Verifica se a mensagem de erro que veio do backend é a de inatividade
      if (err.message === 'INACTIVE_ACCOUNT') {
        toast.error(
          <div>
            Usuário inativo.<br />
            <span className="text-xs opacity-80">
               Peça a um administrador para reativar seu acesso.
            </span>
          </div>
        );
      } else {
        // Se for qualquer outro erro (ex: senha errada)
        toast.error(
          <div>
            E-mail ou senha incorretos.<br />
            <span className="text-xs opacity-80">
               Entre em contato com a Engenharia para redefinição de senha.
            </span>
          </div>
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Limpa o estado de erro assim que o usuário começar a corrigir a digitação
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (hasError) setHasError(false);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (hasError) setHasError(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-neutral-100 to-indigo-100 dark:from-neutral-900 dark:to-blue-950/20">
      <Card 
        className={`w-full max-w-md transition-all duration-300 ${
          hasError 
            ? 'border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.4)] animate-shake' 
            : 'shadow-lg border-border'
        }`}
      >
        <CardHeader className="text-center">
          <img src={logo} alt="Logo" className="w-16 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">CDN Admin Dashboard</CardTitle>
          <CardDescription className={hasError ? "text-red-500 font-medium transition-colors" : "transition-colors"}>
            {hasError ? "Falha na autenticação." : "Por favor, faça login para continuar."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className={hasError ? "text-red-500" : ""}>Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@domain.com.br"
                value={email}
                onChange={handleEmailChange} // <-- Atualizado
                required
                className={hasError ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className={hasError ? "text-red-500" : ""}>Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="************"
                value={password}
                onChange={handlePasswordChange} // <-- Atualizado
                required
                className={hasError ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className={`w-full !mt-6 ${hasError ? "bg-red-600 hover:bg-red-700 dark:text-white" : "bg-destructive hover:bg-destructive/90 dark:bg-red-600 dark:text-white"}`}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className='absolute bottom-1 text-center text-xs leading-3.5 font-light'>Desenvolvido por Engenharia de Vídeo <br /> ClaroTV+</p>
      <a href='mailto:wendel.cavalcanti@claro.com' className='absolute bottom-1 right-2 text-center text-xs leading-3.5 !font-light !text-gray-400 dark:!text-gray-600'>contact: wendel.cavalcanti@claro.com.br</a>
    </div>
  );
}

export default LoginPage;