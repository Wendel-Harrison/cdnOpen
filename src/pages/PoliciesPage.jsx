import { useState, useEffect  } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Edit, Plus, Trash2 } from 'lucide-react';
import CreatePolicyDialog from '@/components/shared/CreatePolicyDialog';
import EditPolicyDialog from '@/components/shared/EditPolicyDialog';
import { toast } from 'sonner';

function PoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState(null);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const API_URL = '/api/policies'

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Falha ao buscar políticas');
        const data = await res.json();
        setPolicies(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  const handlePolicyCreated = (newPolicy) => {
    setPolicies(prev => [...prev, newPolicy]);
  };

  const deletePolicy = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        });

        if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falha ao deletar a política.');
        }

        setPolicies(prevPolicies => prevPolicies.filter(p => p.id !== id));
        toast.success("Política deletada com sucesso!");

    } catch (err) {
        console.error(err);
        toast.error("Erro ao deletar política", { description: err.message });
    }
    };

    const handleUpdatePolicy = async (updatedPolicy) => {
    try {
      const response = await fetch(`${API_URL}/${updatedPolicy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPolicy),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar a política');
      }

      const data = await response.json();
      
      setPolicies(policies.map(p => p.id === data.id ? data : p));
      setIsEditDialogOpen(false);
      toast.success("Política atualizada com sucesso!");

    } catch (err) {
      toast.error("Erro ao atualizar política", { description: err.message });
    }
  };


  if (isLoading) return <p>Carregando políticas...</p>;
  if (error) return <p className="text-destructive">Erro: {error}</p>;

  

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Políticas de Cache</CardTitle>
          <CardDescription>Gerencie suas políticas de cache reutilizáveis.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Nova
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Políticas Criadas</CardTitle>
        </CardHeader>
        <CardContent>
          {/* AQUI VOCÊ DEVE CRIAR UMA TABELA PARA LISTAR AS 'policies' */}
          <Table className="table-fixed w-full">
            <TableHeader>
                <TableRow>
                {/* 2. Defina a largura de cada coluna no cabeçalho */}
                <TableHead className="w-[10%]">ID</TableHead>
                <TableHead className="w-[20%]">Nome</TableHead>
                <TableHead className="w-[55%]">Descrição</TableHead>
                <TableHead className="w-[10%]">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {policies.map(policy => (
                <TableRow key={policy.id}>
                    <TableCell>{policy.id}</TableCell>
                    <TableCell>{policy.name}</TableCell>
                    
                    {/* 3. Use 'truncate' para cortar o texto longo com "..." */}
                    <TableCell className="truncate" title={policy.description}>
                    {policy.description}
                    </TableCell>
                    
                    <TableCell>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => {setSelectedPolicy(policy); setIsEditDialogOpen(true);}}>
                        <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deletePolicy(policy.id)}>
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
      {selectedPolicy && (
        <EditPolicyDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          policy={selectedPolicy}
          onSave={handleUpdatePolicy}
        />
      )}

      <CreatePolicyDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onPolicyCreated={handlePolicyCreated}
      />
    </div>
  );
}

export default PoliciesPage;