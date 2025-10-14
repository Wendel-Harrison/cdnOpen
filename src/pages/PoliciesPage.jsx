import { useState, useEffect  } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Server, Globe, Settings, TrendingUp, Plus, Trash2, Edit, LayoutDashboard, Users, Cog, Menu, X, Package, AlertTriangle } from 'lucide-react'
import { toast } from "sonner"
import { IconPlus } from '@tabler/icons-react';
import CreatePolicyDialog from '@/components/shared/CreatePolicyDialog'


// Este seria um novo componente, talvez em um novo arquivo ou no App.jsx
function PoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/policies');
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
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Criar Nova Política
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Políticas Criadas</CardTitle>
        </CardHeader>
        <CardContent>
          {/* AQUI VOCÊ DEVE CRIAR UMA TABELA PARA LISTAR AS 'policies' */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Default TTL</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map(policy => (
                <TableRow key={policy.id}>
                  <TableCell>{policy.id}</TableCell>
                  <TableCell>{policy.name}</TableCell>
                  <TableCell>{policy.default_ttl}</TableCell>
                  <TableCell>
                    {/* Botões de Editar/Deletar política iriam aqui */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* O Dialog de criação de política pertence a esta página */}
      <CreatePolicyDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onPolicyCreated={handlePolicyCreated}
      />
    </div>
  );
}

export default PoliciesPage;