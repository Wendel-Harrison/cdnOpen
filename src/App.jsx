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
          className="fixed inset-0  z-40 lg:hidden"
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
          <nav className="flex-1 p-4 space-y-3">
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
                      ? 'bg-destructive/80 !text-white' 
                      : 'hover:bg-gray-200  hover:text-foreground !text-gray-800'
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