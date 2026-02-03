import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
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

  const chunkArray = (array, size) => {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
        chunked.push(array.slice(i, i + size));
    }
    return chunked;
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleDeployAll = async () => {
    if (!confirm(`🚀 CONFIRMAÇÃO: Enviar ${validatedDists.length} distribuições para PRODUÇÃO?`)) return;

    setLoading(true);
    
    // 1. Cria os lotes (Batches) de 3 em 3
    const BATCH_SIZE = 3;
    const batches = [];
    for (let i = 0; i < validatedDists.length; i += BATCH_SIZE) {
        batches.push(validatedDists.slice(i, i + BATCH_SIZE));
    }

    console.log(`📋 Total de itens: ${validatedDists.length} | Total de Lotes: ${batches.length}`);

    let successCount = 0;
    let failCount = 0;

    // 2. Processa Lote a Lote
    for (const [index, batch] of batches.entries()) {
        console.log(`🔄 Iniciando Lote ${index + 1}/${batches.length}...`);

        const batchPromises = batch.map(async (dist) => {
            // Controller para cancelar requisição se travar
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos Timeout

            try {
                const response = await fetch(`${API_URL}/distributions/${dist.id}/deploy`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        user_email: user?.email,
                        user_name: user?.name,
                        description: "Batch Deploy Auto"
                    }),
                    signal: controller.signal // Liga o timeout
                });

                clearTimeout(timeoutId); // Limpa o timer se deu certo

                if (!response.ok) throw new Error(await response.text());
                
                console.log(`✅ [OK] ID ${dist.id}`);
                return true;
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.error(`⚠️ [TIMEOUT] O Backend demorou demais no ID ${dist.id}, mas vamos seguir.`);
                    // Opcional: Considerar sucesso se o backend logou sucesso, 
                    // ou falha se quiser ser rígido. Aqui assumimos falha segura.
                    return false; 
                }
                console.error(`❌ [ERRO] ID ${dist.id}:`, error);
                return false;
            }
        });

        // Espera o lote terminar
        const results = await Promise.all(batchPromises);
        
        successCount += results.filter(r => r === true).length;
        failCount += results.filter(r => r === false).length;

        // --- O SEGREDO ANTI-TRAVAMENTO ---
        // Espera 1 segundo entre lotes para o navegador fechar conexões TCP
        if (index < batches.length - 1) {
            console.log("⏳ Respirando 1s antes do próximo lote...");
            await wait(1000);
        }
    }

    setLoading(false);
    
    if (failCount > 0) {
        toast.warning(`Concluído com alertas: ${successCount} sucessos, ${failCount} falhas/timeouts.`);
    } else {
        toast.success(`Sucesso Total! ${successCount} distribuições processadas.`);
    }

    // Atualiza a lista geral
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

  if (location.pathname.includes('/review')) {
    return null;
  }

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