import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Server, Route, Settings2 } from 'lucide-react';
import { toast } from "sonner";

import OriginsTab from '@/components/shared/distributionsDetails/OriginsTab';
import SettingsTab from '@/components/shared/distributionsDetails/SettingsTab';
import BehaviorsTab from '@/components/shared/distributionsDetails/BehaviorsTab';
import DistributionHeader from '@/components/shared/distributionsDetails/DistributionHeader';

const API_URL = '/api';

function DistributionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/distributions/${id}/preview`);
        if (!response.ok) throw new Error("Distribuição não encontrada");
        
        const snapshot = await response.json();
        setData(snapshot);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar detalhes");
        navigate('/distributions'); 
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/50 dark:bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col h-svh bg-gray-50/50 dark:bg-background overflow-hidden">
      
      <DistributionHeader metadata={data.metadata} onBack={() => navigate('/distributions')} />

      <div className="flex-1 overflow-auto p-5 md:p-5">
        <div className="px-24 mx-auto">
          
          <Tabs defaultValue="settings" className="w-full space-y-5 mt-5">
            <TabsList className="bg-transparent inline-flex h-12 items-center gap-3">
              <TabsTrigger value="settings" className="rounded px-6 data-[state=active]:bg-white data-[state=active]:border-t-0 data-[state=active]:border-neutral-300 data-[state=active]:text-black data-[state=active]:shadow-md flex gap-2.5 items-center text-sm font-medium">
                <Settings2 className="w-3 h-3" /> Configurações Gerais
              </TabsTrigger>
              <TabsTrigger value="origins" className="rounded px-6 data-[state=active]:bg-white data-[state=active]:border-t-0 data-[state=active]:border-neutral-300 data-[state=active]:text-black data-[state=active]:shadow-md flex gap-2.5 items-center text-sm font-medium">
                <Server className="w-3 h-3" /> Origens
              </TabsTrigger>
              <TabsTrigger value="behaviors" className="rounded px-6 data-[state=active]:bg-white data-[state=active]:border-t-0 data-[state=active]:border-neutral-300 data-[state=active]:text-black data-[state=active]:shadow-md flex gap-2.5 items-center text-sm font-medium">
                <Route className="w-3 h-3" /> Behaviors (Rotas)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <SettingsTab metadata={data.metadata} overview={data.overview} />
            </TabsContent>

            <TabsContent value="origins" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <OriginsTab origins={data.config?.origins} distributionId={id} distributionName={data.metadata?.name} />
            </TabsContent>

            <TabsContent value="behaviors" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <BehaviorsTab initialBehaviors={data.config?.behaviors} distributionId={id} />
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default DistributionDetailsPage;