import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Rocket, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
} from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function GlobalOperationsWidget() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isViewer = user?.role === 'viewer';
  
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Listas de estado
  const [changedDists, setChangedDists] = useState([]);
  const [validatedDists, setValidatedDists] = useState([]);

  const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false);
  const [deployingId, setDeployingId] = useState(null);

  const API_URL = 'http://10.127.254.87:3000'; 

  const fetchGlobalStatus = async () => {
    if (!dataLoaded) setLoading(true); 
    
    try {
      const resList = await fetch(`${API_URL}/distributions?limit=1000`);
      const jsonList = await resList.json();
      const allDists = jsonList.data || [];

      const statusPromises = allDists.map(async (dist) => {
        try {
          const resStatus = await fetch(`${API_URL}/distributions/${dist.id}/status`);
          const statusData = await resStatus.json();
          return { ...dist, real_status: statusData.status };
        } catch (err) {
          return { ...dist, real_status: 'UNKNOWN' };
        }
      });

      const distsWithRealStatus = await Promise.all(statusPromises);

      const changed = distsWithRealStatus.filter(d => d.real_status === 'CHANGED');
      const validated = distsWithRealStatus.filter(d => d.real_status === 'VALIDATED');

      setChangedDists(changed);
      setValidatedDists(validated);
      setDataLoaded(true);

      if (validated.length === 0) {
        setIsDeployDialogOpen(false);
      }

    } catch (error) {
      console.error("Erro ao buscar status global", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalStatus();
    const interval = setInterval(fetchGlobalStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDeploySingle = async (distId, distName) => {
    if (!confirm(`Confirma o envio da distribuição ${distName} para PRODUÇÃO?`)) return;
    
    setDeployingId(distId);
    toast.info(`Iniciando deploy: ${distName}...`);

    try {
      const response = await fetch(`${API_URL}/distributions/${distId}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            user_email: user?.email,
            user_name: user?.name,
            description: "Deploy Individual Manual"
        }),
      });

      if (!response.ok) throw new Error(await response.text());
      
      toast.success(`Deploy concluído com sucesso: ${distName}`);
      await fetchGlobalStatus(); 

    } catch (error) {
      console.error(`❌ [ERRO] ID ${distId}:`, error);
      toast.error(`Falha no deploy de ${distName}. Verifique os logs.`);
    } finally {
      setDeployingId(null);
    }
  };

  const handleMainClick = () => {
    if (changedDists.length > 0) {
      navigate('/review');
    } else if (validatedDists.length > 0) {
      setIsDeployDialogOpen(true);
    }
  };

  if (location.pathname.includes('/review') || location.pathname.includes('/inicio')) {
    return null;
  }

  // --- RENDERIZAÇÃO ---
  const hasChanges = changedDists.length > 0;
  const hasReadyToDeploy = validatedDists.length > 0;
  const isAllClean = !hasChanges && !hasReadyToDeploy;

  const isDisabled = loading || isAllClean || isViewer;
  if (!dataLoaded) return null;

  return (
    <>
      <div className="z-50 animate-in slide-in-from-bottom-5 mr-2">
        <button 
          onClick={isDisabled ? undefined : handleMainClick}
          title={isViewer && !isAllClean ? "Modo leitura: Você não tem permissão para executar ações" : ""}
          className={`
            group relative flex items-center justify-start p-0 h-8.5 rounded-full shadow-2xl border-2 
            transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap outline-none
            w-8.5 hover:w-[150px]
            ${hasChanges 
              ? `bg-amber-500 border-amber-400 text-white shadow-amber-200 ${isViewer ? 'cursor-not-allowed opacity-80' : 'hover:bg-amber-600 cursor-pointer'} `
              : hasReadyToDeploy 
                ? `bg-blue-600 border-blue-400 text-white shadow-blue-200 ${isViewer ? 'cursor-not-allowed opacity-80' : 'hover:bg-blue-700 cursor-pointer'}`
                : 'bg-emerald-500 hover:bg-emerald-600 border-emerald-400 text-white shadow-emerald-200 cursor-default'
            }
          `}
        >
          <div className="w-7.5 h-7 p-1 flex items-center justify-center shrink-0">
            {loading ? ( <Loader2 className="w-6 h-6 animate-spin" /> ) 
            : hasChanges ? ( <AlertTriangle className="w-6 h-6 animate-pulse" /> ) 
            : hasReadyToDeploy ? ( <Rocket className="w-5 h-5 p-1" /> ) 
            : ( <CheckCircle2 className="w-6 h-6" /> )}
          </div>

          <div className="flex flex-col items-start justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pr-6 shrink-0">
            <span className="font-bold text-[10px] leading-tight tracking-wide">
              {hasChanges ? 'REVISAR PENDÊNCIAS' : hasReadyToDeploy ? 'DEPLOY AGORA' : 'SISTEMA ONLINE'}
            </span>
            <span className="opacity-90 font-mono text-[10px] leading-tight tracking-wider mt-0.5">
              {hasChanges ? `${changedDists.length} alterações` : hasReadyToDeploy ? `${validatedDists.length} aguardando` : 'Ambiente Seguro'}
            </span>
          </div>
        </button>
      </div>

      {/* 👇 MODAL DE DEPLOY INDIVIDUAL 👇 */}
      <Dialog open={isDeployDialogOpen} onOpenChange={setIsDeployDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Deploy para Produção 🚀</DialogTitle>
            <DialogDescription>
              Selecione uma distribuição validada para enviar para o ambiente produtivo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-2 mt-4">
            {validatedDists.map(dist => (
              <div 
                key={dist.id} 
                className="flex items-center justify-between p-3 border rounded-lg bg-card text-card-foreground shadow-sm"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{dist.name}</span>
                  <span className="text-xs text-muted-foreground">ID: {dist.id}</span>
                </div>
                
                <Button 
                  size="sm"
                  onClick={() => handleDeploySingle(dist.id, dist.name)}
                  disabled={deployingId === dist.id}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-[100px]"
                >
                  {deployingId === dist.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Fazer Deploy"
                  )}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}