import { useState, useEffect  } from 'react'

import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus } from 'lucide-react'

function EditOriginDialog({ isOpen, onOpenChange, origin, onSave }) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    // Garante que os headers sejam sempre um array
    setFormData({ ...origin, headers: origin.headers || [] });
  }, [origin]);

  // Handlers para os campos principais
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- LOGICA PARA MANIPULAR HEADERS ---
  const handleHeaderChange = (index, field, value) => {
    const newHeaders = [...formData.headers];
    newHeaders[index][field] = value;
    setFormData(prev => ({ ...prev, headers: newHeaders }));
  };

  const handleAddHeader = () => {
    setFormData(prev => ({
      ...prev,
      headers: [...prev.headers, { header_name: '', header_value: '' }]
    }));
  };

  const handleRemoveHeader = (index) => {
    const newHeaders = formData.headers.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, headers: newHeaders }));
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Editar Origin: {origin.origin_id}</DialogTitle>
          <DialogDescription>
            Faça alterações na configuração deste origin.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="origin_id" className="text-right">Origin ID</Label>
            <Input id="origin_id" name="origin_id" value={formData.origin_id} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="domain_name" className="text-right">Domínio do Origin</Label>
            <Input id="domain_name" name="domain_name" value={formData.domain_name} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="protocol" className="text-right">Protocolo</Label>
            <Select
              value={formData.protocol}
              onValueChange={(value) => handleSelectChange('protocol', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="http">HTTP</SelectItem>
                <SelectItem value="https">HTTPS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="port" className="text-right">Porta</Label>
            <Input id="port" name="port" type="number" value={formData.port || ''} onChange={handleChange} className="col-span-3" />
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <Label>Headers Customizados</Label>
          {formData.headers.map((header, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="Nome do Header (ex: Host)"
                value={header.header_name}
                onChange={(e) => handleHeaderChange(index, 'header_name', e.target.value)}
              />
              <Input
                placeholder="Valor do Header"
                value={header.header_value}
                onChange={(e) => handleHeaderChange(index, 'header_value', e.target.value)}
              />
              <Button variant="ghost" size="icon" onClick={() => handleRemoveHeader(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={handleAddHeader}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Header
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="secondary" onClick={() => onSave(formData)}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditOriginDialog;