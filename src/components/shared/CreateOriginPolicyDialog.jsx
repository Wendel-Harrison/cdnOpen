import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OriginPolicyForm } from './OriginPolicyForm';
import { useAuth } from '@/context/AuthContext';


async function handleApiError(response) {
  let errorMessage = `Erro HTTP: ${response.status} ${response.statusText}`;
  
  // Tenta extrair uma mensagem mais específica do corpo da resposta
  try {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorMessage;
    } catch (jsonError) {
      
      console.error("API retornou um erro não-JSON:", errorText);
    }
  } catch (textError) {
    console.error("Não foi possível ler a resposta de erro da API.", textError);
  }
  
  return new Error(errorMessage);
}

const API_URL = '/api/origin-policies';

export function CreateOriginPolicyDialog({ isOpen, onOpenChange, onPolicyCreated}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    requestSettings: {
      headers: { behavior: 'none', whitelist: [] },
      cookies: { behavior: 'none', whitelist: [] },
      queryStrings: { behavior: 'all', whitelist: [] },
    }
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      console.log('Dados enviados para a API:', JSON.stringify(formData, null, 2));
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          currentUserEmail: user.email,
          currentUserName: user.name  
        
        }),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      const newPolicy = await response.json();
      onPolicyCreated(newPolicy);
      onOpenChange(false);
      // Reseta o formulário
      setFormData({
        name: '', description: '', 
        requestSettings: {
          headers: { behavior: 'none', whitelist: [] },
          cookies: { behavior: 'none', whitelist: [] },
          queryStrings: { behavior: 'all', whitelist: [] },
        }});

    } catch (e) {
      console.error("Erro ao criar política:", e);
      // Exibe uma mensagem mais amigável para o usuário
      setError(e.message || 'Falha ao criar a política. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Política de Origem</DialogTitle>
          <DialogDescription>
            Defina como os cabeçalhos, cookies e query strings devem ser tratados ao buscar conteúdo na origem.
          </DialogDescription>
        </DialogHeader>

        <OriginPolicyForm formData={formData} setFormData={setFormData} />

        {error && <p className="text-sm text-destructive mt-2">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Criando...' : 'Criar Política'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateOriginPolicyDialog;