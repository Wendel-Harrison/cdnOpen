// src/components/shared/EditDistributionDialog.jsx

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '../ui/textarea';

function EditDistributionDialog({ isOpen, onOpenChange, distribution, onSave }) {
  // Estado interno para gerenciar os dados do formulário
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    domain_name: '',
    status: 'deployed',
  });

  // useEffect para preencher o formulário quando o diálogo abre ou a 'distribution' muda
  useEffect(() => {
    if (distribution) {
      setFormData({
        name: distribution.name || '',
        description: distribution.description || '',
        domain_name: distribution.domain_name || '',
        status: distribution.status || 'deployed',
      });
    }
  }, [distribution]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleSaveChanges = () => {
    onSave({ ...distribution, ...formData });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent >
        <DialogHeader>
          <DialogTitle>Editar Distribuição</DialogTitle>
          <DialogDescription>
            Faça as alterações na sua distribuição aqui. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Descrição
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="domain_name" className="text-right">
              Domínio
            </Label>
            <Input
              id="domain_name"
              name="domain_name"
              value={formData.domain_name}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deployed">Deployed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSaveChanges}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditDistributionDialog;