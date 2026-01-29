import { useState, useEffect  } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Server, Globe, Settings, TrendingUp, Plus, Trash2, Edit, LayoutDashboard, Users, Cog, Menu, X, Package, AlertTriangle, AlignStartVertical, Download, ArrowDown, Layers2, Braces, LaptopMinimalCheckIcon } from 'lucide-react'

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

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

import DistributionsPage from './pages/DistributionsPage';
import ConfigPage from './pages/ConfigPage'
import PoliciesPage from './pages/PoliciesPage'
import UsersPage from './pages/UsersPage'
import { ShieldCheck } from 'lucide-react'
import CertificatesPage from './pages/CertificatesPage'
import LoginPage from './pages/LoginPage';

import ProtectedRoute from './components/shared/ProtectedRoute';
import { LogOut } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './components/ui/tooltip'
import { useAuth } from './context/AuthContext'
import NotFoundPage from './pages/NotFoundPage'
import { User } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserProfileSheet } from '@/components/shared/UserProfileSheet';
import PublicRoute from './components/shared/PublicRoute'
import FunctionsPage from './pages/FunctionsPage'
import { ForceChangePasswordDialog } from './components/shared/ForceChangePasswordDialog'
import EditFunctionPage from './pages/EditFunctionPage'
import NodesSitesPage from './pages/NodesSitesPage'
import HistoryPage from './pages/HistoryPage'
import { FloatingDeployer } from './components/shared/FloatingDeployer'
import { GlobalOperationsWidget } from './components/shared/GlobalOperationsWidget'
import ReviewChangesPage from './pages/ReviewChangesPage'

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

function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation()
  const { logout } = useAuth();

  const menuItems = [
    { path: '/distributions', icon: Package, label: 'Distribuições' },
    { path: '/config', icon: Cog, label: 'Configurações' },
    { path: '/policies', icon: Layers2, label: 'Politicas' },
    { path: '/functions', icon: Braces, label: 'Functions' },
    { path: '/nodes', icon: LaptopMinimalCheckIcon, label: 'Nodes/Sites' },
    { path: '/certificates', icon: ShieldCheck, label: 'Certificados' },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/relatórios', icon: AlignStartVertical, label: 'Relatórios' },
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
        className={`fixed left-0 top-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out ${
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
              className=""
              onClick={toggleSidebar}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Menu Items */}
          <nav className="flex flex-col h-full p-4">
    {menuItems.map((item, index) => {
      const Icon = item.icon;
      const isActive = location.pathname === item.path;
      
      // Lógica para identificar o último item
      const isLastItem = index === menuItems.length - 1;

      return (
        <Link
          key={item.path}
          to={item.path}
          onClick={() => {
            if (window.innerWidth < 1024) {
              toggleSidebar();
            }
          }}
          className={`flex items-center gap-3 px-5 py-3 rounded-lg  text-sm  ${
            isActive 
              ? 'bg-destructive/80 !text-white'
              : 'hover:bg-gray-200 hover:text-foreground !text-gray-800'
          } ${
            isLastItem ? 'mt-auto' : 'mb-3' 
          }`}
        >
          <Icon className="h-5 w-5" />
          <span className="font-medium">{item.label}</span>
        </Link>
      );
    })}
  </nav>

          <div className="p-4 border-t border-border flex justify-between items-center">
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">Sistema Online</span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="p-1 w-8 h-8 bg-neutral-200 hover:bg-destructive/90 hover:text-white transition-all duration-200 cursor-pointer" variant="outline" onClick={logout} >
                  <LogOut className='' />
                </Badge>
              </TooltipTrigger>
              <TooltipContent variant="outline">
                <p>Sair</p>
              </TooltipContent>
            </Tooltip>
            

          </div>
        </div>
      </aside>
    </>
  )
}

// Layout Principal
function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <ForceChangePasswordDialog />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className={sidebarOpen ? "lg:pl-64 transition-all duration-300" : "transition-all duration-300"}>
        <header className="sticky top-0 z-30 backdrop-blur-sm border-b border-border  bg-gradient-to-br from-gray-800 to-gray-950">
          <div className="flex items-center justify-between p-4 pr-10">
            <Button 
              variant="outline" 
              size="icon"
              className={sidebarOpen ? "lg:opacity-0 lg:pointer-events-none transition-all duration-300" : "transition-all duration-300"}
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 ml-4">
              <h2 className="text-4xl font-bold text-neutral-50">CDN Admin Dashboard</h2>
              <p className="text-sm text-neutral-100">Gerencie suas distribuições, origins e behaviors</p>
            </div>

            {/* <Badge variant="outline" className="text-sm hidden sm:flex text-gray-950 bg-amber-50">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse " />
              Sistema Online
            </Badge> */}

            <Sheet>
              <SheetTrigger asChild>
                <Badge 
                  variant="outline" 
                  className="py-2 px-4 rounded sm:flex text-gray-950 bg-neutral-100 cursor-pointer hover:bg-neutral-300 transition-all duration-200 flex gap-2 tracking-wider font-medium"
                >
                  <p className=''>{user.name?.split(' ')[0]}</p>
                  <User />
                </Badge>
              </SheetTrigger>
              <SheetContent>
                <UserProfileSheet />
              </SheetContent>
            </Sheet>
            
            
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <Outlet />
          <GlobalOperationsWidget />
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <>
      <Routes>
        {/* Rota Pública */}
        <Route path="/" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />

        {/* Rotas Protegidas */}
        <Route 
          element={
            <ProtectedRoute> {/* 1. Proteção genérica (só checa se está logado) */}
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Estas rotas permitem 'admin', 'editor' e 'viewer' */}
          <Route path="/distributions" element={<DistributionsPage />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/functions" element={<FunctionsPage />} />
          <Route path="/nodes" element={<NodesSitesPage />} />
          <Route path="/functions/:id" element={<EditFunctionPage />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/review" element={<ReviewChangesPage />} />
          
          {/* Esta rota SÓ permite 'admin' */}
          <Route 
            path="/users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UsersPage />
              </ProtectedRoute>
            } 
          />
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      
      <Toaster richColors position="top-center" />
    </>
  )
}

export default App