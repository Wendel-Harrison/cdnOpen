import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- NOVO IMPORT
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // <-- NOVO IMPORT
import { Route, Server, ArrowUp, ArrowDown, Edit, Trash2, Plus } from 'lucide-react'; // <-- NOVO ÍCONE
import { toast } from "sonner";

export function BehaviorsTab({ initialBehaviors, distributionId }) {
  const [behaviors, setBehaviors] = useState([]);
  const navigate = useNavigate(); // <-- INICIALIZA O HOOK

  useEffect(() => {
    if (initialBehaviors) {
      const sorted = [...initialBehaviors].sort((a, b) => a.priority - b.priority);
      setBehaviors(sorted);
    }
  }, [initialBehaviors]);

  // Nova função de navegação
  const handleCreateNew = () => {
    navigate('/config', {
      state: { 
        activeTab: 'behaviors', 
        targetDistributionId: distributionId?.toString() 
      }
    });
  };

  const handleMovePriority = async (index, direction) => {
    const newBehaviors = [...behaviors];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newBehaviors.length) return;

    const previousBehaviors = [...behaviors];
    const currentItem = newBehaviors[index];
    const targetItem = newBehaviors[targetIndex];

    const tempPriority = currentItem.priority;
    currentItem.priority = targetItem.priority;
    targetItem.priority = tempPriority;

    newBehaviors[index] = targetItem;
    newBehaviors[targetIndex] = currentItem;

    setBehaviors(newBehaviors);

    try {
      // DESCOMENTE E AJUSTE A API PARA SALVAR NO BACKEND:
      /*
      const response = await fetch(/api/distributions/${distributionId}/behaviors/reorder, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          behaviors: newBehaviors.map(b => ({ id: b.id, priority: b.priority }))
        }),
      });
      if (!response.ok) throw new Error("Erro da API");
      toast.success("Prioridade atualizada!");
      */
    } catch (error) {
      console.error(error);
      setBehaviors(previousBehaviors);
      toast.error("Erro ao salvar. Revertido.");
    }
  };

  // ESTADO VAZIO (Adicionado o botão aqui também)
  if (!behaviors || behaviors.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-card rounded-2xl shadow border dark:border-border">
        <Route className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-sm mb-6">Nenhum behavior (rota) cadastrado nesta distribuição.</p>
        
        <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Criar Novo Behavior
        </Button>
      </div>
    );
  }

  // ESTADO COM DADOS (Tabela)
  return (
    <div className="space-y-4">
      {/* NOVO CABEÇALHO PARA O BOTÃO */}
      <div className="flex justify-end">
        <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Novo Behavior
        </Button>
      </div>

      <div className="bg-white dark:bg-card rounded shadow-md border dark:border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-neutral-950/80 text-muted-foreground dark:text-white border-b dark:border-border">
              <tr>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Prioridade</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Path Pattern</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Origin Atribuído</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Política de Origem</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Política de Cache</th>
                <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {behaviors.map((behavior, index) => (
                  <tr key={behavior.id} className="border-b last:border-0 border-slate-100 dark:border-border/50 hover:bg-slate-50 dark:hover:bg-neutral-950/30 transition-colors duration-300">
                    <td className="px-6 font-mono font-medium text-foreground">{behavior.priority}</td>
                    <td className="px-6 py-2">
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded text-xs text-foreground font-bold">{behavior.location}</span>
                    </td>
                    <td className="px-6 py-2">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 rounded dark:bg-blue-950 dark:text-blue-300 flex w-max gap-1.5 items-center">
                        <Server className="w-3.5 h-3.5" />
                        {behavior.origin_name || `ID ${behavior.origin_id}`}
                      </Badge>
                    </td>
                    <td className="px-6 py-2 text-muted-foreground">{behavior.origin_policy?.name || <span className="italic">Nenhuma</span>}</td>
                    <td className="px-6 py-2 text-muted-foreground">{behavior.cache_policy?.name || <span className="italic">Nenhuma</span>}</td>
                    <td className="px-6 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <div className="flex flex-col mr-2 border-r dark:border-border pr-2">
                          <button onClick={() => handleMovePriority(index, 'up')} disabled={index === 0} className="p-1 text-slate-400 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleMovePriority(index, 'down')} disabled={index === behaviors.length - 1} className="p-1 text-slate-400 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button className="p-2 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                        <button className="p-2 text-destructive hover:bg-red-300 dark:hover:bg-red-500/70 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BehaviorsTab;