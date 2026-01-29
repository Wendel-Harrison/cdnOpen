import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertTriangle, Rocket } from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext'; // Ajuste o import conforme seu contexto

export function DistributionLifecycle({ distribution, onStatusChange }) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth(); // Para pegar o email do usuário logado

  const API_URL = 'http://10.127.254.87:3000'; // Ajuste se usar env vars

  // --- AÇÃO: VALIDAR ---
  const handleValidate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/distributions/${distribution.id}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            user_email: user?.email || 'frontend-user@cdn.com' 
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Falha na validação');

      toast.success("Validação concluída!", { description: `Hash: ${data.data.hash}` });
      
      // Atualiza a lista pai para refletir o novo status
      if (onStatusChange) onStatusChange();

    } catch (error) {
      console.error(error);
      toast.error("Erro ao validar", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // --- AÇÃO: DEPLOY ---
  const handleDeploy = async () => {
    // Pergunta simples por enquanto, depois podemos fazer um Dialog com descrição
    if (!confirm("Tem certeza que deseja enviar para PRODUÇÃO?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/distributions/${distribution.id}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            user_email: user?.email,
            user_name: user?.name,
            description: "Deploy via Frontend Web" // Futuramente pegaremos de um input
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Falha no deploy');

      toast.success("Deploy realizado com sucesso!", { 
        description: `Versão: ${data.version_hash.substring(0, 8)}...` 
      });
      
      if (onStatusChange) onStatusChange();

    } catch (error) {
      console.error(error);
      toast.error("Deploy Bloqueado", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDERIZAÇÃO CONDICIONAL ---
  
  // Status: CHANGED (Precisa Validar)
  if (distribution.status === 'CHANGED') {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-50">
          <AlertTriangle className="w-3 h-3 mr-1" /> Alterado
        </Badge>
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={handleValidate} 
          disabled={isLoading}
          className="h-7 text-xs"
        >
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Validar"}
        </Button>
      </div>
    );
  }

  // Status: VALIDATED (Pronto para Deploy)
  if (distribution.status === 'VALIDATED') {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Validado
        </Badge>
        <Button 
          size="sm" 
          onClick={handleDeploy} 
          disabled={isLoading}
          className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
        >
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : (
            <>
              <Rocket className="w-3 h-3 mr-1" /> Deploy
            </>
          )}
        </Button>
      </div>
    );
  }

  // Status: DEPLOYED (Tudo certo)
  if (distribution.status === 'DEPLOYED') {
    return (
        <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
          Ativo em Produção
        </Badge>
    );
  }

  // Fallback
  return <Badge variant="secondary">{distribution.status}</Badge>;
}