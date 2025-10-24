import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// Importe outros componentes necessários (Select, Badge, Button, X)

// Não precisamos mais das interfaces em JSX

export function OriginPolicyForm({ formData, setFormData }) {

  // As funções handleWhitelistChange, handleInputChange, handleBehaviorChange
  // permanecem as mesmas, mas sem as anotações de tipo nos parâmetros.
  // Exemplo:
  const handleWhitelistChange = (type, value) => { // Removemos ': string', etc.
    const list = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      requestSettings: {
        ...prev.requestSettings,
        [type]: { ...prev.requestSettings[type], whitelist: list }
      }
    }));
  };

  const handleInputChange = (e) => { // Removemos ': React.ChangeEvent<...>'
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBehaviorChange = (type, value) => { // Removemos tipos
    setFormData(prev => ({
      ...prev,
      requestSettings: {
        ...prev.requestSettings,
        [type]: { ...prev.requestSettings[type], behavior: value }
      }
    }));
  };


  return (
     <div className="py-4 max-h-[80vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-4 items-center gap-4 mb-4">
        <Label htmlFor="name" className="text-right">Nome</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="description" className="text-right pt-2">
          Descrição
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="col-span-3"
          rows={3}
        />
      </div>

      <hr className="my-4" />
      <h4 className="font-semibold text-lg mb-2 col-span-4">Configurações da Requisição</h4>

      <div className="grid grid-cols-4 items-center justify-center gap-4 my-4 border-b pb-4">
        <Label className="text-right font-medium">Cabeçalhos</Label>
        <RadioGroup
          value={formData?.requestSettings?.headers?.behavior || 'none'}
          onValueChange={(value) => handleBehaviorChange('headers', value)} // Simplificado
          className="col-span-3 flex gap-4 justify-self-end mr-[10%]"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="h-all" />
            <Label htmlFor="h-all">Todos</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="h-none" />
            <Label htmlFor="h-none">Nenhum</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="whitelist" id="h-whitelist" />
            <Label htmlFor="h-whitelist">Whitelist</Label>
          </div>
        </RadioGroup>

        {formData.requestSettings.headers.behavior === 'whitelist' && (
           <div className="col-start-2 col-span-3 mt-2">
             <Label htmlFor="headers-whitelist">Cabeçalhos Permitidos (separados por vírgula)</Label>
             <Input
               id="headers-whitelist"
               value={formData?.requestSettings?.headers?.whitelist.join(', ') || ''}
               onChange={(e) => handleWhitelistChange('headers', e.target.value)}
               placeholder="Ex: Host, User-Agent, Accept-Language"
             />
             {/* Aqui você poderia adicionar Badges para visualizar/remover itens */}
           </div>
        )}
      </div>

      {/* --- Cookies --- */}
      <div className="grid grid-cols-4 items-center gap-4 border-b pb-4 mb-4">
        <Label className="text-right font-medium">Cookies:</Label>
        <RadioGroup
           value={formData?.requestSettings?.cookies?.behavior || 'none'}
           onValueChange={(value) => handleBehaviorChange('cookies', value)} // Simplificado
           className="col-span-3 flex gap-4 justify-self-end mr-[10%]"
        >
           <div className="flex items-center space-x-2"><RadioGroupItem value="all" id="c-all" /><Label htmlFor="c-all">Todos</Label></div>
           <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="c-none" /><Label htmlFor="c-none">Nenhum</Label></div>
           <div className="flex items-center space-x-2"><RadioGroupItem value="whitelist" id="c-whitelist" /><Label htmlFor="c-whitelist">Whitelist</Label></div>
        </RadioGroup>
        {formData.requestSettings.cookies.behavior === 'whitelist' && (
           <div className="col-start-2 col-span-3 mt-2">
             <Label htmlFor="cookies-whitelist">Cookies Permitidos (separados por vírgula)</Label>
             <Input
               id="cookies-whitelist"
               value={formData?.requestSettings?.cookies?.whitelist.join(', ') || ''}
               onChange={(e) => handleWhitelistChange('cookies', e.target.value)}
                placeholder="Ex: session_id, user_prefs"
             />
           </div>
        )}
      </div>

       {/* --- Query Strings --- */}
       <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right font-medium">Query Strings</Label>
         <RadioGroup
           value={formData?.requestSettings?.queryStrings?.behavior || 'none'}
           onValueChange={(value) => handleBehaviorChange('queryStrings', value)} // Simplificado
           className="col-span-3 flex gap-4 justify-self-end mr-[10%]"
        >
           <div className="flex items-center space-x-2"><RadioGroupItem value="all" id="qs-all" /><Label htmlFor="qs-all">Todos</Label></div>
           <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="qs-none" /><Label htmlFor="qs-none">Nenhum</Label></div>
           <div className="flex items-center space-x-2"><RadioGroupItem value="whitelist" id="qs-whitelist" /><Label htmlFor="qs-whitelist">Whitelist</Label></div>
         </RadioGroup>
         {formData.requestSettings.queryStrings.behavior === 'whitelist' && (
           <div className="col-start-2 col-span-3 mt-2">
             <Label htmlFor="qs-whitelist">Parâmetros Permitidos (separados por vírgula)</Label>
             <Input
               id="qs-whitelist"
               value={formData?.requestSettings?.queryStrings?.whitelist.join(', ') || ''}
               onChange={(e) => handleWhitelistChange('queryStrings', e.target.value)}
                placeholder="Ex: utm_source, product_id"
             />
           </div>
         )}
       </div>
    </div>
  );
}

export default OriginPolicyForm;