// BehaviorsTab.jsx
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Select, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge.jsx';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { toast } from "sonner";
import { BehaviorFormDialog } from './BehaviorFormDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { useAuth } from '@/context/AuthContext';

function BehaviorsTab({ distributions, origins }) {
  const [selectedDistId, setSelectedDistId] = useState('');
  const [behaviors, setBehaviors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estado para controlar o diálogo de criação
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [behaviorToEdit, setBehaviorToEdit] = useState(null);
  const [behaviorToDelete, setBehaviorToDelete] = useState(null);
  
  // Estados para os dados dos dropdowns
  const [cachePolicies, setCachePolicies] = useState([]);
  const [originPolicies, setOriginPolicies] = useState([]);

  const { user } = useAuth();

  const isAdmin = user.role === 'admin';
  const isViewer = user.role === 'viewer';

  // Função para buscar os dados dos dropdowns (cache e origin policies)
  const fetchDropdownData = useCallback(async () => {
    try {
      const [cacheRes, originRes] = await Promise.all([
        fetch('/api/cache-policies'),
        fetch('/api/origin-policies'),
      ]);
      if (!cacheRes.ok || !originRes.ok) throw new Error('Falha ao buscar dados de políticas');
      
      const cacheData = await cacheRes.json();
      const originData = await originRes.json();
      
      setCachePolicies(cacheData);
      setOriginPolicies(originData);
    } catch (err) {
      toast.error("Erro ao carregar dados de políticas", { description: err.message });
    }
  }, []);

  // Busca os dados dos dropdowns apenas uma vez, quando o componente monta
  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  const fetchBehaviors = useCallback(async (distributionId) => {
    if (!distributionId) {
      setBehaviors([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/behaviors?distribution_id=${distributionId}`);
      if (!res.ok) throw new Error('Falha ao buscar behaviors');
      const data = await res.json();
      setBehaviors(data);
    } catch (err) {
      setError(err.message);
      toast.error("Erro ao buscar behaviors", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Efeito para buscar os behaviors quando o ID da distribuição selecionada muda
  useEffect(() => {
    fetchBehaviors(selectedDistId);
  }, [selectedDistId, fetchBehaviors]);
  
  const handleCreateSuccess = (newBehavior) => {
    setBehaviors(prev => [...prev, newBehavior].sort((a, b) => a.priority - b.priority));
  };

  const handleUpdateSuccess = (updatedBehavior) => {
    setBehaviors(prev => prev.map(b => b.id === updatedBehavior.id ? updatedBehavior : b).sort((a, b) => a.priority - b.priority));
  };

  const handleDeleteBehavior = async () => {
    if (!behaviorToDelete) return;
    try {
      const response = await fetch(`/api/behaviors/${behaviorToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha ao deletar o behavior.');
      }
      toast.success('Behavior deletado com sucesso!');
      setBehaviors(prev => prev.filter(b => b.id !== behaviorToDelete.id));
    } catch (err) {
      toast.error('Erro ao deletar behavior', { description: err.message });
    } finally {
      setBehaviorToDelete(null);
    }
  };

  const filteredOrigins = origins.filter(o => o.distribution_id === parseInt(selectedDistId, 10));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Distribuição</CardTitle>
          <CardDescription>Escolha uma distribuição para ver e gerenciar seus behaviors.</CardDescription>
        </CardHeader>
        <CardContent className='flex justify-between'>
          <Select onValueChange={setSelectedDistId} value={selectedDistId}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Selecione uma distribuição..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Distribuições Disponíveis</SelectLabel>
                {distributions.map(dist => (
                  <SelectItem key={dist.id} value={dist.id.toString()}>
                    {dist.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {selectedDistId && !isViewer && (
          <Button onClick={() => setIsCreateDialogOpen(true)} className="cursor-pointer hover:bg-gray-600 hover:shadow">
            <Plus className="mr-2 h-4 w-4" /> Novo Behavior
          </Button>
        )}
        </CardContent>
      </Card>
      
      {selectedDistId && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Behaviors Configurados</CardTitle>
              <CardDescription>
                Políticas de cache aplicadas à distribuição selecionada, ordenadas por prioridade.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 1. Lógica de renderização condicional */}
              {isLoading && <p className="text-center text-muted-foreground">Carregando behaviors...</p>}
              {error && <p className="text-center text-destructive">Erro: {error}</p>}
              
              {/* 2. Renderiza a tabela apenas se não estiver carregando e não houver erro */}
              {!isLoading && !error && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[15%]">Prioridade</TableHead>
                      <TableHead className="w-[35%]">Path Pattern</TableHead>
                      <TableHead className="w-[35%]">Origin Atribuído</TableHead>
                      <TableHead className="w-[15%] text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* 3. Verifica se a lista de behaviors está vazia */}
                    {behaviors.length > 0 ? (
                      behaviors.map((behavior) => (
                        <TableRow key={behavior.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <Badge variant="secondary">{behavior.priority}</Badge>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-2 py-1 rounded">{behavior.path_pattern}</code>
                          </TableCell>
                          <TableCell>
                            {origins.find(o => o.id === behavior.origin_id)?.origin_id || <span className="text-muted-foreground">ID: {behavior.origin_id}</span>}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => setBehaviorToEdit(behavior)} className="cursor-pointer hover:bg-neutral-300 hover:shadow" disabled={isViewer}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setBehaviorToDelete(behavior)} className="cursor-pointer hover:bg-red-300 hover:shadow" disabled={isViewer}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      // 4. Mensagem para quando não há behaviors
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                          Nenhum behavior encontrado para esta distribuição.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          <BehaviorFormDialog
            isOpen={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            distributionId={selectedDistId}
            originsList={filteredOrigins}
            cachePolicies={cachePolicies}
            originPolicies={originPolicies}
            onSuccess={() => fetchBehaviors(selectedDistId)}
          />
          {behaviorToEdit && (
            <BehaviorFormDialog
              isOpen={!!behaviorToEdit}
              onOpenChange={() => setBehaviorToEdit(null)}
              distributionId={selectedDistId}
              originsList={filteredOrigins} 
              cachePolicies={cachePolicies}
              originPolicies={originPolicies}
              onSuccess={handleUpdateSuccess}
              behaviorToEdit={behaviorToEdit}
            />
          )}
          <AlertDialog open={!!behaviorToDelete} onOpenChange={() => setBehaviorToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o behavior com o Path "{behaviorToDelete?.path_pattern}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteBehavior}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}

export default BehaviorsTab;