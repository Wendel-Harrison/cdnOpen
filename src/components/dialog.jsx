// Você pode colocar este novo componente no mesmo arquivo App.jsx ou em um arquivo separado

function EditOriginDialog({ isOpen, onOpenChange, origin, onSave }) {
  // Estado interno para o formulário, inicializado com os dados do origin
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    // Sincroniza o estado do formulário quando o origin selecionado muda
    setFormData(origin);
  }, [origin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!formData) return null; // Não renderiza nada se não houver dados

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Origin: {origin.origin_id}</DialogTitle>
          <DialogDescription>
            Faça alterações na configuração deste origin. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="origin_id" className="text-right">Origin ID</Label>
            <Input id="origin_id" name="origin_id" value={formData.origin_id} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="domain_name" className="text-right">Domínio</Label>
            <Input id="domain_name" name="domain_name" value={formData.domain_name} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="path_prefix" className="text-right">Prefixo do Caminho</Label>
            <Input id="path_prefix" name="path_prefix" value={formData.path_prefix || ''} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="protocol" className="text-right">Protocolo</Label>
            <Select
              value={formData.protocol || 'http'}
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => onSave(formData)}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}