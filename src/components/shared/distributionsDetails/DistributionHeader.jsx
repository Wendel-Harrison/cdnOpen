import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Globe } from 'lucide-react';

function DistributionHeader({ metadata, onBack }) {
  return (
    <header className="bg-white dark:bg-card border-b dark:border-border px-8 py-6 z-10 shadow-sm">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="!text-2xl font-bold tracking-wider text-foreground">
                {metadata?.name}
              </h1>
              <Badge variant="secondary" className="font-mono text-[10px] rounded-full px-3 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                ID: {metadata?.id}
              </Badge>
            </div>
            <div className="flex items-center gap-2 tracking-wide text-sm text-blue-600 dark:text-blue-400 mt-1.5 font-medium">
              <Globe className="w-4 h-4" />
              <span>{metadata?.domain_name}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" size="sm" className="rounded-full shadow-sm">Ações</Button>
        </div>
      </div>
    </header>
  );
}

export default DistributionHeader