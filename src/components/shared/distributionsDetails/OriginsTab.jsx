import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; 
import { Server, Plus } from 'lucide-react';
import { InfoField } from "../InfoField";

function OriginsTab({ origins, distributionId, distributionName }) {
  const navigate = useNavigate();

  const handleCreateNew = () => {
    navigate('/config', {
      state: { 
        activeTab: 'origins', 
        targetDistributionId: distributionId?.toString(),
        targetDistributionName: distributionName 
      }
    });
  };

  if (!origins || origins.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-card rounded-2xl shadow border dark:border-border">
        <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-sm mb-6">Nenhuma origem cadastrada nesta distribuição.</p>
        
        {/* <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Criar Novo Origin
        </Button> */}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleCreateNew} className="bg-blue-600 rounded hover:bg-blue-700 text-white cursor-pointer shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Novo Origin
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {origins.map((origin) => (
          <Card key={origin.id} className="shadow-md border-none rounded bg-white dark:bg-card p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between gap-4 border-b dark:border-border pb-5 mb-1">
              <div className="flex items-center gap-3">
                <Server className="w-4 h-4 text-blue-600" />
                <h4 className="tex font-semibold text-foreground">{origin.origin_name}</h4>
              </div>
              <Badge variant="outline" className="font-mono text-[8px] rounded">ID: {origin.id}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-5 text-sm">
              <InfoField label="Endereço" value={origin.origin_domain} isMono isTruncate />
              <InfoField label="Protocolo Base" value={origin.protocol} />
              <InfoField label="Porta de Comunicação" value={origin.port} />
              <InfoField label="Última atualização" value={origin.last_updated_at || '--/--/----'} />
            </div>

            {origin.headers && (
              <div className="pt-5 border-t dark:border-border">
                <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Custom Headers</h5>
                <div className="space-y-3">
                  {Array.isArray(origin.headers) ? (
                    origin.headers.map((header, index) => (
                      <div key={index} className="flex flex-col gap-1">
                        <span className="text-[11px] font-medium text-muted-foreground leading-none">{header.header_name}</span>
                        <div className="bg-slate-50 dark:bg-gray-950/30 px-3 py-2 rounded-md font-mono text-xs text-foreground border dark:border-border/50 break-all">
                          {typeof header.value === 'object' ? JSON.stringify(header.value) : String(header.header_value)}
                        </div>
                      </div>
                    ))
                  ) : (
                    Object.entries(origin.headers).map(([key, value]) => (
                      <div key={key} className="flex flex-col gap-1">
                        <span className="text-[10px] font-medium text-muted-foreground leading-none">{key}</span>
                        <div className="bg-slate-50 dark:bg-slate-900/50 px-3 py-2 rounded-md font-mono text-xs text-foreground border dark:border-border/50 break-all">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default OriginsTab;