import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  RefreshCw 
} from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';

export function FloatingDeployer() {
  const location = useLocation();
  const { user } = useAuth();
  
  const [distId, setDistId] = useState(null);
  const [status, setStatus] = useState(null); // 'CHANGED', 'VALIDATED', 'DEPLOYED'
  const [lastHash, setLastHash] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const API_URL = 'http://10.127.254.87:3000'; // Ajuste conforme seu env

  // 1. Detectar ID na URL
  useEffect(() => {
    // Regex procura por /distributions/NUMERO
    const match = location.pathname.match(/\/distributions\/(\d+)/);
    if (match && match[1]) {
        console.log("ID Detectado:", match[1]);
      setDistId(match[1]);
      fetchStatus(match[1]);
    } else {
      setDistId(null);
      setStatus(null);
    }
  }, [location.pathname]);

  // 2. Buscar Status atual no Backend
  const fetchStatus = async (id) => {
    try {
      const res = await fetch(`${API_URL}/distributions/${id}/status`);
      const data = await res.json();
      setStatus(data.status); // Ex: CHANGED, VALIDATED
      // Se tiver hash salvo no retorno do status, setar aqui
    } catch (error) {
      console.error("Erro ao buscar status", error);
    }
  };

  // 3. Ação: VALIDAR
  const handleValidate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/distributions/${distId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: user?.email })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success("Configuração Validada!", { description: "Pronto para Deploy." });
      setStatus('VALIDATED');
      setLastHash(data.data.hash);
    } catch (error) {
      toast.error("Erro na validação", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  // 4. Ação: DEPLOY
  const handleDeploy = async () => {
    if (!confirm("Confirmar envio para Produção?")) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/distributions/${distId}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_email: user?.email,
          user_name: user?.name,
          description: "Deploy via Floating Action Button"
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success("🚀 Deploy Iniciado!", { description: `Versão: ${data.version_hash?.substring(0,8)}` });
      setStatus('DEPLOYED');
    } catch (error) {
      toast.error("Deploy Falhou", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Se não estiver dentro de uma distribuição, não mostra nada
  if (!distId) return null;

  // Renderização do Widget
  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Botão Principal */}
      <div className={`
        flex items-center p-1.5 rounded-full shadow-2xl border transition-all duration-300
        ${status === 'CHANGED' ? 'bg-yellow-50 border-yellow-200' : ''}
        ${status === 'VALIDATED' ? 'bg-blue-50 border-blue-200' : ''}
        ${status === 'DEPLOYED' ? 'bg-green-50 border-green-200' : ''}
        ${status === 'deployed' ? 'bg-green-50 border-green-200' : ''} 
      `}>
        
        {/* Ícone de Status (Sempre visível) */}
        <div className="flex items-center px-3 gap-2 font-semibold">
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            ) : status === 'CHANGED' ? (
                <>
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="text-yellow-700">Alterado</span>
                </>
            ) : status === 'VALIDATED' ? (
                <>
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-700">Validado</span>
                </>
            ) : (
                <>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-green-700">Online</span>
                </>
            )}
        </div>

        {/* Botões de Ação (Aparecem baseados no status) */}
        <div className="flex gap-1 ml-2">
            
            {/* Botão VALIDAR (Só aparece se mudou) */}
            {status === 'CHANGED' && (
                <Button 
                    size="sm" 
                    onClick={handleValidate} 
                    disabled={loading}
                    className="rounded-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold shadow-sm"
                >
                    Validar
                </Button>
            )}

            {/* Botão DEPLOY (Só aparece se validou) */}
            {status === 'VALIDATED' && (
                <Button 
                    size="sm" 
                    onClick={handleDeploy} 
                    disabled={loading}
                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200"
                >
                    <Rocket className="w-4 h-4 mr-2" />
                    Deploy
                </Button>
            )}

            {/* Botão REFRESH (Pequeno, útil para forçar check) */}
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full text-gray-400 hover:text-gray-700"
                onClick={() => fetchStatus(distId)}
                title="Atualizar Status"
            >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
        </div>
      </div>
      
      {/* Texto auxiliar (ID da Dist) */}
      <span className="text-[10px] text-gray-400 font-mono bg-white/80 px-2 py-0.5 rounded shadow backdrop-blur-sm mr-2">
        Dist ID: {distId}
      </span>
    </div>
  );
}