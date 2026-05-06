import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, GitCommit, User, Clock, Hash, Copy, Code, RotateCcw, AlertTriangle } from 'lucide-react';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const API_URL = '/api'; // Ajuste seu IP

export default function VersionHistoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [distName, setDistName] = useState("");

  // Estados para o Modal de JSON
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedJson, setSelectedJson] = useState(null);

  // Estados para o Modal de Rollback
  const [isRollbackDialogOpen, setIsRollbackDialogOpen] = useState(false);
  const [selectedRollbackVersion, setSelectedRollbackVersion] = useState(null);
  const [isRollingBack, setIsRollingBack] = useState(false);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await fetch(`${API_URL}/distributions/${id}/versions`);
        const metaRes = await fetch(`${API_URL}/distributions/${id}/preview`);
        if (!response.ok || !metaRes.ok) throw new Error("Falha ao buscar versões");
        const data = await response.json();
        const metaData = await metaRes.json();
        setVersions(data);
        setDistName(metaData.metadata?.name || "");
      } catch (error) {
        toast.error("Erro ao carregar o histórico de versões.");
      } finally {
        setLoading(false);
      }
    };
    fetchVersions();
  }, [id]);

  const handleOpenJson = (json) => {
    setSelectedJson(json);
    setIsDialogOpen(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedJson, null, 2));
    toast.success("JSON copiado para a área de transferência!");
  };

  // Funções do Rollback
  const handleOpenRollback = (version) => {
    setSelectedRollbackVersion(version);
    setIsRollbackDialogOpen(true);
  };

  const confirmRollback = async () => {
    if (!selectedRollbackVersion) return;
    setIsRollingBack(true);

    try {
      const response = await fetch(`${API_URL}/distributions/${id}/rollback/${selectedRollbackVersion.id}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erro ao fazer rollback");
      }

      toast.success("Rollback aplicado com sucesso! Validação necessária.");
      
      // Redireciona para a página da distribuição. O status aparecerá como "CHANGED" (Amarelo).
      navigate(`/distributions/${id}`);
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsRollingBack(false);
      setIsRollbackDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50/50 dark:bg-background overflow-hidden">
      
      {/* HEADER ALARGADO PARA 80% */}
      <header className="bg-white dark:bg-card border-b dark:border-border px-8 py-6 shadow-sm">
        <div className=" mx-auto flex items-center gap-5">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Button>
          <div>
            <h1 className="!text-2xl font-bold tracking-wide text-foreground">
              Histórico de Versões {distName && `— ${distName}`}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              Distribuição ID: {id}
            </p>
          </div>
        </div>
      </header>

      {/* CONTEÚDO ALARGADO PARA 80% */}
      <div className="flex-1 overflow-auto p-8">
        <div className="w-[90%] max-w-[1600px] mx-auto relative">
          
          {/* Linha da Timeline */}
          <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-400 dark:bg-slate-800 z-0" />

          <div className="space-y-6 relative z-10">
            {versions.length > 0 ? versions.map((ver, index) => {
              const isActive = index === 0; 
              const versionNumber = versions.length - index;

              return (
                <div key={ver.id} className="flex gap-6">
                  <div className="mt-2 relative shrink-0">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-gray-50 dark:border-background ${isActive ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                      <GitCommit className="w-7 h-6" />
                    </div>
                  </div>

                  {/* Card de Detalhes Horizontalizado */}
                  <Card className={`flex-1 rounded-lg shadow-sm border py-3 ${isActive ? 'border-blue-200 bg-blue-200 dark:bg-slate-950 py-12 dark:border-blue-900 shadow-blue-100/50' : 'border-border dark:border-slate-800'} transition-shadow hover:shadow-md`}>
                    <CardContent className="py-1 px-6">
                      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-semibold">Release v{versionNumber}</h3>
                            {isActive && (
                              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none px-3 py-1 text-xs">
                                Versão Atual (Ativa)
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-foreground/80 font-medium">
                            {ver.description || 'Deploy de rotina sem descrição detalhada.'}
                          </p>
                        </div>
                        
                        <div className="lg:text-right shrink-0 bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded border dark:border-slate-800">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span>{new Date(ver.created_at).toLocaleString('pt-BR')}</span>
                          </div>
                        </div>

                        {/* Botões Agrupados */}
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex gap-2 py-2 text-[10px] font-semibold"
                            onClick={() => handleOpenJson(ver.config_snapshot)}
                          >
                            <Code className="w-3.5 h-3.5" />JSON
                          </Button>
                          
                          {/* Botão de Rollback (só aparece se não for a versão ativa) */}
                          {!isActive && (
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="flex gap-2 py-2 text-[10px] font-semibold bg-red-600 hover:bg-red-700"
                              onClick={() => handleOpenRollback(ver)}
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Rollback
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Grade de Meta-Dados Alargada */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6 pt-6 border-t dark:border-border">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Responsável pelo Deploy</span>
                            <span className="text-sm font-medium text-foreground">{ver.deployed_by_name || ver.deployed_by_email || 'Sistema'} - ({ver.deployed_by_email})</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <Hash className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex flex-col w-full overflow-hidden">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">SHA-256 Hash da Configuração</span>
                            <span className="text-xs font-mono truncate text-slate-500" title={ver.version_hash}>
                              {ver.version_hash}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            }) : (
              <div className="text-center py-20 bg-white dark:bg-card rounded-2xl shadow-sm border dark:border-border w-full">
                  <GitCommit className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">Nenhum deploy realizado para esta distribuição ainda.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DIALOG DO JSON */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 border-b bg-white dark:bg-card shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold">Configuração do Snapshot</DialogTitle>
                <DialogDescription>
                  Representação técnica da v{versions.length - versions.indexOf(versions.find(v => v.config_snapshot === selectedJson))}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 min-h-0 w-full bg-slate-950 relative">
            <ScrollArea className="h-full w-full">
              <div className="p-6">
                 <pre className="text-[11px] text-blue-300 font-mono leading-relaxed whitespace-pre-wrap">
                  {JSON.stringify(selectedJson, null, 2)}
                </pre>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={copyToClipboard} 
                className="absolute top-4 right-5"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG DE CONFIRMAÇÃO DO ROLLBACK */}
      <Dialog open={isRollbackDialogOpen} onOpenChange={setIsRollbackDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 text-red-600 mb-2">
              <AlertTriangle className="w-6 h-6" />
              <DialogTitle>Confirmar Rollback</DialogTitle>
            </div>
            <DialogDescription className="text-base text-foreground/80 mt-4 leading-relaxed">
              Você está prestes a substituir as configurações atuais do banco de dados (Origens e Behaviors) pela versão salva neste histórico.
              <br /><br />
              <strong>Atenção:</strong> Isso <span className="underline">não</span> aplica o deploy automaticamente. O ambiente ficará marcado como <strong>Pendente de Validação (Amarelo)</strong> para que você possa testar antes de subir para produção.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setIsRollbackDialogOpen(false)} disabled={isRollingBack}>
              Cancelar
            </Button>
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700" onClick={confirmRollback} disabled={isRollingBack}>
              {isRollingBack ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Aplicando...</>
              ) : (
                'Sim, Substituir Configurações'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}