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

  const [errors, setErrors] = useState({});

  // useEffect para preencher o formulário quando o diálogo abre ou a 'distribution' muda
  useEffect(() => {
    if (distribution) {
      setFormData({
        name: distribution.name || '',
        description: distribution.description || '',
        domain_name: distribution.domain_name || '',
        status: distribution.status || 'deployed',
      });
      setErrors({});
    }
  }, [distribution]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;

    if (!formData.domain_name) {
    } else if (!domainRegex.test(formData.domain_name)) {
      newErrors.domain_name = "Formato inválido. Use apenas o domínio (ex: site.com) sem http:// ou barras.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = () => {
    if (validateForm()) {
      onSave({ ...distribution, ...formData });
    }
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
            <div className="col-span-3">
              <Input
                type="text" // Mudei de 'email' para 'text' pois domínio não é email
                id="domain_name"
                name="domain_name"
                value={formData.domain_name}
                onChange={handleInputChange}
                className={errors.domain_name ? "border-red-500" : ""}
                placeholder="ex: cdn.meusite.com"
              />
              {errors.domain_name && (
                <span className="text-xs text-red-500 mt-1 block">
                  {errors.domain_name}
                </span>
              )}
            </div>
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
                <span>
                  <SelectValue placeholder="Selecione um status" />
                </span>
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