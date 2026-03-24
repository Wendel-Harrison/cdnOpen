import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TrendingUp, Package, Activity, Server, Zap, ExternalLink } from "lucide-react";
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const GRAFANA_BASE = "http://10.127.226.224:3000";
  const GRAFANA_FULL_DASHBOARD_URL = `${GRAFANA_BASE}/d/hzhXdzznZn/etcd-cluster-overview-1?orgId=1;`
  return (
    <div className="space-y-6">
    
      <div className="grid gap-6 md:grid-cols-3">
         <Card className="hover:shadow-lg transition-all duration-300 bg-white border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">Monitoramento Completo</CardTitle>
            <ExternalLink className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Acesse a interface nativa do Grafana para explorar métricas detalhadas, criar alertas e gerenciar painéis.
            </p>
            <a 
              href={GRAFANA_FULL_DASHBOARD_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block w-full"
            >
            <Button className="w-[50%] cursor-pointer hover:bg-gray-700 bg-blue-900 text-white transition-all duration-300 gap-2 shadow-sm">
                Abrir Grafana Real
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Hit (Cache)</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.5% (off)</div>
            <p className="text-xs text-green-600 font-medium">
              +2.5% desde ontem
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tráfego Total (24h)</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14.2 TB (off)</div>
            <p className="text-xs text-muted-foreground">
              Pico de 1.2 Gbps
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ==========================================
          GRÁFICOS PRINCIPAIS (Largura Total)
          ========================================== */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <div>
              <CardTitle>Tráfego de clientes In/Out</CardTitle>
              <CardDescription>Visão geral de consumo</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Gráfico 1 */}
            <div className="h-[280px] w-full rounded-lg overflow-hidden border border-gray-100">
              <iframe 
                src={`${GRAFANA_BASE}/d-solo/d7a32842-98cb-4cdb-ba55-c6fb95378f2d/etcd-cluster-overview?orgId=1&refresh=1m&from=now-48h&to=now&panelId=22&theme=light`}
                width="100%" 
                height="100%" 
                frameBorder="0"
                style={{ display: 'block' }}
              ></iframe>
            </div>

            {/* Gráfico 2 */}
            <div className="h-[280px] w-full rounded-lg overflow-hidden border border-gray-100">
              <iframe 
                src={`${GRAFANA_BASE}/d-solo/d7a32842-98cb-4cdb-ba55-c6fb95378f2d/etcd-cluster-overview?orgId=1&refresh=1m&from=now-48h&to=now&panelId=21&theme=light`}
                width="100%" 
                height="100%" 
                frameBorder="0"
                style={{ display: 'block' }}
              ></iframe>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-gray-500" />
     x'       <div>
              <CardTitle>Monitoração ETCD</CardTitle>
              <CardDescription>Utilização dos recursos oferecidos pelo ETCD</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Gráfico 3 */}
            <div className="h-[220px] w-full rounded-lg overflow-hidden bg-gray-50">
              <iframe 
                src={`${GRAFANA_BASE}/d-solo/hzhXdzznZn/etcd-cluster-overview-1?orgId=1&refresh=1m&from=now-48h&to=now&panelId=29&theme=light`}
                width="100%" 
                height="100%" 
                frameBorder="0"
              ></iframe>
            </div>

            {/* Gráfico 4 */}
            <div className="h-[220px] w-full rounded-lg overflow-hidden bg-gray-50">
              <iframe 
                src={`${GRAFANA_BASE}/d-solo/hzhXdzznZn/etcd-cluster-overview-1?orgId=1&refresh=1m&from=now-48h&to=now&panelId=23&theme=light`}
                width="100%" 
                height="100%" 
                frameBorder="0"
              ></iframe>
            </div>

            {/* Gráfico 5 */}
            <div className="h-[220px] w-full rounded-lg overflow-hidden bg-gray-50">
              <iframe 
                src={`${GRAFANA_BASE}/d-solo/hzhXdzznZn/etcd-cluster-overview-1?orgId=1&refresh=1m&from=now-48h&to=now&panelId=8&theme=light`}
                width="100%" 
                height="100%" 
                frameBorder="0"
              ></iframe>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}