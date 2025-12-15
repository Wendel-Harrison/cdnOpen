import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OriginPolicyForm } from './OriginPolicyForm';

// Não precisamos mais das interfaces em JSX

export function EditOriginPolicyDialog({ isOpen, onOpenChange, policy, onSave, currentUserEmail, currentUserName }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({ // Estado inicial com dados da política
    name: policy.name,
    description: policy.description ?? '',
    requestSettings: policy.request_settings,
  });

  useEffect(() => { // Atualiza se a prop mudar
    setFormData({
      name: policy.name,
      description: policy.description ?? '',
      requestSettings: policy.request_settings,
    });
  }, [policy]);

  const handleSubmit = async () => {
     setIsSubmitting(true);
     setError(null);
     try {
       await onSave({ ...policy, ...formData, currentUserEmail, currentUserName });
       onOpenChange(false);
     } catch (e) {
        console.error("Erro ao salvar política:", e);
        setError(e.message || 'Falha ao salvar as alterações.');
     } finally {
        setIsSubmitting(false);
     }
  };

  return (
     <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Política de Origem: {policy.name}</DialogTitle>
          <DialogDescription>
            Modifique as configurações da política de requisição para a origem.
          </DialogDescription>
        </DialogHeader>

        <OriginPolicyForm formData={formData} setFormData={setFormData} />

        {error && <p className="text-sm text-destructive mt-2">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
             {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditOriginPolicyDialog;