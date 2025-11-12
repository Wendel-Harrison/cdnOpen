// components/shared/EditUserDialog.jsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Copy, RefreshCw } from 'lucide-react';

export function EditUserDialog({ isOpen, onOpenChange, user, onSave }) {
  const [formData, setFormData] = useState({ name: '', email: '', role: '', status: '' });
  const [newPassword, setNewPassword] = useState(''); // Estado para a senha gerada
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preenche o formulário quando o diálogo abre
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      });
      setNewPassword(''); // Limpa a senha gerada anteriormente
    }
  }, [user, isOpen]); // Roda sempre que o 'user' ou 'isOpen' mudar

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Função para gerar senha aleatória
  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
    let pass = '';
    for (let i = 0; i < 14; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
    toast.info("Nova senha gerada. Clique em 'Salvar' para aplicá-la.");
  };

  // Função para copiar a senha
  const copyToClipboard = () => {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword);
    toast.success("Senha copiada para a área de transferência!");
  };

  // Função para salvar
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Prepara o payload para a API
      const payload = { ...formData };
      if (newPassword) {
        payload.password = newPassword; // Adiciona a nova senha ao payload se ela foi gerada
      }
      
      await onSave(payload); // Chama a função de salvar do componente pai
      onOpenChange(false); // Fecha o diálogo
    } catch (err) {
      // O onSave já deve lidar com o toast de erro
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Editar Usuário: {user?.name}</DialogTitle>
          <DialogDescription>
            Modifique os dados do usuário. O reset de senha é opcional.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nome</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">Função</Label>
            <Select value={formData.role} onValueChange={(value) => handleSelectChange('role', value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione a função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Visualizador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <hr className="my-2" />
          
          <div className="space-y-2">
             <Label>Resetar Senha</Label>
             <div className="flex gap-2">
                <Button variant="outline" onClick={generatePassword} className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Gerar Nova Senha
                </Button>
             </div>
             {newPassword && (
                <div className="flex gap-2 mt-2">
                    <Input id="new-password" value={newPassword} readOnly className="flex-1 bg-muted text-muted-foreground" />
                    <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
             )}
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}