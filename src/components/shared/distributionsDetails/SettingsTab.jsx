import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Zap, Route, Activity, GitBranch, Hash, Settings2, TextQuote } from 'lucide-react';
import { InfoField } from "../InfoField";
import { Link } from "react-router-dom";

 function SettingsTab({ metadata, overview }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-2 space-y-8">
        <Card className="shadow-lg border-none rounded bg-white dark:bg-card p-8">
          <div className="flex items-center gap-4 border-b dark:border-border pb-6 mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-xl text-blue-600 dark:text-blue-400">
                  <Globe className="w-5 h-5" />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-foreground">Identificação e Domínio</h3>
                  <p className="text-xs text-muted-foreground">Dados fundamentais de acesso e nomeclatura.</p>
              </div>
          </div>
          <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
            <InfoField label="Nome da Distribuição" value={metadata?.name} icon={TextQuote} />
            <InfoField label="Domínio CNAME Principal" value={metadata?.domain_name} icon={Globe} />
            <div className="md:col-span-2">
              <InfoField label="Descrição do Ambiente" value={metadata?.description || '----'} icon={TextQuote} />
            </div>
          </CardContent>
        </Card>

        {/* MINI CARDS DE KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <Card className="shadow-md border-none rounded bg-white dark:bg-card p-6 flex flex-row items-center gap-5 hover:shadow-lg transition-shadow">
              <Zap className="w-10 h-10 text-amber-500 bg-amber-50 dark:bg-amber-950 p-2.5 rounded-xl" />
              <div>
                  <p className="text-2xl font-bold tracking-wide text-foreground">{overview?.origins_count || 0}</p>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mt-1">Origens Cadastradas</p>
              </div>
          </Card>
          <Card className="shadow-md border-none rounded bg-white dark:bg-card p-6 flex flex-row items-center gap-5 hover:shadow-lg transition-shadow">
              <Route className="w-10 h-10 text-emerald-500 bg-emerald-50 dark:bg-emerald-950 p-2.5 rounded-xl" />
              <div>
                  <p className="text-2xl font-bold tracking-wide text-foreground">{overview?.behaviors_count || 0}</p>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mt-1">Behaviors (Rotas)</p>
              </div>
          </Card>
        </div>
      </div>

      {/* COLUNA DIREITA */}
      <Card className="shadow-lg border-none rounded bg-white dark:bg-card p-8 border-l-4 border-l-slate-700">
         <div className="flex items-center gap-4 border-b dark:border-border pb-3 mb-2">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300">
                  <Activity className="w-5 h-5" />
              </div>
              <div>
                  <h3 className="text-xl font-bold text-foreground">Saúde e Histórico</h3>
                  <p className="text-sm text-muted-foreground">Estado atual no ambiente e histórico.</p>
              </div>
         </div>
        <CardContent className="p-0 space-y-9 relative">
          <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800 z-0" />

          <div className="flex items-start gap-5 relative z-10">
            <Zap className={`w-7 h-7 p-1 rounded-full mt-1 ${overview?.prod_status === 'ATIVA' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-yellow-600 text-white shadow-lg shadow-amber-200 dark:shadow-yellow-700'}`} />
            <div>
              <InfoField label="Ambiente de Produção (Live)" value=" " />
              <Badge variant="outline" className={`text-[8px] font-bold px-2.5 py-0.5 rounded ${overview?.prod_status === 'ATIVA' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {overview?.prod_status}
              </Badge>
            </div>
          </div>

          <div className="flex items-start gap-5 relative z-10">
            <Settings2 className="w-7 h-7 p-1 rounded-full mt-1 bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-700" />
            <div>
              <InfoField label="Ambiente de Staging (Pré-Prod)" value=" " />
              <Badge variant="outline" className={` text-[8px] font-bold px-2.5 py-0.5 rounded ${overview?.staging_status === 'VALIDADA' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                  {overview?.staging_status}
                </Badge>
            </div>
          </div>

          <Link 
              to={`/distributions/${metadata?.id}/versions`} 
              className="flex items-start gap-5 relative z-10 p-3 -ml-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
              <GitBranch className="w-7 h-7 p-1 rounded-full mt-1 bg-slate-700 text-white shadow-lg shadow-slate-300 dark:shadow-gray-700 group-hover:scale-110 group-hover:bg-blue-600 transition-all" />
              <div className="w-full">
                <InfoField label="Versão Ativa / Total" value=" " />
                <div className="flex items-baseline gap-1 mt-1.5">
                    <span className="text-2xl font-extrabold tracking-tighter text-foreground group-hover:text-blue-600 transition-colors">
                      v{overview?.current_version}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground ml-2"> 
                      de {overview?.total_versions} releases
                    </span>
                </div>
                <span className="text-[10px] text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  Ver histórico &rarr;
                </span>
              </div>
          </Link>

          <div className="flex flex-col items-start relative pt-4 border-t dark:border-border">
              <InfoField icon={Hash} label="SHA-256 da Versão Atual" value=' ' isTruncate />
              <p className="text-[10px] ml-4 text-muted-foreground">{overview?.current_hash}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsTab;