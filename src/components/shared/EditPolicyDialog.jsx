// EditPolicyDialog.jsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';



function EditPolicyDialog({ isOpen, onOpenChange, policy, onSave }) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    // Quando uma política é selecionada, popula o formulário
    // Converte o array de headers para uma string para o textarea
    if (policy) {
      setFormData({
        ...policy,
        forwarded_headers: Array.isArray(policy.forwarded_headers) ? policy.forwarded_headers.join(', ') : '',
      });
    }
  }, [policy]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSaveChanges = () => {
    // Converte a string de headers de volta para um array antes de salvar
    const headersArray = formData.forwarded_headers
      .split(',')
      .map(h => h.trim())
      .filter(h => h);
    
    onSave({ ...formData, forwarded_headers: headersArray });
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[50%]">
        <DialogHeader>
          <DialogTitle>Editar Política: {policy.name}</DialogTitle>
          <DialogDescription>
            Altere as configurações desta política de cache.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-9 items-center gap-4">
            <Label htmlFor="name" className="text-right font-semibold">Nome:</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-8" />
          </div>
          <div className="grid grid-cols-9 items-center gap-4">
            <Label htmlFor="description" className="text-right font-semibold">Descrição:</Label>
            <Input id="description" name="description" value={formData.description || ''} onChange={handleChange} className="col-span-8" />
          </div>
          <Card className='px-5 bg-gray-50'>
            <CardTitle className='text-center font-bold'>Time-to-Live (segundos)</CardTitle>
            <div className="grid grid-cols-3 gap-4">
                <div className='flex flex-col gap-1'>
                    <Label className='font-semibold'>Mínimo TTL</Label>
                    <Input name="min_ttl" type="number" className='bg-white' value={formData.min_ttl} onChange={handleChange} />
                </div>
                <div className='flex flex-col gap-1'>
                    <Label className='font-semibold'>Default TTL</Label>
                    <Input name="default_ttl" type="number" className='bg-white' value={formData.default_ttl} onChange={handleChange} />
                </div>
                <div className='flex flex-col gap-1'>
                    <Label className='font-semibold'>Máximo TTL</Label>
                    <Input name="max_ttl" type="number" className='bg-white' value={formData.max_ttl} onChange={handleChange} />
                </div>
            </div>
          </Card>
            
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3 bg-gray-100">
              <Label>Encaminhar Query Strings</Label>
              <Switch checked={formData.forward_query_strings} onCheckedChange={(c) => handleSwitchChange('forward_query_strings', c)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3 bg-gray-100">
              <Label>Encaminhar Cookies</Label>
              <Switch checked={formData.forward_cookies} onCheckedChange={(c) => handleSwitchChange('forward_cookies', c)} />
            </div>
          </div>
          <div>
            <Label>Encaminhar Headers Específicos</Label>
            <Textarea 
              name="forwarded_headers"
              placeholder="Host, Authorization (separados por vírgula)"
              value={formData.forwarded_headers}
              onChange={handleChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="outline" onClick={handleSaveChanges}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditPolicyDialog;