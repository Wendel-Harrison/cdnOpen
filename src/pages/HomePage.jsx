import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  Server, 
  ShieldCheck, 
  Code, 
  Activity, 
  AlertCircle, 
  ArrowRight,
  Network,
  Users,
  ScrollText,
  LayoutDashboard,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [distributions, setDistributions] = useState([]);
  const [origins, setOrigins] = useState([]);
  
  // Estado para controlar o loading da verificação de status
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  const [stats, setStats] = useState({
    functions: 8, 
    pendingChanges: 0 
  });

  useEffect(() => {
    const fetchDistributionsAndStatus = async () => {
      setIsLoadingStatus(true); // Inicia o loading
      try {
        const resList = await fetch('/api/distributions?limit=1000'); 
        if (!resList.ok) throw new Error('Falha ao buscar distribuições');
        
        const jsonList = await resList.json();
        const allDists = Array.isArray(jsonList) ? jsonList : (jsonList.data || []);
        
        setDistributions(allDists);

        // Consulta o status REAL de cada uma
        const statusPromises = allDists.map(async (dist) => {
          try {
            const resStatus = await fetch(`/api/distributions/${dist.id}/status`);
            const statusData = await resStatus.json();
            return { ...dist, real_status: statusData.status };
          } catch (err) {
            return { ...dist, real_status: 'UNKNOWN' };
          }
        });

        const distsWithRealStatus = await Promise.all(statusPromises);

        const changed = distsWithRealStatus.filter(d => d.real_status === 'CHANGED');
        const validated = distsWithRealStatus.filter(d => d.real_status === 'VALIDATED');

        const totalPending = changed.length + validated.length;

        setStats(prev => ({
          ...prev,
          pendingChanges: totalPending
        }));

      } catch (error) {
        console.error("Erro ao carregar status global na Home:", error);
      } finally {
        setIsLoadingStatus(false); // Finaliza o loading
      }
    };

    const fetchOrigins = async () => {
      try {
        const response = await fetch('/api/origins'); 
        if (!response.ok) throw new Error('Falha ao buscar origins');
        
        const data = await response.json();
        const originsList = Array.isArray(data) ? data : (data.data || []);
        setOrigins(originsList);
      } catch (error) {
        console.error("Erro ao carregar origins na Home:", error);
      }
    };

    fetchDistributionsAndStatus();
    fetchOrigins();

  }, []);

  const quickLinks = [
    {
      title: "Distribuições",
      description: "Gerencie domínios, rotas e status de deploy das suas CDNs.",
      icon: <Globe className="h-8 w-8 text-blue-500" />,
      path: "/distributions",
      color: "hover:border-blue-500 hover:shadow-blue-100"
    },
    {
      title: "Configurações (Origins)",
      description: "Configure servidores de origem e defina regras de behavior.",
      icon: <Server className="h-8 w-8 text-indigo-500" />,
      path: "/config",
      color: "hover:border-indigo-500 hover:shadow-indigo-100"
    },
    {
      title: "Políticas",
      description: "Crie regras de Cache e Origin reutilizáveis para a borda.",
      icon: <ShieldCheck className="h-8 w-8 text-emerald-500" />,
      path: "/policies",
      color: "hover:border-emerald-500 hover:shadow-emerald-100"
    },
    {
      title: "Edge Functions",
      description: "Escreva códigos Lua para interceptar e modificar requisições.",
      icon: <Code className="h-8 w-8 text-amber-500" />,
      path: "/functions",
      color: "hover:border-amber-500 hover:shadow-amber-100"
    },
    {
      title: "Nodes & Sites",
      description: "Visualize a topologia e saúde dos servidores físicos da CDN.",
      icon: <Network className="h-8 w-8 text-purple-500" />,
      path: "/nodes",
      color: "hover:border-purple-500 hover:shadow-purple-100"
    },
    {
      title: "Dashboards",
      description: "Veja todos os Dashboards do funcionamento da CDN em tempo real.",
      icon: <LayoutDashboard className="h-8 w-8 text-teal-500" />, 
      path: "/dashboard",
      color: "hover:border-teal-500 hover:shadow-teal-100"
    },
    {
      title: "Auditoria & Logs",
      description: "Acompanhe quem criou, editou ou deletou recursos no sistema.",
      icon: <ScrollText className="h-8 w-8 text-slate-500" />,
      path: "/history",
      color: "hover:border-slate-500 hover:shadow-slate-100"
    },
    {
      title: "Gerenciamento de Usuários",
      description: "Gerencie todos os Usuários e funções de acesso à interface.",
      icon: <Users className="h-8 w-8 text-violet-500" />,
      path: "/users",
      color: "hover:border-violet-500 hover:shadow-violet-100"
    }
  ];

  return (
    <div className="space-y-8 pb-8">
      
      {/* CABEÇALHO E BOAS VINDAS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 min-h-[40px]">
        
        {/* LÓGICA DO STATUS (Carregando -> Amarelo -> Verde) */}
        {isLoadingStatus ? (
          <div className="flex relative items-center gap-3 bg-slate-50 border border-slate-200 text-slate-500 px-4 py-1.5 rounded-lg shadow-sm animate-pulse">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            <span className="font-medium text-sm">Verificando status do sistema...</span>
          </div>
        ) : stats.pendingChanges > 0 ? (
          <div className="flex relative items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-1.5 rounded-lg shadow-sm animate-fade-in-up">
            <AlertCircle className="h-5 w-5 text-amber-600 animate-pulse" />
            <span className="font-medium text-sm">Você tem {stats.pendingChanges} alteração pendente de deploy.</span>
            <Button size="sm" variant="outline" className="ml-2 bg-white border-amber-300 hover:bg-amber-100 text-amber-900 text-xs" onClick={() => navigate('/review')}>
              Revisar
            </Button>
          </div>
        ) : (
          <div className="flex relative items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-1.5 rounded-lg shadow-sm animate-fade-in-up">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="font-medium text-sm">Ambiente seguro. Nenhuma alteração pendente.</span>
          </div>
        )}

      </div>

      {/* CARDS DE MÉTRICAS RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="relative overflow-hidden group shadow-sm transition-all duration-700 hover:shadow-md cursor-default border-0 bg-white">
            <div className="absolute top-0 left-0 h-full w-1 bg-blue-500 transition-all duration-700 ease-in-out group-hover:w-full z-0"></div>
            <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground transition-colors duration-700 group-hover:text-blue-100">
                Distribuições Ativas
                </CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground transition-colors duration-700 group-hover:text-blue-100" />
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-slate-800 transition-colors duration-700 group-hover:text-white">
                {distributions.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1 transition-colors duration-700 group-hover:text-blue-100">
                Domínios gerenciados
                </p>
            </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden group shadow-sm transition-all duration-700 hover:shadow-md border-0 bg-white">
          <div className="absolute top-0 left-0 h-full w-1 bg-indigo-500 transition-all duration-700 ease-in-out group-hover:w-full z-0"></div>
          <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground transition-colors duration-700 group-hover:text-indigo-100">
              Origins Cadastrados
            </CardTitle>
            <Server className="h-4 w-4 text-muted-foreground transition-colors duration-700 group-hover:text-indigo-100" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-slate-800 transition-colors duration-700 group-hover:text-white">
              {origins.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1 transition-colors duration-700 group-hover:text-indigo-100">
              Servidores mapeados
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group shadow-sm transition-all duration-700 hover:shadow-md border-0 bg-white">
          <div className="absolute top-0 left-0 h-full w-1 bg-amber-500 transition-all duration-700 ease-in-out group-hover:w-full z-0"></div>
          <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground transition-colors duration-700 group-hover:text-amber-100">
              Nodes & Edges
            </CardTitle>
            <Code className="h-4 w-4 text-muted-foreground transition-colors duration-700 group-hover:text-amber-100" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-slate-800 transition-colors duration-700 group-hover:text-white">
              {stats.functions}
            </div>
            <p className="text-xs text-muted-foreground mt-1 transition-colors duration-700 group-hover:text-amber-100">
              Nós cadastrados na CDN - N1 à N3
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group shadow-sm transition-all duration-700 hover:shadow-md border-0 bg-emerald-50/50">
          <div className="absolute top-0 left-0 h-full w-1 bg-emerald-500 transition-all duration-700 ease-in-out group-hover:w-full z-0"></div>
          <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 transition-colors duration-700 group-hover:text-emerald-100">
              Status do Sistema
            </CardTitle>
            <Activity className="h-4 w-4 text-emerald-600 transition-colors duration-700 group-hover:text-emerald-100" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-emerald-700 flex items-center gap-2 transition-colors duration-700 group-hover:text-white">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 group-hover:bg-emerald-200 transition-colors duration-700"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 group-hover:bg-white transition-colors duration-700"></span>
              </span>
              Online
            </div>
            <p className="text-xs text-emerald-600/80 mt-1 transition-colors duration-300 group-hover:text-emerald-100">
              Todos os nodes operacionais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* NAVEGAÇÃO / ACESSO RÁPIDO */}
      <div>
        <h2 className="text-xl font-bold tracking-wide  text-slate-900 mb-6 mt-24 pt-10 border-t">Acesso Rápido:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mx-28 ">
          {quickLinks.map((link, index) => (
            <Card 
              key={index} 
              onClick={() => navigate(link.path)}
              className={`cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md rounded ${link.color} `}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="rounded-lg group-hover:scale-110 transition-transform duration-200">
                  {link.icon}
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground group-hover:text-slate-900 group-hover:translate-x-1 transition-all">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base mb-1">{link.title}</CardTitle>
                <CardDescription className="text-xs">
                  {link.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}