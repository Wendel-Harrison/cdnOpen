import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const API_URL = '/api'; // Ajuste conforme env

function ReviewChangesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === 'system' && window.matchMedia("(prefers-colors-scheme:dark)").matches);
  
  // Estados da Lista
  const [changedDists, setChangedDists] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  
  // Estados do Diff
  const [selectedDistId, setSelectedDistId] = useState(null);
  const [diffData, setDiffData] = useState(null);
  const [loadingDiff, setLoadingDiff] = useState(false);
  
  // Estados de Ação
  const [isValidating, setIsValidating] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false); // Novo estado para o Desfazer

  // 1. Ao abrir a página, busca tudo que está pendente (CHANGED)
  useEffect(() => {
    const fetchPendingChanges = async () => {
      try {
        const resList = await fetch(`${API_URL}/distributions?limit=1000`);
        const jsonList = await resList.json();
        const allDists = jsonList.data || [];

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
    if (!selectedDistId) {
      setDiffData(null);
      return;
    }

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

  // Função para Aprovar/Validar
  const executeValidation = async () => {
    const selectedDist = changedDists.find(d => d.id === selectedDistId);
    if (!selectedDist) return;

    setIsValidating(true);
    toast.info(`Validando ${selectedDist.name}...`, { 
      description: "Testando configuração no OpenResty..." 
    });

    try {
      const res = await fetch(`${API_URL}/distributions/${selectedDistId}/validate-pre-prod`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUserEmail: user?.email })
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.details?.nginx_error || data.error || "Erro de sintaxe no servidor.";
        toast.error("Validação Abortada!", { description: errorMessage, duration: 8000 });
        return; 
      }

      toast.success("Sucesso!", { description: `Distribuição ${selectedDist.name} validada com sucesso.` });
      removeDistFromList(selectedDistId);

    } catch (e) {
      toast.error("Erro de conexão", { description: "Não foi possível se comunicar com o servidor." });
    } finally {
      setIsValidating(false);
    }
  };

  // NOVA FUNÇÃO: Desfazer as alterações usando a rota de Rollback
  const executeUndo = async () => {
    const selectedDist = changedDists.find(d => d.id === selectedDistId);
    if (!selectedDist) return;

    setIsUndoing(true);
    toast.info("Descartando alterações...");

    try {
      // 1. Busca qual é o último deploy feito para essa dist
      const verRes = await fetch(`${API_URL}/distributions/${selectedDistId}/versions`);
      const versions = await verRes.json();

      if (!versions || versions.length === 0) {
        toast.error("Impossível desfazer: não há versão anterior.", {
          description: "Se esta for uma distribuição nova, você precisará excluí-la manualmente na aba de configurações."
        });
        setIsUndoing(false);
        return;
      }

      // O índice 0 é a versão atualmente ativa em produção
      const lastActiveVersionId = versions[0].id;

      // 2. Executa o rollback no backend para sobrescrever o rascunho com a versão de produção
      const rollbackRes = await fetch(`${API_URL}/distributions/${selectedDistId}/rollback/${lastActiveVersionId}`, {
        method: 'POST'
      });

      if (!rollbackRes.ok) throw new Error("Falha ao desfazer alterações.");

      toast.success("Mudanças descartadas!", { 
        description: `O rascunho de ${selectedDist.name} foi revertido para a versão original.` 
      });
      removeDistFromList(selectedDistId);

    } catch (e) {
      toast.error("Erro ao desfazer", { description: "Houve um problema ao restaurar a configuração anterior." });
    } finally {
      setIsUndoing(false);
    }
  };

  // Helper para atualizar a UI após Aprovar ou Desfazer
  const removeDistFromList = (idToRemove) => {
    const remainingDists = changedDists.filter(d => d.id !== idToRemove);
    setChangedDists(remainingDists);
    if (remainingDists.length > 0) {
      setSelectedDistId(remainingDists[0].id);
    } else {
      setSelectedDistId(null);
    }
  };

  const activeDist = changedDists.find(d => d.id === selectedDistId);

  const diffStyles = {
    variables: isDark ? {
      dark: {
        diffViewerBackground: '#09090b', 
        gutterBackground: '#18181b',    
        diffViewerTitleColor: '#fafafa', 
        diffViewerColor: '#a1a1aa',       
        gutterColor: '#71717a',          
        addedBackground: '#052e16',       
        addedColor: '#4ade80',
        removedBackground: '#450a0a',
        removedColor: '#f87171',
        codeFoldBackground: '#27272a',
        codeFoldGutterBackground: '#27272a',
        codeFoldContentColor: '#fafafa',
      }
    } : {
      light: {
        diffViewerBackground: '#ffffff',
        gutterBackground: '#f9fafb',
      }
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
        <Button onClick={() => navigate('/distributions')}>Voltar ao Painel</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-background">
      <header className="bg-white dark:bg-card border-b dark:border-border px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 dark:text-foreground" />
          </Button>
          <div>
            <h1 className="!text-3xl font-bold flex items-center gap-2 dark:text-foreground">
              <AlertTriangle className="text-amber-500 w-5 h-5 " />
              Revisão de Mudanças
            </h1>
            <p className="text-xs text-gray-500 dark:text-foreground">
              {changedDists.length} distribuições aguardando validação
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Cancelar
          </Button>

          {/* BOTÃO DESFAZER (Com Alert Dialog para segurança) */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline"
                disabled={isUndoing || isValidating || !selectedDistId}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-900 duration-300"
              >
                {isUndoing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                Desfazer Mudanças
              </Button>
            </AlertDialogTrigger>
            
            <AlertDialogContent className="sm:max-w-[425px]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Confirmar Descarte
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Você tem certeza que deseja descartar todas as alterações não validadas da distribuição <span className="font-bold text-foreground">{activeDist?.name}</span>?
                  <br /><br />
                  Isso apagará o rascunho atual e restaurará a última configuração válida em produção. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={executeUndo} 
                  className="bg-red-600 hover:bg-red-700 text-white duration-300"
                >
                  Sim, Descartar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* BOTÃO APROVAR (Já existente) */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                disabled={isValidating || isUndoing || !selectedDistId}
                className="bg-blue-800 hover:bg-blue-900 dark:hover:bg-gray-800 text-white min-w-[200px] duration-300"
              >
                {isValidating ? ( <Loader2 className="w-4 h-4 animate-spin mr-2" /> ) : ( <Check className="w-4 h-4 mr-2" /> )}
                Aprovar: <span className="font-mono ml-1 text-xs opacity-90">{activeDist?.name || '...'}</span>
              </Button>
            </AlertDialogTrigger>
            
            <AlertDialogContent className="sm:max-w-[425px]">
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Validação</AlertDialogTitle>
                <AlertDialogDescription>
                  Você tem certeza que deseja aprovar e validar a distribuição <span className="font-bold text-foreground">{activeDist?.name}</span>?
                  <br /><br />
                  Esta ação fará um teste real da configuração no ambiente de Pré-Produção.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={executeValidation} 
                  className="bg-blue-800 hover:bg-blue-900 dark:hover:bg-gray-800 text-white duration-300"
                >
                  Sim, Validar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL (SPLIT VIEW) */}
      <div className="flex flex-1 overflow-hidden">
        
        <div className="w-80 bg-white dark:bg-card dark:border-border dark:text-muted-foreground border-r flex flex-col z-0">
          <div className="p-4 bg-gray-50 border-b font-semibold text-xs text-gray-500 uppercase dark:bg-muted/80 dark:border-border dark:text-muted-foreground">
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
                      ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium shadow-sm dark:bg-gray-950 dark:border-gray-900 dark:text-blue-200' 
                      : 'bg-white border-transparent hover:bg-gray-100 text-gray-600 dark:bg-card dark:text-muted-foreground dark:hover:bg-accent'
                    }`}
                >
                  <span className="truncate">{dist.name}</span>
                  {selectedDistId === dist.id && <ArrowRight className="w-4 h-4 opacity-50" />}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 bg-gray-100 overflow-auto relative flex flex-col dark:bg-background">
           <div className="bg-white dark:bg-card dark:border-border border-b px-6 py-2 text-sm font-mono text-gray-500 dark:text-muted-foreground flex justify-between">
              <span>ANTERIOR (Validado)</span>
              <span>ATUAL (Rascunho)</span>
           </div>

           <div className="flex-1 overflow-auto p-4">
              <div className="bg-white dark:bg-card shadow dark:shadow-none border dark:border-border rounded-lg overflow-hidden min-h-[65vh]">
                {loadingDiff ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    Carregando comparação...
                  </div>
                ) : diffData ? (
                  <ReactDiffViewer 
                    oldValue={JSON.stringify(diffData.previous, null, 2)} 
                    newValue={JSON.stringify(diffData.current, null, 2)} 
                    splitView={true}
                    compareMethod="diffWords"
                    hideLineNumbers={false}
                    useDarkTheme={isDark}
                    styles={diffStyles}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-400 dark:text-muted-foreground">
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