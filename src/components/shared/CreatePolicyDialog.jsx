import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const API_URL = '/api/cache-policies';

function CreatePolicyDialog({ isOpen, onOpenChange, onPolicyCreated, currentUserEmail, currentUserName }) {
  const initialState = {
    name: '',
    description: '',
    min_ttl: 0,
    default_ttl: 3600,
    max_ttl: 86400,
    forward_query_strings: false,
    forward_cookies: false,
    forwarded_headers: '',  
  };
  const [formData, setFormData] = useState(initialState);
  const [isSaving, setIsSaving] = useState(false); // Estado de loading

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'number' ? parseInt(value, 10) : value;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : val }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = async () => {
    if (!formData.name) {
        toast.warning("O nome da política é obrigatório.");
        return;
    }

    setIsSaving(true);
    try {
      const headersString = formData.forwarded_headers || '';
      const headersArray = headersString
        .split(',')
        .map(h => h.trim())
        .filter(h => h.length > 0);

      const payload = { 
          ...formData, 
          forwarded_headers: headersArray, 
          currentUserEmail, 
          currentUserName 
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falha ao criar a política');
      }

      const newPolicy = await response.json();
      onPolicyCreated(newPolicy);
      toast.success('Política de cache criada com sucesso!');
      
      setFormData(initialState); 
      onOpenChange(false);

    } catch (err) {
      toast.error('Erro ao criar política', { description: err.message });
    } finally {
        setIsSaving(false);
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
            <Label htmlFor="name" className="text-right">Nome <span className="text-red-500">*</span></Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" placeholder="Ex: Cache-Static-Assets" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Descrição</Label>
            <Input id="description" name="description" value={formData.description} onChange={handleChange} className="col-span-3" placeholder="Política para arquivos estáticos" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_ttl">Min TTL (s)</Label>
              <Input id="min_ttl" name="min_ttl" type="number" min="0" value={formData.min_ttl} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_ttl">Default TTL (s)</Label>
              <Input id="default_ttl" name="default_ttl" type="number" min="0" value={formData.default_ttl} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_ttl">Max TTL (s)</Label>
              <Input id="max_ttl" name="max_ttl" type="number" min="0" value={formData.max_ttl} onChange={handleChange} />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="forward_query_strings" className="text-base">Query Strings</Label>
                <p className="text-sm text-muted-foreground">Encaminhar query strings para a origem</p>
              </div>
              <Switch 
                id="forward_query_strings" 
                checked={formData.forward_query_strings} 
                onCheckedChange={(checked) => handleSwitchChange('forward_query_strings', checked)} 
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                 <Label htmlFor="forward_cookies" className="text-base">Cookies</Label>
                 <p className="text-sm text-muted-foreground">Encaminhar cookies para a origem</p>
              </div>
              <Switch 
                id="forward_cookies" 
                checked={formData.forward_cookies} 
                onCheckedChange={(checked) => handleSwitchChange('forward_cookies', checked)} 
              />
            </div>
          </div>
          
          <div className="space-y-2">
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
            {isSaving ? 'Criando...' : 'Criar Política'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreatePolicyDialog;