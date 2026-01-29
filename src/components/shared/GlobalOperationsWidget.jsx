import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Rocket, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  RefreshCw 
} from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';

export function GlobalOperationsWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Listas de estado
  const [changedDists, setChangedDists] = useState([]);
  const [validatedDists, setValidatedDists] = useState([]);

  const API_URL = 'http://10.127.254.87:3000'; 

  // --- BUSCA DE STATUS (Mantida igual para garantir precisão) ---
  const fetchGlobalStatus = async () => {
    // Evita loading visual se já tiver dados carregados (para não piscar o botão)
    if (!dataLoaded) setLoading(true); 
    
    try {
      const resList = await fetch(`${API_URL}/distributions?limit=1000`);
      const jsonList = await resList.json();
      const allDists = jsonList.data || [];

      // Consulta o status REAL de cada um individualmente
      const statusPromises = allDists.map(async (dist) => {
        try {
          const resStatus = await fetch(`${API_URL}/distributions/${dist.id}/status`);
          const statusData = await resStatus.json();
          return { 
            ...dist, 
            real_status: statusData.status 
          };
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


  // --- LÓGICA DE AÇÃO PRINCIPAL ---

  const handleDeployAll = async () => {
    if (!confirm(` CONFIRMAÇÃO FINAL: \n\nVocê vai enviar ${validatedDists.length} distribuições para PRODUÇÃO agora.\n\nDeseja continuar?`)) return;

    setLoading(true);
    console.log("ITENS NA FILA DE DEPLOY:", validatedDists);
    const deployPromises = validatedDists.map(async (dist) => {
        try {
            console.log(`Disparando deploy para ID: ${dist.id}`);
            
            const response = await fetch(`${API_URL}/distributions/${dist.id}/deploy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    user_email: user?.email,
                    user_name: user?.name,
                    description: "Batch Deploy One-Click"
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Erro HTTP: ${errText}`);
            }

            return { id: dist.id, success: true };

        } catch (error) {
            console.error(`❌ Falha no ID ${dist.id}:`, error);
            return { id: dist.id, success: false, error };
        }
    });

    // 2. Espera todas terminarem (seja com sucesso ou erro)
    const results = await Promise.all(deployPromises);

    // 3. Contabiliza resultados
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    if (failCount > 0) {
        toast.warning(`Deploy finalizado com alertas: ${successCount} sucessos, ${failCount} falhas.`);
    } else {
        toast.success(`Sucesso Total! ${successCount} distribuições deployadas.`);
    }

    await fetchGlobalStatus();
  };

  const handleMainClick = () => {
    if (changedDists.length > 0) {
      // CENÁRIO 1: Amarelo -> Vai para Review
      navigate('/review');
    } else if (validatedDists.length > 0) {
      // CENÁRIO 2: Azul -> Faz Deploy Direto
      handleDeployAll();
    }
  };

  // --- RENDERIZAÇÃO ---

  const hasChanges = changedDists.length > 0;
  const hasReadyToDeploy = validatedDists.length > 0;
  const isAllClean = !hasChanges && !hasReadyToDeploy;

  if (!dataLoaded) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 animate-in slide-in-from-bottom-5">
      <Button 
        size="lg"
        onClick={handleMainClick}
        disabled={loading || isAllClean} // Desabilitado se estiver verde ou carregando
        className={`
          h-14 rounded-full shadow-2xl transition-all duration-300 border-2 px-6
          ${hasChanges 
            ? 'bg-yellow-500 hover:bg-yellow-600 border-yellow-300 text-white shadow-yellow-200' // AMARELO
            : hasReadyToDeploy 
              ? 'bg-blue-600 hover:bg-blue-700 border-blue-400 text-white shadow-blue-200' // AZUL
              : 'bg-green-600 border-green-400 text-white opacity-90 cursor-default' // VERDE (Disabled visualmente bonito)
          }
        `}
      >
        {/* ÍCONE */}
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin mr-3" />
        ) : hasChanges ? (
          <AlertTriangle className="w-6 h-6 mr-3 animate-pulse" />
        ) : hasReadyToDeploy ? (
          <Rocket className="w-6 h-6 mr-3" />
        ) : (
          <CheckCircle2 className="w-6 h-6 mr-3" />
        )}

        {/* TEXTO */}
        <div className="flex flex-col items-start text-xs">
          <span className="font-bold text-sm">
            {hasChanges 
                ? 'REVISAR PENDÊNCIAS' 
                : hasReadyToDeploy 
                    ? 'DEPLOY AGORA' 
                    : 'SISTEMA ONLINE'
            }
          </span>
          <span className="opacity-90 font-mono">
            {hasChanges 
              ? `${changedDists.length} alterações` 
              : hasReadyToDeploy 
                ? `${validatedDists.length} aguardando` 
                : 'Ambiente Seguro'}
          </span>
        </div>
      </Button>
    </div>
  );
}