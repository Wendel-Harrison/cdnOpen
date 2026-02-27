import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Trash2, Edit, ChevronLeft, ChevronRight, Code } from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

function FunctionsPage() {
  const navigate = useNavigate();

  const API_URL = '/api/functions';
  const [functions, setFunctions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para criação rápida
  const [newFunctionName, setNewFunctionName] = useState('');
  const [newFunctionDescription, setNewFunctionDescription] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  // Estados para deleção
  const [functionToDelete, setFunctionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const isViewer = user.role === 'viewer';

  // --- FETCH DATA ---
  const fetchFunctions = useCallback(async (page) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}?page=${page}&limit=${LIMIT}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar as funções');
      }
      const data = await response.json();
      
      setFunctions(Array.isArray(data.data) ? data.data : []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
      
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFunctions(currentPage);
  }, [currentPage, fetchFunctions]);

  // --- CRIAR ---
  const addFunction = async () => {
    if (!newFunctionName) {
      toast.warning("O nome da função é obrigatório.");
      return;
    }

    try {
      const newFunc = { 
        name: newFunctionName, 
        description: newFunctionDescription,
        code: '// Seu código aqui...',
        // DADOS DE AUDITORIA
        currentUserEmail: user?.email,
        currentUserName: user?.name
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFunc),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Falha ao criar a função");
      }

      const addedFunction = await response.json();
      setFunctions(prev => [...prev, addedFunction]); 
      
      setNewFunctionName('');
      setNewFunctionDescription('');
      toast.success("Função criada com sucesso.");

    } catch (err) {      
      console.error(err);
      toast.error("Erro ao criar função", { description: err.message });
    }
  };

  // --- DELETAR ---
  const handleConfirmDelete = async () => {
    if (!functionToDelete) return;

    setIsDeleting(true); 

    try {
      const response = await fetch(`${API_URL}/${functionToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        // DADOS DE AUDITORIA NO DELETE
        body: JSON.stringify({
            currentUserEmail: user?.email,
            currentUserName: user?.name
        })
      });

      if (!response.ok) {
        // LER MENSAGEM DO BACKEND (ex: erro de chave estrangeira)
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falha ao deletar função');
      }
      
      setFunctions(prev => prev.filter(f => f.id !== functionToDelete.id));
      toast.success('Função deletada com sucesso!');
      
      setFunctionToDelete(null); // Fecha o modal no sucesso

    } catch (err) {
       toast.error("Erro ao deletar", { description: err.message });
    } finally {
       setIsDeleting(false);
    }
  };

  // --- FILTRO CLIENT-SIDE ---
  const filteredFunctions = (functions || []).filter(func =>
    func.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="text-center p-10">Carregando funções...</div>;
  }
  if (error) {
    return <div className="text-center p-10 text-destructive">Erro: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {!isViewer && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Nova Função</CardTitle>
            <CardDescription>Crie funções serverless para processar requisições na borda (Edge)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="func-name">Nome</Label>
                    <Input
                        id="func-name"
                        placeholder="minha-funcao-otimizacao"
                        value={newFunctionName}
                        onChange={(e) => setNewFunctionName(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="func-desc">Descrição (Opcional)</Label>
                    <Input
                        id="func-desc"
                        placeholder="Redimensiona imagens..."
                        value={newFunctionDescription}
                        onChange={(e) => setNewFunctionDescription(e.target.value)}
                    />
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="secondary" onClick={addFunction} className="w-1/4  bg-blue-400 text-white hover:bg-gray-700 transition-all duration-150">
                  Adicionar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card de Listagem */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Funções Criadas</CardTitle>
              <CardDescription>Gerencie suas funções e códigos</CardDescription>
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
                <TableHead className="w-[5%]">ID</TableHead>
                <TableHead className="w-[12%]">Nome</TableHead>
                <TableHead className="w-[43%]">Descrição</TableHead>
                <TableHead className="w-[15%]">Última Modificação</TableHead>
                <TableHead className="w-[20%] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFunctions.length > 0 ? (
                filteredFunctions.map((func) => (
                  <TableRow key={func.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">
                      <Badge variant="secondary" className="px-3">
                        {func.id}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{func.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm truncate  block max-w-[20rem]">
                        {func.description || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {func.updated_at 
                          ? new Date(func.updated_at).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '-'
                        }
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* BOTÃO EDITAR: Navega para a página de edição */}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => navigate(`/functions/${func.id}`)}
                          className="cursor-pointer hover:bg-neutral-300"
                          disabled={isViewer}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {/* BOTÃO EXCLUIR: Abre o Alert Dialog */}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setFunctionToDelete(func)} 
                          className="cursor-pointer hover:bg-red-300"
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
                    Nenhuma função encontrada com o nome "{searchTerm}".
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Paginação */}
          <div className="flex items-center justify-end gap-1 mt-3">
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isViewer}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || isViewer}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ALERT DIALOG DE DELEÇÃO */}
      <AlertDialog open={!!functionToDelete} onOpenChange={(open) => !open && setFunctionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a função <span className="font-bold text-foreground">"{functionToDelete?.name}"</span>? 
              <br/>
              Essa ação removerá o código permanentemente e não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault(); // Impede fechar automático
                handleConfirmDelete();
              }}
              className="bg-destructive hover:bg-destructive/90 "
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default FunctionsPage;