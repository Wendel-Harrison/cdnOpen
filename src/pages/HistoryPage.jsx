import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Activity, User, Server, FileCode, Trash2, Edit, Plus, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ShieldCheck } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

function HistoryPage() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('ALL');

  const fetchLogs = useCallback(async (group) => {
    setIsLoading(true);
    try {
        const url = group === 'ALL' ? '/api/audit' : `/api/audit?resource=${group}`;
        
        const res = await fetch(url);
        const data = await res.json();
        setLogs(data);
    } catch (err) {
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(selectedGroup);
  }, [selectedGroup, fetchLogs]);

  const getActionStyle = (action) => {
    switch (action) {
      case 'CREATE': return { icon: Plus, color: 'bg-green-100 text-green-700', label: 'Criou' };
      case 'UPDATE': return { icon: Edit, color: 'bg-blue-100 text-blue-700', label: 'Editou' };
      case 'DELETE': return { icon: Trash2, color: 'bg-red-100 text-red-700', label: 'Removeu' };
      case 'LOGIN': return { icon: User, color: 'bg-purple-100 text-purple-700', label: 'Acesso' };
      default: return { icon: Activity, color: 'bg-gray-100 text-gray-700', label: action };
    }
  };

  const getResourceIcon = (resource) => {
    switch (resource) {
        case 'Users': return <User className="h-3 w-3" />;
        case 'Functions': return <FileCode className="h-3 w-3" />;
        case 'Distributions': return <Server className="h-3 w-3" />;
        default: return <Activity className="h-3 w-3" />;
    }
  }

  if (isLoading) return <div className="p-10 text-center">Carregando histórico...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Histórico de Auditoria</h2>
        <p className="text-muted-foreground">Timeline de todas as alterações realizadas no sistema.</p>
      </div>

      <Tabs defaultValue="ALL" value={selectedGroup} onValueChange={setSelectedGroup} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="ALL">Todos</TabsTrigger>
          <TabsTrigger value="Users" className="flex gap-2 items-center">
            <User className="w-4 h-4" /> Usuários
          </TabsTrigger>
          <TabsTrigger value="Distributions" className="flex gap-2 items-center">
             <Server className="w-4 h-4" /> Distribuições
          </TabsTrigger>
          <TabsTrigger value="Functions" className="flex gap-2 items-center">
             <FileCode className="w-4 h-4" /> Functions
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
         <CardTitle>
            {selectedGroup === 'ALL' ? 'Atividades Recentes' : `Histórico de ${selectedGroup}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="p-10 text-center text-muted-foreground">Carregando histórico...</div>
          ) : logs.length === 0 ? (
             <div className="p-10 text-center text-muted-foreground">Nenhum registro encontrado para este grupo.</div>
          ) : (
            <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-8 pt-2">
            
            {logs.map((log) => {
              const style = getActionStyle(log.action);
              const Icon = style.icon;

              return (
                <div key={log.id} className="mb-10 ml-6 relative">
                  {/* Bolinha da Timeline */}
                  <span className={`absolute -left-[37px] flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white dark:ring-gray-900 ${style.color}`}>
                    <Icon className="h-4 w-4" />
                  </span>

                  {/* Conteúdo do Log */}
                  <div className="flex flex-col bg-muted/30 p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{log.user_email}</span>
                        <span className="text-muted-foreground text-xs">•</span>
                        <span className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1 text-[10px]">
                         {getResourceIcon(log.resource)}
                         {log.resource}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className={`font-medium ${style.color.split(' ')[1]}`}>
                        {style.label}
                      </span>
                      {" "}: {log.details}
                    </p>
                    
                    {log.ip_address && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> IP: {log.ip_address}
                        </p>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default HistoryPage;