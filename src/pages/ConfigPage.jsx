import { useState, useEffect  } from 'react'

import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SelectGroup } from '@radix-ui/react-select'
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import EditOriginDialog from '@/components/shared/EditOriginDialog'
import { Edit, Trash2, Search } from 'lucide-react'

import BehaviorsTab from '../components/shared/BehaviorsTab';
import { useAuth } from '@/context/AuthContext'


function ConfigPage() {

  const ORIGINS_API_URL = '/api/origins'; // Endpoint para buscar/criar origins
  const DISTRIBUTIONS_API_URL = '/api/distributions/all';

  // Estados para dados, carregamento e erro
  const [origins, setOrigins] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formErrors, setFormErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState(null);

  // ... outros states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [originToDelete, setOriginToDelete] = useState(null);

  const { user } = useAuth();
  
    const isAdmin = user.role === 'admin';
    const isViewer = user.role === 'viewer';

  const handleSaveOrigin = async (updatedOrigin) => {
    try {
      const response = await fetch(`${ORIGINS_API_URL}/${updatedOrigin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...updatedOrigin,
            currentUserEmail: user.email, 
            currentUserName: user.name 
        }),
        
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
              await new Promise(resolve => setTimeout(resolve, 500));
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
          currentUserEmail: user.email, 
          currentUserName: user.name   
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

  const filteredOrigins = origins.filter((origin) => {
    const searchLower = searchTerm.toLowerCase();
    
    const distName = distributions.find(d => d.id === origin.distribution_id)?.name || '';

    return (
      origin.origin_id?.toLowerCase().includes(searchLower) ||
      origin.domain_name?.toLowerCase().includes(searchLower) ||
      distName.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton das Abas (Tabs) */}
        <div className="grid w-full grid-cols-2 gap-3 mb-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        <div className="space-y-4">
          {/* Skeleton do Formulário de Adicionar Origin */}
          {!isViewer && (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-[250px] mb-2" />
                <Skeleton className="h-4 w-[400px]" />
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-6">
                  <div className="flex-1 gap-2 flex flex-col">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="flex-1 gap-2 flex flex-col">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="flex-2 gap-2 flex flex-col">
                    <Skeleton className="h-4 w-[140px]" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div>
                    <Skeleton className="h-10 w-[80px]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skeleton da Tabela de Origins */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[200px] mb-2" />
              <Skeleton className="h-4 w-[350px]" />
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
                  {Array.from({ length: 6 }).map((_, index) => (
                    <TableRow key={index} className="h-14">
                      <TableCell className="w-[5%]">
                        <Skeleton className="h-7 w-8 rounded" />
                      </TableCell>
                      <TableCell className="w-[22%]">
                        <Skeleton className="h-7 w-[140px] rounded" />
                      </TableCell>
                      <TableCell className="w-[15%]">
                        <Skeleton className="h-7 w-[120px] rounded" />
                      </TableCell>
                      <TableCell className="w-[30%]">
                        <Skeleton className="h-7 w-[250px] rounded" />
                      </TableCell>
                      <TableCell className="w-[10%]">
                        <Skeleton className="h-7 w-14 rounded" />
                      </TableCell>
                      <TableCell className="w-[8%]">
                        <Skeleton className="h-7 w-10 rounded" />
                      </TableCell>
                      <TableCell className="w-[10%] text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  if (error) return <p className="text-destructive">Erro: {error}</p>;


  const openDeleteDialog = (origin) => {
    setOriginToDelete(origin);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!originToDelete) return;

    try {
      const response = await fetch(`${ORIGINS_API_URL}/${originToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           currentUserEmail: user.email, 
           currentUserName: user.name   
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(errorData.message || 'Falha ao deletar o origin.');
      }

      // Sucesso
      setOrigins(prevOrigins => prevOrigins.filter(o => o.id !== originToDelete.id));
      
      toast.success("Origin deletado com sucesso!");
      setIsDeleteDialogOpen(false);
      setOriginToDelete(null);

    } catch (err) {
      console.error("Erro ao deletar origin:", err);
      
      toast.error("Erro na exclusão", {
        description: err.message, 
        duration: 5000, 
      });
      
    }
  };

 

  return (
    <div className="space-y-6">
      <Tabs defaultValue="origins" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 gap-3 bg-transparent">
          <TabsTrigger value="origins" className='py-2.5 cursor-pointer'>Origins</TabsTrigger>
          <TabsTrigger value="behaviors" className='py-2.5 cursor-pointer' >Behaviors</TabsTrigger>
        </TabsList>

        <TabsContent value="origins" className="space-y-4">
          {!isViewer && (
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
                      <SelectTrigger className="w-full cursor-pointer">
                        <SelectValue placeholder="Selecione uma Distribuição" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Distribuições</SelectLabel>
                          {distributions.map(dist => (
                            <SelectItem className="cursor-pointer" key={dist.id} value={dist.id.toString()}>
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
                    <Button onClick={handleAddOrigin} className="w-full cursor-pointer hover:bg-gray-600 bg-blue-400 dark:bg-blue-600 dark:text-white dark:hover:bg-gray-700 hover:shadow">Enviar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          

          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-800/50 pb-5 mb-4">
              <div>
                <CardTitle>Origins Configurados</CardTitle>
                <CardDescription>Lista de todos os origins gerenciados pela CDN</CardDescription>
              </div>
              
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Filtrar origin, domínio ou distribuição..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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
                  {/* === USANDO filteredOrigins AQUI EM VEZ DE origins === */}
                  {filteredOrigins.length > 0 ? (
                    filteredOrigins.map((origin) => (
                      <TableRow key={origin.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="w-[5%]">
                          <Badge className="px-2 py-1.5 bg-blue-400 dark:bg-blue-500 dark:text-white rounded">
                            {origin.id}
                          </Badge>
                        </TableCell>
                        <TableCell className=" w-[22%]">
                          <Badge variant="secondary" className="px-5 py-1 rounded">
                            {distributions.find(dist => dist.id === origin.distribution_id)?.name || 'Não encontrada'}
                          </Badge>
                        </TableCell>
                        <TableCell className=" w-[15%]">
                          <Badge variant="secondary" className="px-5 py-1 truncate text-blue-800 dark:text-blue-200 rounded">
                            {origin.origin_id}
                          </Badge>
                        </TableCell>
                        <TableCell className=" w-[30%]">
                          <Badge variant="secondary" className="w-full py-1 text-blue-800 dark:text-blue-200 rounded">
                            {origin.domain_name}
                          </Badge>
                        </TableCell>
                        <TableCell className=" w-[10%]">
                          <Badge variant="secondary" className="px-5 py-1 uppercase w-20 rounded">
                            {origin.protocol}
                          </Badge>
                        </TableCell>
                        <TableCell className=" w-[8%]">
                          <Badge  className="px-2 py-1.5 bg-blue-400/70 dark:text-white rounded">
                            {origin.port}
                          </Badge>
                        </TableCell>
                        <TableCell className=" w-[10%]">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedOrigin(origin);
                                setIsDialogOpen(true);     
                              }}
                              className="cursor-pointer hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-all duration-200"
                              disabled={isViewer}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(origin)} className="cursor-pointer hover:bg-red-300 dark:hover:bg-red-500 transition-all duration-200" disabled={isViewer}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        Nenhum origin encontrado na busca.
                      </TableCell>
                    </TableRow>
                  )}
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
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o origin 
              e removerá seus dados dos nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              className="bg-destructive  hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

        <TabsContent value="behaviors" className="space-y-4">
          <BehaviorsTab distributions={distributions} origins={origins} />
        </TabsContent>
      </Tabs>
      
    </div>
  )
}

export default ConfigPage