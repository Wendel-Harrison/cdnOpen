import { useState, useEffect  } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Trash2, Edit} from 'lucide-react'

import { toast } from "sonner"

function DistributionsPage() {

  const API_URL = '/api/distributions'
  const [distributions, setDistributions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [newDistributionName, setNewDistributionName] = useState('')

  useEffect(() => {
    const fetchDistributions = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(API_URL)
        if (!response.ok) {
          throw new Error('Falha ao buscar os dados da API')
        }
        const data = await response.json()
        setDistributions(data)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDistributions()
  }, [])

  // 4. Funções para adicionar e deletar que agora chamam a API
  const addDistribution = async () => {
    if (!newDistributionName) {
      toast.warning("O nome da distribuição não pode ser vazio.");
      return;
    }

    try {
      // Aqui você precisaria montar o objeto completo, incluindo o domain_name
      // Este é um exemplo simplificado
      const newDist = { name: newDistributionName, status: 'deployed' };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDist),
      });

      if (!response.ok) {
        toast.warning("Falha ao criar a distribuição")
      }

      const addedDistribution = await response.json();
      setDistributions([...distributions, addedDistribution]); // Adiciona a nova distribuição retornada pela API
      setNewDistributionName('');
    } catch (err) {      
      console.error(err);
    }
    toast.success("Criado com sucesso.");
  };

  const deleteDistribution = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        toast.error('Falha ao deletar distribuição');
      }

      setDistributions(distributions.filter(d => d.id !== id));
    } catch (err) {
    //   console.error(err);
    }
  };

  // 5. Renderização condicional para os estados de carregamento e erro
  if (isLoading) {
    return <div className="text-center p-10">Carregando distribuições...</div>
  }

  if (error) {
    return <div className="text-center p-10 text-destructive">Erro: {error}</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Nova Distribuição</CardTitle>
          <CardDescription>Crie uma nova distribuição para servir seu conteúdo</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="dist-name" className='mb-1'>Nome da Distribuição</Label>
            <div className="flex items-center justify-center gap-5">
              <div className="w-4/5">
                <Input
                  id="dist-name"
                  placeholder="STB"
                  value={newDistributionName}
                  onChange={(e) => setNewDistributionName(e.target.value)}
                />
              </div>
              <div className="w-1/5">
                <Button variant="secondary" onClick={
                  addDistribution
                  } className="w-full">
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribuições Criadas</CardTitle>
          <CardDescription>Lista de todas as distribuições gerenciadas pela CDN</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Domínio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {distributions.map((dist) => (
                <TableRow key={dist.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">
                    <Badge variant="secundary" className="px-3">
                      {dist.id}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secundary" className="px-3">
                      {dist.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {/* Verifica se o array de origins existe e não está vazio */}
                    {dist.origins && dist.origins.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="truncate" title={dist.origins[0].domain_name}>
                          {dist.origins[0].domain_name}
                        </Badge>
                        
                        {/* 2. Se houver mais de um, mostra a tag com a contagem dos restantes */}
                        {dist.origins.length > 1 && (
                          <Badge variant="secondary">
                            +{dist.origins.length - 1}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      // Caso não haja nenhum origin, mostra a mensagem padrão
                      <span className="text-muted-foreground text-xs">Nenhum origin</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={dist.status === 'deployed' ? 'default' : 'secondary'}>
                      {dist.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteDistribution(dist.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default DistributionsPage;