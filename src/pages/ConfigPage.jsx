import { useState, useEffect  } from 'react'

import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SelectGroup } from '@radix-ui/react-select'
import { toast } from "sonner"

import EditOriginDialog from '@/components/shared/EditOriginDialog'
import { Edit, Trash2 } from 'lucide-react'

import BehaviorsTab from '../components/shared/BehaviorsTab';


function ConfigPage() {

  const ORIGINS_API_URL = '/api/origins'; // Endpoint para buscar/criar origins
  const DISTRIBUTIONS_API_URL = '/api/distributions'; // Endpoint para buscar as distributions

  // Estados para dados, carregamento e erro
  const [origins, setOrigins] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formErrors, setFormErrors] = useState({});

    // ESTADOS PARA O DIALOG
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState(null);


   const [behaviors, setBehaviors] = useState([
    { id: 1, distribution_id: 1, path_pattern: '/videos/*', origin_id: 'stb-origin-1', cache_ttl: 86400, cache_policy: 'public', forward_query_strings: false, forward_cookies: false, priority: 0 },
    { id: 2, distribution_id: 2, path_pattern: '/assets/images/*', origin_id: 'app-origin-1', cache_ttl: 3600, cache_policy: 'public', forward_query_strings: false, forward_cookies: false, priority: 0 },
    { id: 3, distribution_id: 3, path_pattern: '/audio/*', origin_id: 'radio-origin-1', cache_ttl: 259200, cache_policy: 'public', forward_query_strings: false, forward_cookies: false, priority: 0 }
  ])

  const handleSaveOrigin = async (updatedOrigin) => {
    try {
      const response = await fetch(`${ORIGINS_API_URL}/${updatedOrigin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrigin),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar o origin');
      }

      const data = await response.json();
      
      // Atualiza a lista de origins no estado com os novos dados
      setOrigins(origins.map(o => o.id === data.id ? data : o));
      setIsDialogOpen(false); // Fecha o dialog
      toast.success("Origin atualizado com sucesso!");

    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar o origin", { description: err.message });
    }
  };


  // Estado para o formulário de novo origin
  const [newOrigin, setNewOrigin] = useState({
    distribution_id: '',
    origin_id: '',
    domain_name: '',
  });

  // useEffect para buscar todos os dados necessários da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Busca os origins e distributions em paralelo
        const [originsRes, distributionsRes] = await Promise.all([
          fetch(ORIGINS_API_URL),
          fetch(DISTRIBUTIONS_API_URL)
        ]);

        if (!originsRes.ok || !distributionsRes.ok) {
          throw new Error('Falha ao buscar dados da API');
        }

        const originsData = await originsRes.json();
        const distributionsData = await distributionsRes.json();

        setOrigins(originsData);
        setDistributions(distributionsData);

        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handler para atualizar o estado do formulário
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewOrigin(prev => ({ ...prev, [name]: value }));
  };

  // Função para adicionar um novo origin
  const handleAddOrigin = async () => {
    if (!newOrigin.distribution_id || !newOrigin.origin_id || !newOrigin.domain_name) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const response = await fetch(ORIGINS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distribution_id: parseInt(newOrigin.distribution_id), // Garante que o ID seja um número
          distribution_name: newOrigin.distribution_name,
          origin_id: newOrigin.origin_id,
          domain_name: newOrigin.domain_name,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar o origin');
      }

      const createdOrigin = await response.json();
      setOrigins(prev => [...prev, createdOrigin]); // Adiciona o novo origin à lista
      
      // Limpa os campos do formulário, mantendo o distribution_id selecionado
      setNewOrigin(prev => ({
        ...prev,
        origin_id: '',
        domain_name: '',
      }));

    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (isLoading) return <p>Carregando configurações...</p>;
  if (error) return <p className="text-destructive">Erro: {error}</p>;

  // Dentro do componente ConfigPage

const handleDeleteOrigin = (originId, originName) => { // Passamos o nome para a mensagem
  toast("Confirmar Exclusão", {
    // Mensagem principal e descrição para o usuário
    title: `Tem certeza que deseja deletar o origin "${originName}"`,
    
    // Faz o toast ficar visível até o usuário interagir
    duration: Infinity, 
    
    
    // Estilo visual que destaca o toast
    important: true, 

    // Botão de confirmação (ação principal)
    action: {
      label: "Confirmar",
      onClick: async () => {
        try {
          const response = await fetch(`${ORIGINS_API_URL}/${originId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Falha ao deletar o origin.');
          }

          setOrigins(prevOrigins => prevOrigins.filter(o => o.id !== originId));
          toast.success("Origin deletado com sucesso!");

        } catch (err) {
          console.error("Erro ao deletar origin:", err);
          toast.error("Erro ao deletar origin", {
            description: err.message,
          });
        }
      },
    },
    
    cancel: {
      label: "Cancelar",
      onClick: () => {}, // Apenas fecha o toast, não faz mais nada
    },
  });
};

 

  return (
    <div className="space-y-6">
      <Tabs defaultValue="origins" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 gap-3">
          <TabsTrigger value="origins" className='py-2.5 cursor-pointer'>Origins</TabsTrigger>
          <TabsTrigger value="behaviors" className='py-2.5 cursor-pointer' >Behaviors</TabsTrigger>
        </TabsList>

        <TabsContent value="origins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Novo Origin</CardTitle>
              <CardDescription>Configure um novo servidor de origem para uma distribuição</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-6">
                <div className="flex-1 gap-2 flex flex-col">
                  <Label htmlFor="distribution_id">Distribuição</Label>
                  <Select
                    value={newOrigin.distribution_id ? newOrigin.distribution_id.toString() : ''}
                    onValueChange={(value) => handleFormChange({ target: { name: 'distribution_id', value: value } })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma Distribuição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Distribuições</SelectLabel>
                        {distributions.map(dist => (
                          <SelectItem key={dist.id} value={dist.id.toString()}>
                            {dist.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 gap-2 flex flex-col">
                  <Label htmlFor="origin_id">Nome do Origin</Label>
                  <Input
                    id="origin_id"
                    name="origin_id"
                    placeholder="ex: vos-cluster-lab"
                    value={newOrigin.origin_id}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="flex-2 gap-2 flex flex-col">
                  <Label htmlFor="domain_name">Domínio do Origin</Label>
                  <Input
                    id="domain_name"
                    name="domain_name"
                    placeholder="cdn.stb.example.com"
                    value={newOrigin.domain_name}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <Button onClick={handleAddOrigin} variant="secondary" className="w-full">Enviar</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Origins Configurados</CardTitle>
              <CardDescription>Lista de todos os origins gerenciados pela CDN</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Distribution</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Domínio</TableHead>
                    <TableHead>Protocolo</TableHead>
                    <TableHead>Porta</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {origins.map((origin) => (
                    <TableRow key={origin.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <Badge className="px-2 py-1">
                          {origin.id}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="px-4 py-1">
                          {distributions.find(dist => dist.id === origin.distribution_id)?.name || 'Não encontrada'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="px-4 py-1 truncate">
                          {origin.origin_id}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="w-full py-1">
                          {origin.domain_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="px-4 py-1">
                          {origin.protocol}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="px-2 py-1">
                          {origin.port}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setSelectedOrigin(origin); // Guarda o origin clicado no estado
                              setIsDialogOpen(true);     // Abre o dialog
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteOrigin(origin.id, origin.origin_id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        {formErrors.domain_name && (
          <Alert variant="destructive" className="mt-2 flex items-center">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              {formErrors.domain_name}
            </AlertDescription>
          </Alert>
        )
        }
        {selectedOrigin && (
        <EditOriginDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          origin={selectedOrigin}
          onSave={handleSaveOrigin}
        />
      )}

        

        {/* Behaviors Tab */}
        <TabsContent value="behaviors" className="space-y-4">
          <BehaviorsTab distributions={distributions} origins={origins} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ConfigPage