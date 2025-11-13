import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Edit, Plus, Trash2 } from 'lucide-react'
import CreatePolicyDialog from '@/components/shared/CreatePolicyDialog'
import EditPolicyDialog from '@/components/shared/EditPolicyDialog'
import CreateOriginPolicyDialog from '@/components/shared/CreateOriginPolicyDialog'
import EditOriginPolicyDialog from '@/components/shared/EditOriginPolicyDialog'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/context/AuthContext'

function PoliciesPage() {
  // --- CACHE POLICIES ---
  const [cachePolicies, setCachePolicies] = useState([]);
  const [isCacheLoading, setIsCacheLoading] = useState(true);
  const [cacheError, setCacheError] = useState(null);
  const [isCacheCreateOpen, setIsCacheCreateOpen] = useState(false);
  const [isCacheEditOpen, setIsCacheEditOpen] = useState(false);
  const [selectedCachePolicy, setSelectedCachePolicy] = useState(null);
  const [cachePolicyToDelete, setCachePolicyToDelete] = useState(null);
  const CACHE_API_URL = '/api/cache-policies';

  // --- ORIGIN POLICIES ---
  const [originPolicies, setOriginPolicies] = useState([]);
  const [isOriginLoading, setIsOriginLoading] = useState(true);
  const [originError, setOriginError] = useState(null);
  const [isOriginCreateOpen, setIsOriginCreateOpen] = useState(false);
  const [isOriginEditOpen, setIsOriginEditOpen] = useState(false);
  const [selectedOriginPolicy, setSelectedOriginPolicy] = useState(null);
  const [originPolicyToDelete, setOriginPolicyToDelete] = useState(null);
  const ORIGIN_API_URL = '/api/origin-policies';

  const { user } = useAuth();

  const isAdmin = user.role === 'admin';
  const isViewer = user.role === 'viewer';

  // --- FETCH CACHE POLICIES ---
  const fetchCachePolicies = useCallback(async () => {
    try {
      setIsCacheLoading(true);
      const res = await fetch(CACHE_API_URL);
      if (!res.ok) throw new Error('Falha ao buscar políticas de cache');
      const data = await res.json();
      setCachePolicies(data);
    } catch (err) {
      setCacheError(err.message);
    } finally {
      setIsCacheLoading(false);
    }
  }, []);

  // --- FETCH ORIGIN POLICIES ---
  const fetchOriginPolicies = useCallback(async () => {
    try {
      setIsOriginLoading(true);
      const res = await fetch(ORIGIN_API_URL);
      if (!res.ok) throw new Error('Falha ao buscar políticas de origem');
      const data = await res.json();
      setOriginPolicies(data);
    } catch (err) {
      setOriginError(err.message);
    } finally {
      setIsOriginLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCachePolicies();
    fetchOriginPolicies();
  }, [fetchCachePolicies, fetchOriginPolicies]);

  // --- CREATE / UPDATE / DELETE (CACHE) ---
  const handleCachePolicyCreated = (newPolicy) => setCachePolicies(prev => [...prev, newPolicy]);

  const handleUpdateCachePolicy = async (updatedCachePolicy) => {
    try {
      const response = await fetch(`${CACHE_API_URL}/${updatedCachePolicy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCachePolicy),
      });
      if (!response.ok) throw new Error('Falha ao atualizar a política');
      const data = await response.json();
      setCachePolicies(prev => prev.map(p => p.id === data.id ? data : p));
      setIsCacheEditOpen(false);
      toast.success("Política de cache atualizada com sucesso!");
    } catch (err) {
      toast.error("Erro ao atualizar política de cache", { description: err.message });
    }
  };

  const deleteCachePolicy = async (id) => {
    try {
      const response = await fetch(`${CACHE_API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Falha ao deletar a política');
      setCachePolicies(prev => prev.filter(p => p.id !== id));
      toast.success("Política de cache deletada com sucesso!");
    } catch (err) {
      toast.error("Erro ao deletar política de cache", { description: err.message });
    }
  };

  // --- CREATE / UPDATE / DELETE (ORIGIN) ---
  const handleOriginPolicyCreated = (newPolicy) => setOriginPolicies(prev => [...prev, newPolicy]);

  const handleUpdateOriginPolicy = async (updatedOriginPolicy) => {
    try {
      const response = await fetch(`${ORIGIN_API_URL}/${updatedOriginPolicy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOriginPolicy),
      });
      if (!response.ok) throw new Error('Falha ao atualizar a política de origem');
      const data = await response.json();
      setOriginPolicies(prev => prev.map(p => p.id === data.id ? data : p));
      setIsOriginEditOpen(false);
      toast.success("Política de origem atualizada com sucesso!");
    } catch (err) {
      toast.error("Erro ao atualizar política de origem", { description: err.message });
    }
  };

  const deleteOriginPolicy = async (id) => {
    try {
      const response = await fetch(`${ORIGIN_API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Falha ao deletar a política de origem');
      setOriginPolicies(prev => prev.filter(p => p.id !== id));
      toast.success("Política de origem deletada com sucesso!");
    } catch (err) {
      toast.error("Erro ao deletar política de origem", { description: err.message });
    }
  };

  // --- RENDER ---
  if (isCacheLoading || isOriginLoading) return <p>Carregando políticas...</p>;
  if (cacheError || originError) return <p className="text-destructive">Erro: {cacheError || originError}</p>;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="originPolicy" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 gap-3">
          <TabsTrigger value="originPolicy" className="py-2.5 cursor-pointer">Origin Policy</TabsTrigger>
          <TabsTrigger value="cachePolicy" className="py-2.5 cursor-pointer">Cache Policy</TabsTrigger>
        </TabsList>

        {/* CACHE POLICIES */}
        <TabsContent value="cachePolicy">
          <Card>
            <CardHeader>
              <CardTitle>Políticas de Cache</CardTitle>
              <CardDescription>Gerencie suas políticas de cache reutilizáveis.</CardDescription>
            </CardHeader>
            <CardContent>
              {!isViewer&& (
                <Button onClick={() => setIsCacheCreateOpen(true)}>
                  <Plus className="mr-1 h-4 w-4" /> Nova Política de Cache
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader><CardTitle>Políticas Criadas</CardTitle></CardHeader>
            <CardContent>
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[10%]">ID</TableHead>
                    <TableHead className="w-[20%]">Nome</TableHead>
                    <TableHead className="w-[55%]">Descrição</TableHead>
                    <TableHead className="w-[15%]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cachePolicies.map(policy => (
                    <TableRow key={policy.id}>
                      <TableCell>{policy.id}</TableCell>
                      <TableCell>{policy.name}</TableCell>
                      <TableCell className="truncate" title={policy.description}>{policy.description}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedCachePolicy(policy); setIsCacheEditOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setCachePolicyToDelete(policy)}>
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

          <CreatePolicyDialog
            isOpen={isCacheCreateOpen}
            onOpenChange={setIsCacheCreateOpen}
            onPolicyCreated={handleCachePolicyCreated}
          />

          {selectedCachePolicy && (
            <EditPolicyDialog
              isOpen={isCacheEditOpen}
              onOpenChange={setIsCacheEditOpen}
              policy={selectedCachePolicy}
              onSave={handleUpdateCachePolicy}
            />
          )}

          <AlertDialog open={!!cachePolicyToDelete} onOpenChange={() => setCachePolicyToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a política "{cachePolicyToDelete?.name}"?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => cachePolicyToDelete && deleteCachePolicy(cachePolicyToDelete.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        {/* ORIGIN POLICIES */}
        <TabsContent value="originPolicy">
          <Card>
            <CardHeader>
              <CardTitle>Políticas de Origem</CardTitle>
              <CardDescription>Gerencie suas políticas de requisição para a origem.</CardDescription>
            </CardHeader>
            <CardContent>
              {!isViewer && (
                <Button onClick={() => setIsOriginCreateOpen(true)}>
                  <Plus className="mr-1 h-4 w-4" /> Nova Política de Origem
                </Button>
              )}
              
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader><CardTitle>Políticas Criadas</CardTitle></CardHeader>
            <CardContent>
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[10%]">ID</TableHead>
                    <TableHead className="w-[20%]">Nome</TableHead>
                    <TableHead className="w-[55%]">Descrição</TableHead>
                    <TableHead className="w-[15%]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {originPolicies.map(policy => (
                    <TableRow key={policy.id}>
                      <TableCell>{policy.id}</TableCell>
                      <TableCell className='truncate pr-5'>{policy.name}</TableCell>
                      <TableCell className="truncate" title={policy.description}>{policy.description}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedOriginPolicy(policy); setIsOriginEditOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setOriginPolicyToDelete(policy)}>
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

          <CreateOriginPolicyDialog
            isOpen={isOriginCreateOpen}
            onOpenChange={setIsOriginCreateOpen}
            onPolicyCreated={handleOriginPolicyCreated}
          />

          {selectedOriginPolicy && (
            <EditOriginPolicyDialog
              isOpen={isOriginEditOpen}
              onOpenChange={setIsOriginEditOpen}
              policy={selectedOriginPolicy}
              onSave={handleUpdateOriginPolicy}
            />
          )}

          <AlertDialog open={!!originPolicyToDelete} onOpenChange={() => setOriginPolicyToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a política "{originPolicyToDelete?.name}"?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => originPolicyToDelete && deleteOriginPolicy(originPolicyToDelete.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PoliciesPage;
