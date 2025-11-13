import { useState, useEffect, useCallback  } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Trash2, Edit} from 'lucide-react'

import EditDistributionDialog from '@/components/shared/EditDistributionDialog';

import { toast } from "sonner"
import { ChevronRight } from 'lucide-react'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'


function DistributionsPage() {

  const API_URL = '/api/distributions'
  const [distributions, setDistributions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [newDistributionName, setNewDistributionName] = useState('')
  const [searchTerm, setSearchTerm] = useState('');

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 15; // Define o limite de itens por página

  const { user } = useAuth();

  const isAdmin = user.role === 'admin';
  const isViewer = user.role === 'viewer';

  const fetchDistributions = useCallback(async (page) => {
    try {
      setIsLoading(true);
      // Adiciona os parâmetros de paginação à URL
      const response = await fetch(`${API_URL}?page=${page}&limit=${LIMIT}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar os dados da API');
      }
      const data = await response.json();
      
      // Atualiza os estados com os dados e metadados da API
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

  // useEffect agora depende da página atual
  useEffect(() => {
    fetchDistributions(currentPage);
  }, [currentPage, fetchDistributions]);

  // 4. Funções para adicionar e deletar que agora chamam a API
  const addDistribution = async () => {
    if (!newDistributionName) {
      toast.warning("O nome da distribuição não pode ser vazio.");
      return;
    }

    try {
      // Aqui você precisaria montar o objeto completo, incluindo o domain_name
      // Este é um exemplo simplificado
      const newDist = { name: newDistributionName, status: 'deployed' };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDist),
      });

      if (!response.ok) {
        toast.warning("Falha ao criar a distribuição")
      }

      const addedDistribution = await response.json();
      setDistributions([...distributions, addedDistribution]); // Adiciona a nova distribuição retornada pela API
      setNewDistributionName('');
    } catch (err) {      
      console.error(err);
    }
    await fetchDistributions(currentPage);
    toast.success("Criado com sucesso.");
  };

  const deleteDistribution = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        toast.error('Falha ao deletar distribuição');
      }
      await fetchDistributions(currentPage);
      setDistributions(distributions.filter(d => d.id !== id));
    } catch (err) {
    //   console.error(err);
    }
  };

  const filteredDistributions = distributions.filter(dist =>
    dist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="text-center p-10">Carregando distribuições...</div>;
  }
  if (error) {
    return <div className="text-center p-10 text-destructive">Erro: {error}</div>;
  }

  const handleUpdateDistribution = async (updatedData) => {
    try {
      const response = await fetch(`${API_URL}/${updatedData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorRes = await response.json();
        throw new Error(errorRes.message || 'Falha ao atualizar a distribuição');
      }

      const data = await response.json();
      
      setDistributions(prev => prev.map(dist => (dist.id === data.id ? data : dist)));
      setIsEditDialogOpen(false); // Fecha o diálogo
      toast.success("Distribuição atualizada com sucesso!");

    } catch (err) {
      toast.error("Erro ao atualizar", { description: err.message });
    }
  };

  // 5. Renderização condicional para os estados de carregamento e erro
  if (isLoading) {
    return <div className="text-center p-10">Carregando distribuições...</div>
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
                  <Button variant="secondary" onClick={
                    addDistribution
                    } className="cursor-pointer hover:bg-neutral-300 w-full hover:shadow">
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
                placeholder="Filtrar por nome..."
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
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDistributions.length > 0 ? (
                filteredDistributions.map((dist) => (
                  <TableRow key={dist.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">
                      <Badge variant="secondary" className="px-3">
                        {dist.id}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="px-3">
                        {dist.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant='secondary' className='px-5 py-1 text-blue-800 tracking-wider'>
                        {dist.domain_name}  
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {dist.origins && dist.origins.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="truncate px-3 py-1 rounded ">
                            {dist.origins.length}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Nenhum origin</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={dist.status === 'deployed' ? 'default' : 'secondary'}>
                        {dist.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedDistribution(dist); 
                            setIsEditDialogOpen(true);     
                          }}
                          className="cursor-pointer hover:bg-neutral-300"
                          disabled={isViewer}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteDistribution(dist.id)} className="cursor-pointer hover:bg-red-300" disabled={isViewer}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                // --- MENSAGEM PARA QUANDO O FILTRO NÃO ENCONTRA NADA ---
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
      {selectedDistribution && (
        <EditDistributionDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          distribution={selectedDistribution}
          onSave={handleUpdateDistribution}
        />
      )}
    </div>
  )
}

export default DistributionsPage;