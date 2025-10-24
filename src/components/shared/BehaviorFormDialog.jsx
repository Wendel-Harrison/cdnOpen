// BehaviorFormDialog.jsx (Versão Atualizada)

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const INITIAL_STATE = {
  path_pattern: '/*',
  priority: 0,
  origin_id: '',
  viewer_protocol_policy: 'REDIRECT_TO_HTTPS',
  allowed_methods: 'GET_HEAD',
  cache_policy_id: '',
  origin_policy_id: '',
};

export function BehaviorFormDialog({ isOpen, onOpenChange, distributionId, originsList, cachePolicies, originPolicies, onSuccess, behaviorToEdit }) {
  
  const isEditMode = !!behaviorToEdit;
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Efeito para preencher o formulário quando estiver no modo de edição
  useEffect(() => {
    if (isEditMode && behaviorToEdit) {
      setFormData({
        path_pattern: behaviorToEdit.path_pattern,
        priority: behaviorToEdit.priority,
        origin_id: behaviorToEdit.origin_id.toString(), // Select precisa de string
        viewer_protocol_policy: behaviorToEdit.viewer_protocol_policy,
        allowed_methods: behaviorToEdit.allowed_methods,
        cache_policy_id: behaviorToEdit.cache_policy_id.toString(),
        origin_policy_id: behaviorToEdit.origin_policy_id.toString(),
      });
    } else {
      setFormData(INITIAL_STATE); // Garante que o form está limpo para criação
    }
  }, [behaviorToEdit, isEditMode, isOpen]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const url = isEditMode ? `/api/behaviors/${behaviorToEdit.id}` : '/api/behaviors';
    const method = isEditMode ? 'PUT' : 'POST';

    const payload = {
      ...formData,
      distribution_id: parseInt(distributionId),
      priority: parseInt(formData.priority, 10) || 0,
      origin_id: parseInt(formData.origin_id, 10),
      cache_policy_id: parseInt(formData.cache_policy_id, 10),
      origin_policy_id: parseInt(formData.origin_policy_id, 10),
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || `Falha ao ${isEditMode ? 'atualizar' : 'criar'} o behavior.`);
      }
      
      const resultData = await res.json();
      toast.success(`Behavior ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`);
      onSuccess(resultData); // Passa o dado atualizado/criado para o pai
      onOpenChange(false);
    } catch (err) {
      toast.error(`Erro ao ${isEditMode ? 'atualizar' : 'criar'} behavior`, { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectChange = (field, value) => {
     setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (e) => {
     const { name, value } = e.target;
     setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Behavior' : 'Criar Novo Behavior'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Modifique os detalhes deste behavior.' : 'Defina uma regra de roteamento e cache para um padrão de caminho específico.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="path_pattern">Padrão de Caminho*</Label>
              <Input id="path_pattern" name="path_pattern" value={formData.path_pattern} onChange={handleInputChange} placeholder="/images/*" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade*</Label>
              <Input id="priority" name="priority" type="number" value={formData.priority} onChange={handleInputChange} placeholder="0" min="0" required />
            </div>
          </div>
          
          {/* Select para Origin */}
          <div className="space-y-2">
            <Label>Origin*</Label>
            <Select onValueChange={(value) => handleSelectChange('origin_id', value)} value={formData.origin_id}>
              <SelectTrigger><SelectValue placeholder="Selecione um origin..." /></SelectTrigger>
              <SelectContent>
                {originsList.map(origin => (
                  <SelectItem key={origin.id} value={origin.id.toString()}>{origin.origin_id} ({origin.domain_name})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Outros Selects (Protocolo, Métodos) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Política de Protocolo*</Label>
              <Select onValueChange={(value) => handleSelectChange('viewer_protocol_policy', value)} value={formData.viewer_protocol_policy}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="REDIRECT_TO_HTTPS">Redirect HTTP to HTTPS</SelectItem>
                  <SelectItem value="HTTPS_ONLY">HTTPS Only</SelectItem>
                  <SelectItem value="HTTP_AND_HTTPS">HTTP and HTTPS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Métodos Permitidos*</Label>
              <Select onValueChange={(value) => handleSelectChange('allowed_methods', value)} value={formData.allowed_methods}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET_HEAD">GET, HEAD</SelectItem>
                  <SelectItem value="GET_HEAD_OPTIONS">GET, HEAD, OPTIONS</SelectItem>
                  <SelectItem value="ALL">ALL (GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Select para Políticas */}
          <div className="space-y-2">
            <Label>Política de Cache*</Label>
            <Select onValueChange={(value) => handleSelectChange('cache_policy_id', value)} value={formData.cache_policy_id}>
              <SelectTrigger><SelectValue placeholder="Selecione uma política de cache..." /></SelectTrigger>
              <SelectContent>
                {cachePolicies.map(policy => (
                  <SelectItem key={policy.id} value={policy.id.toString()}>{policy.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Política de Origem*</Label>
            <Select onValueChange={(value) => handleSelectChange('origin_policy_id', value)} value={formData.origin_policy_id}>
              <SelectTrigger><SelectValue placeholder="Selecione uma política de origem..." /></SelectTrigger>
              <SelectContent>
                {originPolicies.map(policy => (
                  <SelectItem key={policy.id} value={policy.id.toString()}>{policy.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (isEditMode ? 'Salvando...' : 'Criando...') : (isEditMode ? 'Salvar Alterações' : 'Criar Behavior')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}