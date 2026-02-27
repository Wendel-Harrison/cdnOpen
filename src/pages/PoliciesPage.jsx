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
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/context/AuthContext'
import { Badge } from '@/components/ui/badge'

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

  // Novo estado para loading de deleção (UX)
  const [isDeleting, setIsDeleting] = useState(false);

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
        body: JSON.stringify({
          ...updatedCachePolicy,
          currentUserEmail: user.email,
          currentUserName: user.name  
        }),
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

  const deleteCachePolicy = async () => {
    if (!cachePolicyToDelete) return;
    setIsDeleting(true);

    try {
      // CORREÇÃO: Enviando body com dados do usuário para auditoria
      const response = await fetch(`${CACHE_API_URL}/${cachePolicyToDelete.id}`, { 
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentUserEmail: user.email, 
            currentUserName: user.name   
          })
      });

      if (!response.ok) {
        // CORREÇÃO: Lendo a mensagem de erro do backend (ex: constraint violation)
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falha ao deletar a política');
      }

      setCachePolicies(prev => prev.filter(p => p.id !== cachePolicyToDelete.id));
      toast.success("Política de cache deletada com sucesso!");
      setCachePolicyToDelete(null); // Fecha o modal no sucesso
    } catch (err) {
      toast.error("Erro ao deletar política de cache", { description: err.message });
      // Não fecha o modal no erro
    } finally {
      setIsDeleting(false);
    }
  };

  // --- CREATE / UPDATE / DELETE (ORIGIN) ---
  const handleOriginPolicyCreated = (newPolicy) => setOriginPolicies(prev => [...prev, newPolicy]);

  const handleUpdateOriginPolicy = async (updatedOriginPolicy) => {
    try {
      const response = await fetch(`${ORIGIN_API_URL}/${updatedOriginPolicy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedOriginPolicy,
          currentUserEmail: user.email,
          currentUserName: user.name
        }),
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

  const deleteOriginPolicy = async () => {
    if (!originPolicyToDelete) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`${ORIGIN_API_URL}/${originPolicyToDelete.id}`,
        { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            currentUserEmail: user.email, 
            currentUserName: user.name   
        })
      });

      if (!response.ok) {
        // CORREÇÃO: Lendo a mensagem de erro do backend
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falha ao deletar a política de origem');
      }

      setOriginPolicies(prev => prev.filter(p => p.id !== originPolicyToDelete.id));
      toast.success("Política de origem deletada com sucesso!");
      setOriginPolicyToDelete(null);
    } catch (err) {
      toast.error("Erro ao deletar política de origem", { description: err.message });
    } finally {
      setIsDeleting(false);
    }
  };

  // --- RENDER ---
  if (isCacheLoading || isOriginLoading) return <p>Carregando políticas...</p>;
  if (cacheError || originError) return <p className="text-destructive">Erro: {cacheError || originError}</p>;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="originPolicy" className="space-y-4 ">
        <TabsList className="grid w-full grid-cols-2 gap-3 bg-transparent">
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
                <Button onClick={() => setIsCacheCreateOpen(true)} className=" cursor-pointer hover:bg-gray-600 bg-blue-400 hover:shadow">
                  <Plus className="mr-1 h-4 w-4 " /> Nova Política de Cache
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
                    <TableHead className="w-[5%]">ID</TableHead>
                    <TableHead className="w-[30%]">Nome</TableHead>
                    <TableHead className="w-[55%]">Descrição</TableHead>
                    <TableHead className="w-[10%] text-right pr-10">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cachePolicies.map(policy => (
                    <TableRow key={policy.id}>
                      <TableCell className=" w-[5%]">
                        <Badge className='h-7 w-8 bg-blue-400'>
                          {policy.id}
                        </Badge>
                      </TableCell >
                      <TableCell className=" w-[35%]">
                        <Badge className='py-1.5 px-5 text-blue-800' variant='secondary'>
                          {policy.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="truncate w-[50%]" title={policy.description}>
                        <Badge className='py-1.5 px-5 ' variant='secondary'>
                          {policy.description}
                        </Badge>
                      </TableCell>
                      <TableCell className=" w-[10%]">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedCachePolicy(policy); setIsCacheEditOpen(true); }} className="cursor-pointer hover:bg-neutral-300">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setCachePolicyToDelete(policy)} className="cursor-pointer hover:bg-red-300">
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
            // CORREÇÃO: Passando user data
            currentUserEmail={user?.email} 
            currentUserName={user?.name}
          />

          {selectedCachePolicy && (
            <EditPolicyDialog
              isOpen={isCacheEditOpen}
              onOpenChange={setIsCacheEditOpen}
              policy={selectedCachePolicy}
              onSave={handleUpdateCachePolicy}
              // CORREÇÃO: Passando user data
              currentUserEmail={user?.email} 
              currentUserName={user?.name}
            />
          )}

          <AlertDialog open={!!cachePolicyToDelete} onOpenChange={(open) => !open && setCachePolicyToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a política "{cachePolicyToDelete?.name}"?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    deleteCachePolicy();
                  }}
                  className="bg-destructive hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Excluindo..." : "Excluir"}
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
                <Button onClick={() => setIsOriginCreateOpen(true)} className=" cursor-pointer hover:bg-gray-600 bg-blue-400 hover:shadow">
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
                    <TableHead className="w-[5%]">ID</TableHead>
                    <TableHead className="w-[30%]">Nome</TableHead>
                    <TableHead className="w-[55%]">Descrição</TableHead>
                    <TableHead className="w-[10%] text-right pr-10">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {originPolicies.map(policy => (
                    <TableRow key={policy.id}>
                      <TableCell>
                        <Badge className='h-7 w-8 bg-blue-400'>
                          {policy.id}
                        </Badge>
                      </TableCell>
                      <TableCell className='truncate pr-5'>
                        <Badge className='py-1.5 px-5 text-blue-800' variant='secondary'>
                          {policy.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="truncate" title={policy.description}>
                        <Badge className='py-1.5 px-5 ' variant='secondary'>
                          {policy.description}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedOriginPolicy(policy); setIsOriginEditOpen(true); }} className="cursor-pointer hover:bg-neutral-300">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setOriginPolicyToDelete(policy)} className="cursor-pointer hover:bg-red-300">
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
            currentUserEmail={user?.email} 
            currentUserName={user?.name}
          />

          {selectedOriginPolicy && (
            <EditOriginPolicyDialog
              isOpen={isOriginEditOpen}
              onOpenChange={setIsOriginEditOpen}
              policy={selectedOriginPolicy}
              onSave={handleUpdateOriginPolicy}
              currentUserEmail={user?.email} 
              currentUserName={user?.name}
            />
          )}

          <AlertDialog open={!!originPolicyToDelete} onOpenChange={(open) => !open && setOriginPolicyToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a política "{originPolicyToDelete?.name}"?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    deleteOriginPolicy();
                  }}
                  className="bg-destructive hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Excluindo..." : "Excluir"}
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