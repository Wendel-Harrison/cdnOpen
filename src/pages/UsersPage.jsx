// UsersPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, Trash2, UserRound, UserPlus, UserCog } from 'lucide-react';
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogTrigger, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { EditUserDialog } from '@/components/shared/EditUserDialog';

const API_URL = '/api/users';

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'viewer' });
  
  // Estado para o diálogo de exclusão
  const [userToDelete, setUserToDelete] = useState(null);
  
  const [userToEdit, setUserToEdit] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // --- BUSCAR DADOS ---
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Falha ao buscar usuários');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
      toast.error("Erro ao carregar usuários", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- CRIAR USUÁRIO ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const addUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast.warning("Nome e Email são obrigatórios.");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falha ao criar usuário.');
      }

      const createdUser = await response.json();
      setUsers(prev => [...prev, createdUser]); 
      setNewUser({ name: '', email: '', role: 'viewer' });
      toast.success("Usuário criado com sucesso!", {
        description: `Senha temporária: ${createdUser.tempPassword}`,
        classNames: {
        title: 'text-center',
        description: 'text-center',
      }
      });

    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar usuário", { description: err.message });
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    if (!userToEdit) return;
    
    try {
      const response = await fetch(`${API_URL}/${userToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falha ao atualizar usuário.');
      }

      const data = await response.json();
      setUsers(prev => prev.map(u => (u.id === data.id ? data : u)));
      toast.success("Usuário atualizado com sucesso!");
      setIsEditDialogOpen(false); // Fecha o diálogo
      setUserToEdit(null); // Limpa a seleção

    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar usuário", { description: err.message });
    }
  };

  // --- DELETAR USUÁRIO ---
  const deleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`${API_URL}/${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falha ao deletar usuário.');
      }

      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      toast.success("Usuário deletado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao deletar usuário", { description: err.message });
    } finally {
      setUserToDelete(null); // Fecha o diálogo
    }
  };

  // --- RENDERIZAÇÃO ---
  if (isLoading) return <p>Carregando usuários...</p>;
  if (error) return <p className="text-destructive">Erro: {error}</p>;

  const RoleIcon = ({ role }) => {
  if (role === 'admin') {
    return <UserCog className="h-5 w-5 " title="Administrador" />;
  }
  if (role === 'editor') {
    return <UserPlus className="h-5 w-5" title="Editor" />;
  }
  // Padrão para 'viewer'
  return <UserRound className="h-5 w-5 text-gray-500" title="Visualizador" />;
};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Usuário</CardTitle>
          <CardDescription>Crie um novo usuário para acessar o painel de administração</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Nome</Label>
              <Input
                id="user-name"
                name="name" // Adicionado 'name' para o handleFormChange
                placeholder="Nome do usuário"
                value={newUser.name}
                onChange={handleFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                name="email" // Adicionado 'name'
                type="email"
                placeholder="email@example.com"
                value={newUser.email}
                onChange={handleFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-role">Função</Label>
              <select
                id="user-role"
                name="role" // Adicionado 'name'
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={newUser.role}
                onChange={handleFormChange}
              >
                <option value="admin">Administrador</option>
                <option value="editor">Editor</option>
                <option value="viewer">Visualizador</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={addUser} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Usuário
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
          <CardDescription>Lista de todos os usuários com acesso ao sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader >
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium text-center">
                    <RoleIcon role={user.role} />
                  </TableCell>
                  <TableCell className=" py-1 font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="w-20 py-1 font-medium">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="w-14 py-1">
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="cursor-pointer hover:bg-neutral-300 transition-all duration-200" onClick={() => {
                        setUserToEdit(user);
                        setIsEditDialogOpen(true);
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="cursor-pointer hover:bg-red-300 transition-all duration-200" onClick={() => setUserToDelete(user)}>
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
      
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário "{userToDelete?.name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteUser} // Chama a função que executa o DELETE
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {userToEdit && (
        <EditUserDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          user={userToEdit}
          onSave={handleUpdateUser}
        />
      )}
      
    </div>
  );
}

export default UsersPage;