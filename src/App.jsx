import { useState, useEffect  } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Server, Globe, Settings, TrendingUp, Plus, Trash2, Edit, LayoutDashboard, Users, Cog, Menu, X, Package, AlertTriangle } from 'lucide-react'
import './App.css'
import logo from "../public/Claro.png"
import { SelectGroup } from '@radix-ui/react-select'
import { Toaster } from '@/components/ui/sonner'
import { toast } from "sonner"
import { IconPlus } from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"

import DistributionsPage from './pages/DistributionsPage';
import ConfigPage from './pages/ConfigPage'
import PoliciesPage from './pages/PoliciesPage'


// Página de Dashboard
function DashboardPage() {
  const [distributions, setDistributions] = useState([
    { id: 1, name: 'STB', domain_name: 'cdn.stb.example.com', status: 'deployed' },
    { id: 2, name: 'APP', domain_name: 'cdn.app.example.com', status: 'deployed' },
    { id: 3, name: 'Radio', domain_name: 'cdn.radio.example.com', status: 'deployed' }
  ])

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-10 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Distribuições</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{distributions.length}</div>
            <p className="text-xs text-muted-foreground">
              {distributions.filter(d => d.status === 'deployed').length} ativas
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Hit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.5%</div>
            <p className="text-xs text-muted-foreground">
              +2.5% desde ontem
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Métricas */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Desempenho</CardTitle>
          <CardDescription>Visualização de requisições e taxa de hit nas últimas 24 horas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">Gráfico de métricas seria exibido aqui (integração com Recharts)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ConfigPage2() {

  const ORIGINS_API_URL = '/api/origins'; // Endpoint para buscar/criar origins
  const DISTRIBUTIONS_API_URL = '/api/distributions'; // Endpoint para buscar as distributions

  const [origins, setOrigins] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formErrors, setFormErrors] = useState({});

    // ESTADOS PARA O DIALOG
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState(null);

   const [behaviors, setBehaviors] = useState([
    { id: 1, distribution_id: 1, path_pattern: '/videos/*', origin_id: 'stb-origin-1', cache_ttl: 86400, cache_policy: 'public', forward_query_strings: false, forward_cookies: false, priority: 0 },
    { id: 2, distribution_id: 2, path_pattern: '/assets/images/*', origin_id: 'app-origin-1', cache_ttl: 3600, cache_policy: 'public', forward_query_strings: false, forward_cookies: false, priority: 0 },
    { id: 3, distribution_id: 3, path_pattern: '/audio/*', origin_id: 'radio-origin-1', cache_ttl: 259200, cache_policy: 'public', forward_query_strings: false, forward_cookies: false, priority: 0 }
  ])

  const handleSaveOrigin = async (updatedOrigin) => {
    try {
      const response = await fetch(`${ORIGINS_API_URL}/${updatedOrigin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrigin),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar o origin');
      }

      const data = await response.json();
      
      // Atualiza a lista de origins no estado com os novos dados
      setOrigins(origins.map(o => o.id === data.id ? data : o));
      setIsDialogOpen(false); // Fecha o dialog
      toast.success("Origin atualizado com sucesso!");

    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar o origin", { description: err.message });
    }
  };


  // Estado para o formulário de novo origin
  const [newOrigin, setNewOrigin] = useState({
    distribution_id: '',
    origin_id: '',
    domain_name: '',
  });

  // useEffect para buscar todos os dados necessários da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Busca os origins e distributions em paralelo
        const [originsRes, distributionsRes] = await Promise.all([
          fetch(ORIGINS_API_URL),
          fetch(DISTRIBUTIONS_API_URL)
        ]);

        if (!originsRes.ok || !distributionsRes.ok) {
          throw new Error('Falha ao buscar dados da API');
        }

        const originsData = await originsRes.json();
        const distributionsData = await distributionsRes.json();

        setOrigins(originsData);
        setDistributions(distributionsData);

        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handler para atualizar o estado do formulário
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewOrigin(prev => ({ ...prev, [name]: value }));
  };

  // Função para adicionar um novo origin
  const handleAddOrigin = async () => {
    if (!newOrigin.distribution_id || !newOrigin.origin_id || !newOrigin.domain_name) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const response = await fetch(ORIGINS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distribution_id: parseInt(newOrigin.distribution_id), // Garante que o ID seja um número
          distribution_name: newOrigin.distribution_name,
          origin_id: newOrigin.origin_id,
          domain_name: newOrigin.domain_name,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar o origin');
      }

      const createdOrigin = await response.json();
      setOrigins(prev => [...prev, createdOrigin]); // Adiciona o novo origin à lista
      
      // Limpa os campos do formulário, mantendo o distribution_id selecionado
      setNewOrigin(prev => ({
        ...prev,
        origin_id: '',
        domain_name: '',
      }));

    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (isLoading) return <p>Carregando configurações...</p>;
  if (error) return <p className="text-destructive">Erro: {error}</p>;

  // Dentro do componente ConfigPage

const handleDeleteOrigin = (originId, originName) => { // Passamos o nome para a mensagem
  toast("Confirmar Exclusão", {
    // Mensagem principal e descrição para o usuário
    title: `Tem certeza que deseja deletar o origin "${originName}"`,
    
    // Faz o toast ficar visível até o usuário interagir
    duration: Infinity, 
    
    
    // Estilo visual que destaca o toast
    important: true, 

    // Botão de confirmação (ação principal)
    action: {
      label: "Confirmar",
      onClick: async () => {
        try {
          const response = await fetch(`${ORIGINS_API_URL}/${originId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Falha ao deletar o origin.');
          }

          setOrigins(prevOrigins => prevOrigins.filter(o => o.id !== originId));
          toast.success("Origin deletado com sucesso!");

        } catch (err) {
          console.error("Erro ao deletar origin:", err);
          toast.error("Erro ao deletar origin", {
            description: err.message,
          });
        }
      },
    },
    
    cancel: {
      label: "Cancelar",
      onClick: () => {}, // Apenas fecha o toast, não faz mais nada
    },
  });
};

 

  return (
    <div className="space-y-6">
      <Tabs defaultValue="origins" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="origins">Origins</TabsTrigger>
          <TabsTrigger value="behaviors">Behaviors</TabsTrigger>
        </TabsList>

        <TabsContent value="origins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Novo Origin</CardTitle>
              <CardDescription>Configure um novo servidor de origem para uma distribuição</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-6">
                <div className="flex-1 gap-2 flex flex-col">
                  <Label htmlFor="distribution_id">Distribuição</Label>
                  <Select
                    value={newOrigin.distribution_id ? newOrigin.distribution_id.toString() : ''}
                    onValueChange={(value) => handleFormChange({ target: { name: 'distribution_id', value: value } })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma Distribuição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Distribuições</SelectLabel>
                        {distributions.map(dist => (
                          <SelectItem key={dist.id} value={dist.id.toString()}>
                            {dist.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 gap-2 flex flex-col">
                  <Label htmlFor="origin_id">Nome do Origin</Label>
                  <Input
                    id="origin_id"
                    name="origin_id"
                    placeholder="ex: vos-cluster-lab"
                    value={newOrigin.origin_id}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="flex-2 gap-2 flex flex-col">
                  <Label htmlFor="domain_name">Domínio do Origin</Label>
                  <Input
                    id="domain_name"
                    name="domain_name"
                    placeholder="cdn.stb.example.com"
                    value={newOrigin.domain_name}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <Button onClick={handleAddOrigin} variant="secundary" className="w-full">Enviar</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Origins Configurados</CardTitle>
              <CardDescription>Lista de todos os origins gerenciados pela CDN</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Distribution ID</TableHead>
                    <TableHead>Origin ID</TableHead>
                    <TableHead>Domínio</TableHead>
                    <TableHead>Path Prefix</TableHead>
                    <TableHead>Protocolo</TableHead>
                    <TableHead>Porta</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {origins.map((origin) => (
                    <TableRow key={origin.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <Badge className="px-2 py-1">
                          {origin.id}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="px-4 py-1">
                          {distributions.find(dist => dist.id === origin.distribution_id)?.name || 'Não encontrada'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="px-4 py-1 ">
                          {origin.origin_id}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="w-full py-1">
                          {origin.domain_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="px-4 py-1">
                          {origin.path_prefix}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="px-4 py-1">
                          {origin.protocol}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="px-2 py-1">
                          {origin.port}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setSelectedOrigin(origin); // Guarda o origin clicado no estado
                              setIsDialogOpen(true);     // Abre o dialog
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteOrigin(origin.id, origin.origin_id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        {formErrors.domain_name && (
          <Alert variant="destructive" className="mt-2 flex items-center">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              {formErrors.domain_name}
            </AlertDescription>
          </Alert>
        )
        }
        {selectedOrigin && (
        <EditOriginDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          origin={selectedOrigin}
          onSave={handleSaveOrigin}
        />
      )}

        

        {/* Behaviors Tab */}
        <TabsContent value="behaviors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Novo Behavior</CardTitle>
              <CardDescription>Defina políticas de cache para diferentes tipos de conteúdo</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Formulário para adicionar novo behavior */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Behaviors Configurados</CardTitle>
              <CardDescription>Políticas de cache aplicadas às distribuições</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Distribution ID</TableHead>
                    <TableHead>Path Pattern</TableHead>
                    <TableHead>Origin ID</TableHead>
                    <TableHead>TTL</TableHead>
                    <TableHead>Política</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {behaviors.map((behavior) => (
                    <TableRow key={behavior.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{behavior.id}</TableCell>
                      <TableCell>{behavior.distribution_id}</TableCell>
                      <TableCell><code className="text-xs bg-muted px-2 py-1 rounded">{behavior.path_pattern}</code></TableCell>
                      <TableCell>{behavior.origin_id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{behavior.cache_ttl}</Badge>
                      </TableCell>
                      <TableCell>{behavior.cache_policy}</TableCell>
                      <TableCell>{behavior.priority}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Página de Usuários
function UsersPage() {
  const [users, setUsers] = useState([
    { id: 1, name: 'João Silva', email: 'joao@example.com', role: 'admin', status: 'active' },
    { id: 2, name: 'Maria Santos', email: 'maria@example.com', role: 'editor', status: 'active' },
    { id: 3, name: 'Pedro Costa', email: 'pedro@example.com', role: 'viewer', status: 'inactive' }
  ])

  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'viewer', status: 'active' })

  const addUser = () => {
    if (newUser.name && newUser.email) {
      setUsers([...users, { ...newUser, id: users.length + 1 }])
      setNewUser({ name: '', email: '', role: 'viewer', status: 'active' })
    }
  }

  const deleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Usuário</CardTitle>
          <CardDescription>Crie um novo usuário para acessar o painel de administração</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Nome</Label>
              <Input
                id="user-name"
                placeholder="Nome do usuário"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                placeholder="email@example.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-role">Função</Label>
              <select
                id="user-role"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="admin">Administrador</option>
                <option value="editor">Editor</option>
                <option value="viewer">Visualizador</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={addUser} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Usuário
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
          <CardDescription>Lista de todos os usuários com acesso ao sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteUser(user.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente de Sidebar
function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation()

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/distributions', icon: Package, label: 'Distribuições' },
    { path: '/config', icon: Cog, label: 'Configurações' },
    { path: '/policies', icon: Users, label: 'Politicas' },
    { path: '/users', icon: Users, label: 'Usuários' },
  ]

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className='w-10' />
              <span className="text-xl font-bold">CDN Claro</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={toggleSidebar}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      toggleSidebar()
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-destructive/70 text-primary' 
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">Sistema Online</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

// Layout Principal
function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between p-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 lg:ml-0 ml-4">
              <h1 className="text-2xl font-bold">CDN Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Gerencie suas distribuições, origins e behaviors</p>
            </div>

            <Badge variant="outline" className="text-sm hidden sm:flex">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              Sistema Online
            </Badge>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

// App Principal
function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/distributions" element={<DistributionsPage />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Routes>
      </Layout>

      <Toaster richColors position="top-center" />
    </Router>
  )
}

export default App