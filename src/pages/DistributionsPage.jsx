import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Trash2, Edit, ChevronRight, ChevronLeft } from 'lucide-react'
import { toast } from "sonner"
import { useAuth } from '@/context/AuthContext'
import EditDistributionDialog from '@/components/shared/EditDistributionDialog';

// 1. IMPORTAR OS COMPONENTES DE ALERT DIALOG
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

function DistributionsPage() {

  const API_URL = '/api/distributions'
  const [distributions, setDistributions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [newDistributionName, setNewDistributionName] = useState('')
  const [searchTerm, setSearchTerm] = useState('');

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState(null);

  // 2. NOVOS ESTADOS PARA O DELETE
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 15; 

  const { user } = useAuth();

  const isAdmin = user.role === 'admin';
  const isViewer = user.role === 'viewer';

  const fetchDistributions = useCallback(async (page, search = '') => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = await fetch(`${API_URL}?page=${page}&limit=${LIMIT}&search=${encodeURIComponent(search)}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar os dados da API');
      }
      const data = await response.json();
      
      setDistributions(data.data);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
      
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDistributions(currentPage, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentPage, fetchDistributions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const addDistribution = async () => {
    if (!newDistributionName) {
      toast.warning("O nome da distribuição não pode ser vazio.");
      return;
    }

    try {
      const newDist = { name: newDistributionName, status: 'deployed', currentUserEmail: user.email, currentUserName: user.name };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDist),
      });

      if (!response.ok) {
        toast.warning("Falha ao criar a distribuição")
      }

      const addedDistribution = await response.json();
      setDistributions([...distributions, addedDistribution]); 
      setNewDistributionName('');
      toast.success("Criado com sucesso.");
    } catch (err) {      
      console.error(err);
    }
    await fetchDistributions(currentPage);
  };

  // 3. FUNÇÃO PARA INICIAR O PROCESSO DE DELETE (ABRE O MODAL)
  const confirmDelete = (id) => {
    setIdToDelete(id);
    setIsDeleteAlertOpen(true);
  };

  // 4. FUNÇÃO QUE EFETIVAMENTE DELETA (CHAMADA PELO MODAL)
  const executeDelete = async () => {
    if (!idToDelete) return;

    try {
      const response = await fetch(`${API_URL}/${idToDelete}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
            currentUserEmail: user.email,
            currentUserName: user.name
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao deletar');
      }
      
      await fetchDistributions(currentPage);
      setDistributions(prev => prev.filter(d => d.id !== idToDelete));
      toast.success("Distribuição deletada com sucesso");
      
    } catch (err) {
       toast.error('Falha ao deletar distribuição');
    } finally {
      // Limpa o estado e fecha o modal
      setIsDeleteAlertOpen(false);
      setIdToDelete(null);
    }
  };

  const handleUpdateDistribution = async (updatedData) => {
    try {
      const response = await fetch(`${API_URL}/${updatedData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...updatedData,
            currentUserEmail: user.email,
            currentUserName: user.name
        }),
      });

      if (!response.ok) {
        const errorRes = await response.json();
        throw new Error(errorRes.message || 'Falha ao atualizar a distribuição');
      }

      const data = await response.json();
      
      setDistributions(prev => prev.map(dist => (dist.id === data.id ? data : dist)));
      setIsEditDialogOpen(false); 
      toast.success("Distribuição atualizada com sucesso!");
      // window.location.reload(); // Evite reload se possível, o estado já foi atualizado acima
    } catch (err) {
      toast.error("Erro ao atualizar", { description: err.message });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton do Card de Adicionar Distribuição (Só mostra se não for viewer) */}
        {!isViewer && (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[250px] mb-2" />
              <Skeleton className="h-4 w-[400px]" />
            </CardHeader>
            <CardContent>
              <div>
                <Skeleton className="h-4 w-[150px] mb-2" />
                <div className="flex items-center justify-center gap-5">
                  <div className="w-4/5">
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="w-1/5">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}


        {/* Skeleton do Card da Tabela */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-[350px]" />
              </div>
              <div className="w-1/3">
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Domínio</TableHead>
                  <TableHead>Origins</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Gera 6 linhas falsas para a tabela */}
                {Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={index} className="h-16">
                    <TableCell className="w-[5%]">
                      <Skeleton className="h-7 w-10 rounded" />
                    </TableCell>
                    <TableCell className="w-[25%]">
                      <Skeleton className="h-7 w-full max-w-[200px] rounded" />
                    </TableCell>
                    <TableCell className="w-[30%]">
                      <Skeleton className="h-7 w-full max-w-[280px] rounded" />
                    </TableCell>
                    <TableCell className="w-[30%]">
                      <Skeleton className="h-7 w-full max-w-[200px] rounded" />
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
            
            <div className="flex items-center justify-end gap-2 mt-4">
              <Skeleton className="h-4 w-[100px] mr-2" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-10 text-destructive">Erro: {error}</div>
  }

  return (
    <div className="space-y-6">
      {!isViewer  && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Nova Distribuição</CardTitle>
            <CardDescription>Crie uma nova distribuição para servir seu conteúdo</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="dist-name" className='mb-1'>Nome da Distribuição</Label>
              <div className="flex items-center justify-center gap-5">
                <div className="w-4/5">
                  <Input
                    id="dist-name"
                    placeholder="STB"
                    value={newDistributionName}
                    onChange={(e) => setNewDistributionName(e.target.value)}
                  />
                </div>
                <div className="w-1/5">
                  <Button onClick={addDistribution} className="cursor-pointer hover:bg-gray-600 bg-blue-400 w-full hover:shadow">
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Distribuições Criadas</CardTitle>
              <CardDescription>Lista de todas as distribuições gerenciadas pela CDN</CardDescription>
            </div>
            <div className="w-1/3">
              <Input
                placeholder="Filtrar por nome ou domínio... "
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Domínio</TableHead>
                <TableHead>Origins</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {distributions.length > 0 ? (
                distributions.map((dist) => (
                  <TableRow key={dist.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium w-[5%]">
                      <Badge variant="secondary" className="px-2 py-1.5 bg-blue-400 text-white rounded">
                        {dist.id}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-[25%]">
                      <Badge variant="secondary" className="px-5 font-medium tracking-wide max-w-[90%] truncate rounded" >
                        {dist.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-[30%]">
                      <Badge variant='secondary' className='px-5 py-1 text-blue-800 tracking-wider w-full rounded'>
                        {dist.domain_name}  
                      </Badge>
                    </TableCell>
                    <TableCell className="w-[30%]">
                      {dist.origins && dist.origins.length > 0 ? (
                        <Badge variant='secondary' className=" rounded">
                          <div className="flex items-center gap-2">
                            <span className="truncate  px-5 py-1 text-blue-800 tracking-wider" title={dist.origins[0].origin_id}>
                              {dist.origins[0].domain_name}
                            </span>

                            {/* 2. Se tiver mais de 1, mostra o Badge com "+X" */}
                            {dist.origins.length > 1 && (
                              <Badge variant="secondary" className="px-2 py-0.5 text-xs rounded-full h-5 min-w-[24px] justify-center">
                                +{dist.origins.length - 1}
                              </Badge>
                            )}
                          </div>
                        </Badge>
                        
                      ) : (
                        <span className="text-muted-foreground text-xs px-5">Nenhum origin</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right w-[10%]">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedDistribution(dist); 
                            setIsEditDialogOpen(true);     
                          }}
                          className="cursor-pointer hover:bg-neutral-300 transition-all duration-200"
                          disabled={isViewer}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {/* 5. BOTÃO DE DELETAR ATUALIZADO PARA CHAMAR confirmDelete */}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => confirmDelete(dist.id)} 
                            className="cursor-pointer hover:bg-red-300 transition-all duration-200" 
                            disabled={isViewer}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>

                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    Nenhuma distribuição encontrada com o nome "{searchTerm}".
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          <div className="flex items-center justify-end gap-1 mt-3">
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* COMPONENTE DE EDIÇÃO JÁ EXISTENTE */}
      {selectedDistribution && (
        <EditDistributionDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          distribution={selectedDistribution}
          onSave={handleUpdateDistribution}
        />
      )}

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente a distribuição
              e removerá os dados associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Sim, deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}

export default DistributionsPage;