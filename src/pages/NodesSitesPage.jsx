import { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Search, 
  MapPin, 
  Server, 
  Network, 
  ExternalLink, 
  Power,
  Loader2,
  Activity,
  HardDrive
} from 'lucide-react';
import { toast } from "sonner";

function NodesSitesPage() {
  // 1. Estados da Página
  const [nodes, setNodes] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);

  // --- BUSCA NA API ---
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await fetch('http://10.127.254.87:3000/edge-servers');
        
        if (!response.ok) throw new Error('Falha ao buscar dados');
        
        const data = await response.json();
        
        const formattedNodes = data.map(server => ({
          id: server.id,
          name: server.server_name,
          status: server.status,
          ip: server.ip_address,
          location: server.location || 'Local não definido',
          capacity: server.capacity_gb ? `${server.capacity_gb} GB` : 'N/A',
          level: server.level,
          lastHeartbeat: server.last_heartbeat,
          distributions: server.distributions || []
        }));

        setNodes(formattedNodes);
      } catch (error) {
        console.error("Erro na API:", error);
        toast.error("Erro ao carregar os servidores de borda.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNodes();
  }, []);

  // 3. Funções Auxiliares
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'default'; 
      case 'maintenance': return 'secondary'; 
      case 'offline': return 'destructive'; 
      default: return 'outline';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'online': return 'Online';
      case 'maintenance': return 'Manutenção';
      case 'offline': return 'Offline';
      default: return status;
    }
  };

  const formatHeartbeat = (dateString) => {
    if (!dateString) return "Sem registro";
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const filteredNodes = nodes.filter(node => 
    node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.ip.includes(searchTerm)
  );

  const handleAccess = (nodeName) => {
    toast.info(`Acessando terminal de ${nodeName}...`);
  };

  const handleAddNode = () => {
    toast.info("Abrindo formulário de criação de Node...");
    // Futuramente, isso pode abrir um Modal de criação ou redirecionar para /nodes/new
  };

  // 4. Renderização
  return (
    <div className="space-y-6">
      {/* <Card className="shadow-sm border-gray-200 dark:border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Consulte todos os nossos Nodes/Edges/Sites</CardTitle>
          <CardDescription>Abaixo todos os nossos Nodes registrados na nossa CDN</CardDescription>
        </CardHeader>
        
      </Card> */}

      <Card className="shadow-sm border-gray-200 dark:border-zinc-800 min-h-[500px]">
        {/* Cabeçalho Interno do Container Branco */}
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 dark:border-zinc-800/50 pb-5 mb-5 gap-4">
          <div>
            <CardTitle className="text-xl">Nodes Cadastrados</CardTitle>
            <CardDescription>Lista de todos os servidores gerenciados pela CDN</CardDescription>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Filtrar por nome, IP..." 
              className="pl-9 bg-gray-50/50 dark:bg-zinc-900/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardHeader>

        {/* Corpo Interno (Onde ficam os dados) */}
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-70">
               <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
               <p className="text-muted-foreground font-medium">Buscando infraestrutura...</p>
            </div>
          ) : (
            <>
              {/* GRID DOS CARDS INTERNOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredNodes.map((node) => (
                  <Card 
                    key={node.id} 
                    className="shadow-none border border-blue-100 bg-gradient-to-br from-white rounded-md to-neutral-100 dark:border-zinc-800 hover:shadow-md transition-all cursor-pointer border-l-4 border-l-blue-300 dark:border-l-gray-700 hover:border-gray-500 group  dark:bg-zinc-900/20 duration-300"
                    onClick={() => setSelectedNode(node)} 
                  >
                    <CardHeader className="p-4 flex flex-row items-start justify-between space-y-0">
                      <div className="space-y-1.5 overflow-hidden pr-2">
                        <CardTitle className="text-[15px] font-bold leading-tight group-hover:text-primary transition-colors truncate">
                          {node.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1.5 text-xs truncate">
                          <Power className="h-3 w-3 shrink-0" /> Ping: {formatHeartbeat(node.lastHeartbeat)}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusColor(node.status)} className="uppercase text-[10px] tracking-wider shrink-0 mt-0.5">
                        {getStatusLabel(node.status)}
                      </Badge>
                    </CardHeader>
                  </Card>
                ))}
              </div>
              
              {/* Empty State */}
              {filteredNodes.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-lg mt-4">
                    <p className="text-muted-foreground">Nenhum node encontrado com o termo "{searchTerm}".</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedNode} onOpenChange={(open) => !open && setSelectedNode(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedNode && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between mb-2 mt-5">
                  <Badge variant={getStatusColor(selectedNode.status)} className="uppercase tracking-wider">
                    {getStatusLabel(selectedNode.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                    <Activity className="h-3 w-3" /> ID: {selectedNode.id}
                  </span>
                </div>
                <DialogTitle className="text-2xl font-bold">{selectedNode.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-1.5 pt-1">
                  <Power className="h-3.5 w-3.5 text-green-500" />
                  Último sinal recebido em: <strong className="text-foreground">{formatHeartbeat(selectedNode.lastHeartbeat)}</strong>
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 p-3 rounded bg-gradient-to-br from-neutral-200/50 to-blue-100/60  border border-border/50 ">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                      <Network className="h-3.5 w-3.5" /> Endereço IP
                    </p>
                    <p className="font-mono font-medium text-sm">{selectedNode.ip}</p>
                  </div>
                  
                  <div className="space-y-1 p-3 rounded bg-gradient-to-br from-neutral-200/50 to-blue-100/60 border border-border/50">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                      <Server className="h-3.5 w-3.5" /> Camada (Level)
                    </p>
                    <p className="font-medium text-sm uppercase">{selectedNode.level}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 p-3 rounded bg-gradient-to-br from-neutral-200/50 to-blue-100/60 border border-border/50">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> Localização
                    </p>
                    <p className="font-medium text-sm">{selectedNode.location}</p>
                  </div>
                  
                  <div className="space-y-1 p-3 rounded bg-gradient-to-br from-neutral-200/50 to-blue-100/60 border border-border/50">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                      <HardDrive className="h-3.5 w-3.5" /> Capacidade
                    </p>
                    <p className="font-medium text-sm">{selectedNode.capacity}</p>
                  </div>
                </div>
              </div>

              <DialogFooter className="sm:justify-start flex-col sm:flex-col border-t pt-5 mt-2 gap-3 w-full">
                <div className="w-full">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Network className="h-4 w-4 text-muted-foreground" />
                    Distribuições atribuídas a este servidor:
                    <Badge variant="secondary" className="ml-auto font-mono text-xs">
                      {selectedNode.distributions?.length || 0}
                    </Badge>
                  </h4>
                  
                  {selectedNode.distributions && selectedNode.distributions.length > 0 ? (
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                      {selectedNode.distributions.map((dist, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-gradient-to-br from-neutral-100/90 to-blue-100/80 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-md shrink-0">
                              <Server className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-medium text-[13px] text-gray-800/80 dark:text-blue-200 truncate">
                              {dist.name}
                            </span>
                          </div>
                          
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-100/50 dark:hover:bg-blue-900/50 shrink-0">
                            Detalhes
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-4 rounded-md bg-muted/40 border border-dashed border-border/60 text-sm text-muted-foreground">
                      Nenhuma distribuição atribuída no momento.
                    </div>
                  )}
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default NodesSitesPage;