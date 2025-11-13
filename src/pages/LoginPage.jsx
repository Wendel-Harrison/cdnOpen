// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Ajuste o caminho
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import logo from "../../public/Claro.png"; // Importa o logo

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password); // Chama a função de login
  };

  // Esta página não usa o <Layout> principal,
  // pois ela não deve ter a sidebar.
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-neutral-100 to-indigo-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <img src={logo} alt="Logo" className="w-16 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">CDN Admin Dashboard</CardTitle>
          <CardDescription>Por favor, faça login para continuar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@domain.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="************"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full !mt-6 bg-destructive hover:bg-destructive/90">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className='absolute bottom-1 text-center text-xs leading-3.5 font-light'>Desenvolvido por Engenharia de Vídeo <br /> ClaroTV+</p>
      <a href='mailto:wendel.cavalcanti@claro.com' className='absolute bottom-1 right-2 text-center text-xs leading-3.5 !font-light !text-gray-400'>contact: wendel.cavalcanti@claro.com.br</a>
    </div>
  );
}

export default LoginPage;