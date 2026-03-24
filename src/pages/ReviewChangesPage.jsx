import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';

const API_URL = '/api'; // Ajuste conforme env

function ReviewChangesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Estados da Lista
  const [changedDists, setChangedDists] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  
  // Estados do Diff
  const [selectedDistId, setSelectedDistId] = useState(null);
  const [diffData, setDiffData] = useState(null);
  const [loadingDiff, setLoadingDiff] = useState(false);
  
  // Estado da Ação
  const [isValidating, setIsValidating] = useState(false);

  // 1. Ao abrir a página, busca tudo que está pendente (CHANGED)
  useEffect(() => {
    const fetchPendingChanges = async () => {
      try {
        // Busca IDs e Status Basico
        const resList = await fetch(`${API_URL}/distributions?limit=1000`);
        const jsonList = await resList.json();
        const allDists = jsonList.data || [];

        // Verifica status real (Loop do Frontend)
        const statusPromises = allDists.map(async (dist) => {
          try {
            const resStatus = await fetch(`${API_URL}/distributions/${dist.id}/status`);
            const statusData = await resStatus.json();
            return { ...dist, real_status: statusData.status };
          } catch {
            return { ...dist, real_status: 'UNKNOWN' };
          }
        });

        const distsWithStatus = await Promise.all(statusPromises);
        const pending = distsWithStatus.filter(d => d.real_status === 'CHANGED');
        
        setChangedDists(pending);
        
        // Seleciona o primeiro automaticamente
        if (pending.length > 0) {
          setSelectedDistId(pending[0].id);
        }
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar lista de mudanças");
      } finally {
        setLoadingList(false);
      }
    };

    fetchPendingChanges();
  }, []);

  // 2. Busca o Diff quando seleciona uma dist
  useEffect(() => {
    if (!selectedDistId) return;

    const fetchDiff = async () => {
      setLoadingDiff(true);
      try {
        const res = await fetch(`${API_URL}/distributions/${selectedDistId}/compare`);
        const data = await res.json();
        setDiffData(data);
      } catch (error) {
        toast.error("Erro ao carregar o diff");
      } finally {
        setLoadingDiff(false);
      }
    };

    fetchDiff();
  }, [selectedDistId]);

  // 3. Ação: Validar Tudo
  const handleValidateAll = async () => {
    if (!confirm(`Confirma a validação de ${changedDists.length} distribuições em Pré-Produção?`)) return;

    setIsValidating(true);
    toast.info("Iniciando validação no OpenResty...", { 
      description: "Aguardando o retorno do ambiente de Pré-Produção..." 
    });

    try {
      // Pega apenas o Array numérico de IDs (ex: [45, 82])
      const distIds = changedDists.map(dist => dist.id);

      // Dispara para a nova rota orquestradora que criamos no Node.js
      const res = await fetch(`${API_URL}/distributions/validate-pre-prod`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          distributionIds: distIds,
          currentUserEmail: user?.email 
        })
      });

      const data = await res.json();
      console.log(data)

      // Tratamento se o Gatekeeper/Nginx recusar a configuração
      if (!res.ok) {
        console.error("Erro retornado do backend:", data);
        const errorMessage = data.details?.nginx_error || data.error || "Erro de sintaxe no servidor.";
        
        toast.error("Deploy Abortado!", { 
          description: `O OpenResty recusou a configuração: ${errorMessage}`,
          duration: 8000 // Fica mais tempo na tela para o usuário conseguir ler
        });
        return; // Interrompe o fluxo e não redireciona
      }

      // Se deu tudo certo
      toast.success("Sucesso!", {
        description: data.message || "Itens validados e aplicados com sucesso."
      });
      
      navigate('/distributions'); 

    } catch (e) {
      console.error("Erro na comunicação com o backend:", e);
      toast.error("Erro de conexão", {
        description: "Não foi possível se comunicar com o servidor de validação."
      });
    } finally {
      setIsValidating(false);
    }
  };

  if (loadingList) {
    return <div className="flex h-screen items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>;
  }

  if (changedDists.length === 0) {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-4">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
        <h2 className="text-xl font-bold">Tudo limpo!</h2>
        <p className="text-gray-500">Nenhuma mudança pendente de validação.</p>
        <Button onClick={() => navigate('/distributions')}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* HEADER DA PÁGINA */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="text-yellow-500 w-5 h-5" />
              Revisão de Mudanças
            </h1>
            <p className="text-xs text-gray-500">
              {changedDists.length} distribuições aguardando validação
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleValidateAll} 
            disabled={isValidating}
            className="bg-yellow-500 hover:bg-yellow-600 text-white min-w-[200px]"
          >
            {isValidating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            Aprovar e Validar Tudo
          </Button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL (SPLIT VIEW) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR: LISTA DE ALTERADOS */}
        <div className="w-80 bg-white border-r flex flex-col z-0">
          <div className="p-4 bg-gray-50 border-b font-semibold text-xs text-gray-500 uppercase">
            Itens Modificados
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {changedDists.map((dist) => (
                <button
                  key={dist.id}
                  onClick={() => setSelectedDistId(dist.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex justify-between items-center border
                    ${selectedDistId === dist.id 
                      ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium shadow-sm' 
                      : 'bg-white border-transparent hover:bg-gray-100 text-gray-600'
                    }`}
                >
                  <span className="truncate">{dist.name}</span>
                  {selectedDistId === dist.id && <ArrowRight className="w-4 h-4 opacity-50" />}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* AREA PRINCIPAL: DIFF VIEWER */}
        <div className="flex-1 bg-gray-100 overflow-auto relative flex flex-col">
           {/* BARRA DE TÍTULO DO DIFF */}
           <div className="bg-white border-b px-6 py-2 text-sm font-mono text-gray-500 flex justify-between">
              <span>ANTERIOR (Validado)</span>
              <span>ATUAL (Rascunho)</span>
           </div>

           <div className="flex-1 overflow-auto p-4">
              <div className="bg-white shadow rounded-lg overflow-hidden min-h-[500px]">
                {loadingDiff ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    Carregando comparação...
                  </div>
                ) : diffData ? (
                  <ReactDiffViewer 
                    oldValue={JSON.stringify(diffData.previous, null, 2)} 
                    newValue={JSON.stringify(diffData.current, null, 2)} 
                    splitView={true}
                    compareMethod="diffWords"
                    styles={{
                        variables: {
                            light: {
                                diffViewerBackground: '#ffffff',
                                gutterBackground: '#f9fafb',
                            }
                        }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-400">
                    Selecione um item para ver detalhes
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewChangesPage;