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

  const [functionsList, setFunctionsList] = useState([]);

  const { user } = useAuth();

  const isAdmin = user.role === 'admin';
  const isViewer = user.role === 'viewer';

  // Função para buscar os dados dos dropdowns (cache e origin policies)
  const fetchDropdownData = useCallback(async () => {
    try {
      const [cacheRes, originRes, funcRes] = await Promise.all([
        fetch('/api/cache-policies'),
        fetch('/api/origin-policies'),
        fetch('/api/functions'),
      ]);
      if (!cacheRes.ok || !originRes.ok) throw new Error('Falha ao buscar dados de políticas');
      
      const cacheData = await cacheRes.json();
      const originData = await originRes.json();
      const funcData = await funcRes.json();
      
      setCachePolicies(cacheData);
      setOriginPolicies(originData);
      const functionsArray = Array.isArray(funcData) ? funcData : (funcData.data || []);
      setFunctionsList(functionsArray);
      console.log("Funções carregadas:", functionsArray);
    } catch (err) {
      toast.error("Erro ao carregar dados de políticas", { description: err.message });
    }
  }, []);

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
      const response = await fetch(`/api/behaviors/${behaviorToDelete.id}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
            currentUserEmail: user.email,
            currentUserName: user.name  
        })
      });

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
                      <TableHead className="w-[10%]">Prioridade</TableHead>
                      <TableHead className="w-[15%]">Path Pattern</TableHead>
                      <TableHead className="w-[30%]">Origin Atribuído</TableHead>
                      <TableHead className="w-[15%]">Politica de Origem</TableHead>
                      <TableHead className="w-[15%]">Politica de Cache</TableHead>
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
                          <TableCell className=''>
                            <Badge className='py-1.5 px-5 bg-neutral-100 hover:bg-neutral-300 transition-all duration-200' variant='outline'>
                              {origins.find(o => o.id === behavior.origin_id)?.origin_id || <span className="text-muted-foreground font-bold">ID: {behavior.origin_id}</span>}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className='py-1.5 px-5' variant='outline'>
                              {originPolicies.find(op => op.id === behavior.origin_policy_id)?.name || <Badge className="text-muted-foreground">ID: {behavior.origin_policy_id}</Badge>}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className='py-1.5 px-5' variant='outline'>
                              {cachePolicies.find(cp => cp.id === behavior.cache_policy_id)?.name || <Badge className="text-muted-foreground">ID: {behavior.cache_policy_id}</Badge>}                            </Badge>
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
            functionsList={functionsList}
            onSuccess={() => fetchBehaviors(selectedDistId)}
            currentUserEmail={user?.email} 
            currentUserName={user?.name}
          />
          {behaviorToEdit && (
            <BehaviorFormDialog
              isOpen={!!behaviorToEdit}
              onOpenChange={() => setBehaviorToEdit(null)}
              distributionId={selectedDistId}
              originsList={filteredOrigins} 
              cachePolicies={cachePolicies}
              originPolicies={originPolicies}
              functionsList={functionsList}
              onSuccess={handleUpdateSuccess}
              behaviorToEdit={behaviorToEdit}
              currentUserEmail={user?.email} 
              currentUserName={user?.name}
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