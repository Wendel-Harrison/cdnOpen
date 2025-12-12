import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Server, 
  Network, 
  ExternalLink, 
  Power,
  Cpu,
  Plus
} from 'lucide-react';
import { toast } from "sonner";

function NodesSitesPage() {
  // Dados fictícios (Mock) para visualizar o layout
  // Futuramente virão da sua API (/api/nodes)
  const [nodes, setNodes] = useState([
    { 
      id: 1, 
      name: 'Cache - Rio de Janeiro (GIG)', 
      status: 'online', 
      ip: '192.168.100.55', 
      model: 'Dell PowerEdge R740', 
      location: 'Rio de Janeiro, Freguesia',
      uptime: '45 dias'
    },
    { 
      id: 2, 
      name: 'Edge - São Paulo (GRU)', 
      status: 'maintenance', 
      ip: '10.55.20.12', 
      model: 'Cisco UCS C240', 
      location: 'São Paulo, Tatuapé',
      uptime: '12 dias'
    },
    { 
      id: 3, 
      name: 'Edge - Brasília (BSB)', 
      status: 'offline', 
      ip: '172.16.5.99', 
      model: 'HP ProLiant DL380', 
      location: 'Brasília, Asa Norte',
      uptime: '0 dias'
    },
    { 
      id: 4, 
      name: 'Cache - Recife (REC)', 
      status: 'online', 
      ip: '192.168.200.10', 
      model: 'Dell PowerEdge R640', 
      location: 'Recife, Boa Viagem',
      uptime: '120 dias'
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  // Função auxiliar para definir a cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'default'; // Preto/Padrão (ou verde se customizado)
      case 'maintenance': return 'secondary'; // Cinza/Amarelo
      case 'offline': return 'destructive'; // Vermelho
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

  // Filtro
  const filteredNodes = nodes.filter(node => 
    node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.ip.includes(searchTerm)
  );

  const handleAccess = (nodeName) => {
    toast.info(`Acessando terminal de ${nodeName}...`);
    // Lógica futura: window.open(`ssh://${node.ip}`) ou abrir modal de terminal
  };

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho da Página */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Nodes / Sites</h2>
          <p className="text-sm text-muted-foreground">Gerenciamento físico dos servidores de borda</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome, IP ou local..." 
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="">
            <Plus className="mr-2 h-4 w-4" /> Novo Node
          </Button>
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredNodes.map((node) => (
          <Card key={node.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-gray-300 dark:border-l-gray-700">
            
            {/* Primeira Linha: Nome e Status */}
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold">{node.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <Power className="h-3 w-3" /> Uptime: {node.uptime}
                  </CardDescription>
                </div>
                <Badge variant={getStatusColor(node.status)} className="uppercase text-[10px] tracking-wider">
                  {getStatusLabel(node.status)}
                </Badge>
              </div>
            </CardHeader>

            {/* Conteúdo: Informações Técnicas */}
            <CardContent className="flex-1 text-sm space-y-4 py-4">
              
              {/* IP */}
              <div className="flex items-center gap-3 p-2 rounded-md bg-muted/40">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                    <Network className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground font-medium">Endereço IP</p>
                    <p className="font-mono font-bold">{node.ip}</p>
                </div>
              </div>

              {/* Modelo */}
              <div className="flex items-center gap-3 p-2 rounded-md bg-muted/40">
                <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                    <Server className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground font-medium">Modelo / Hardware</p>
                    <p className="font-medium">{node.model}</p>
                </div>
              </div>

              {/* Localização */}
              <div className="flex items-center gap-3 p-2 rounded-md bg-muted/40">
                <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
                    <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground font-medium">Localização Física</p>
                    <p className="font-medium">{node.location}</p>
                </div>
              </div>

            </CardContent>

            {/* Rodapé: Botão de Ação */}
            <CardFooter className="pt-2">
              {/* O botão "Quadrado Vermelho" solicitado */}
              <Button 
                className="w-full bg-destructive hover:bg-destructive/90 text-white font-bold shadow-sm group"
                onClick={() => handleAccess(node.name)}
              >
                <span>Acessar Node</span>
                <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>

          </Card>
        ))}
      </div>
      
      {/* Estado vazio */}
      {filteredNodes.length === 0 && (
        <div className="text-center py-10">
            <p className="text-muted-foreground">Nenhum node encontrado com o termo "{searchTerm}".</p>
        </div>
      )}

    </div>
  );
}

export default NodesSitesPage;