import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const API_URL = '/api/policies';

// Novo componente para o Dialog de criação de política
function CreatePolicyDialog({ isOpen, onOpenChange, onPolicyCreated }) {
  const initialState = {
    name: '',
    description: '',
    min_ttl: 0,
    default_ttl: 3600,
    max_ttl: 86400,
    forward_query_strings: false,
    forward_cookies: false,
    forwarded_headers: '', // Usaremos um Textarea com valores separados por vírgula
  };
  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = async () => {
    try {
      // Converte a string de headers em um array, limpando espaços e itens vazios
      const headersArray = formData.forwarded_headers
        .split(',')
        .map(h => h.trim())
        .filter(h => h);

      const payload = { ...formData, forwarded_headers: headersArray };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar a política');
      }

      const newPolicy = await response.json();
      onPolicyCreated(newPolicy); // Informa o componente pai sobre a nova política
      toast.success('Política de cache criada com sucesso!');
      setFormData(initialState); // Limpa o formulário
      onOpenChange(false); // Fecha o dialog

    } catch (err) {
      toast.error('Erro ao criar política', { description: err.message });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Política de Cache</DialogTitle>
          <DialogDescription>
            Defina as regras de cache que podem ser reutilizadas em seus behaviors.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nome</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Descrição</Label>
            <Input id="description" name="description" value={formData.description} onChange={handleChange} className="col-span-3" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="min_ttl">Min TTL (s)</Label>
              <Input id="min_ttl" name="min_ttl" type="number" value={formData.min_ttl} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="default_ttl">Default TTL (s)</Label>
              <Input id="default_ttl" name="default_ttl" type="number" value={formData.default_ttl} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="max_ttl">Max TTL (s)</Label>
              <Input id="max_ttl" name="max_ttl" type="number" value={formData.max_ttl} onChange={handleChange} />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <Label variant='primary' htmlFor="forward_query_strings">Encaminhar Query Strings</Label>
              <Switch variant='primary' id="forward_query_strings airplane-mode" checked={formData.forward_query_strings} onCheckedChange={(checked) => handleSwitchChange('forward_query_strings', checked)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <Label htmlFor="forward_cookies">Encaminhar Cookies</Label>
              <Switch variant="outline" id="forward_cookies" checked={formData.forward_cookies} onCheckedChange={(checked) => handleSwitchChange('forward_cookies', checked)} />
            </div>
          </div>
          
          <div>
            <Label htmlFor="forwarded_headers">Encaminhar Headers Específicos</Label>
            <Textarea 
              id="forwarded_headers" 
              name="forwarded_headers"
              placeholder="Host, Authorization, Content-Type (separados por vírgula)"
              value={formData.forwarded_headers}
              onChange={handleChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="outline" onClick={handleSave}>Criar Política</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreatePolicyDialog;
