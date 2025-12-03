import { useState, useEffect, useRef } from 'react'; // Adicione useRef
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Editor from '@monaco-editor/react'; 
import { toast } from "sonner";
import { ArrowLeft, Save } from 'lucide-react';
import luaparse from 'luaparse';

export default function EditFunctionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- FUNÇÃO DE VALIDAÇÃO CORRIGIDA ---
  // Agora aceita 'monacoInstance' como argumento opcional
  function validateLuaCode(value, monacoInstance = null) {
    const model = editorRef.current?.getModel();
    // Usa a instância passada OU a referência salva
    const monaco = monacoInstance || monacoRef.current;

    // Se não tivermos o monaco ou o model, não podemos validar
    if (!monaco || !model) return;

    try {
      luaparse.parse(value);
      monaco.editor.setModelMarkers(model, 'lua', []);
    } catch (e) {
      const markers = [{
        startLineNumber: e.line,
        startColumn: e.column,
        endLineNumber: e.line,
        endColumn: e.column + 1000,
        message: `Erro de Sintaxe: ${e.message.replace("[1:0] ", "")}`,
        severity: monaco.MarkerSeverity.Error
      }];

      monaco.editor.setModelMarkers(model, 'lua', markers);
    }
  }

  // --- LÓGICA DO INTELLISENSE (OpenResty/Lua) ---
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;

    // Registra o provedor de completamento para Lua
    monaco.languages.registerCompletionItemProvider('lua', {
      provideCompletionItems: (model, position) => {
        const suggestions = [
          // Palavras-chave básicas de Lua
          {
            label: 'local',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'local ',
            documentation: 'Declaração de variável local'
          },
          {
            label: 'function',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'function ${1:name}(${2:args})',
              '\t${3:-- body}',
              'end'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Declaração de função'
          },
          // --- SNIPPETS OPENRESTY (NGINX LUA) ---
          {
            label: 'ngx.say',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'ngx.say("${1:message}")',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'OpenResty',
            documentation: 'Envia dados ao cliente e finaliza a linha.'
          },
          {
            label: 'ngx.log',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'ngx.log(ngx.${1:ERR}, "${2:message}")',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'OpenResty',
            documentation: 'Grava no log de erro do Nginx.'
          },
          {
            label: 'ngx.req.get_headers',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'ngx.req.get_headers()',
            detail: 'OpenResty',
            documentation: 'Retorna uma tabela com os cabeçalhos da requisição.'
          },
          {
            label: 'ngx.status',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'ngx.status = ${1:200}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'OpenResty',
            documentation: 'Lê ou define o status da resposta HTTP.'
          },
          {
            label: 'ngx.exit',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'ngx.exit(${1:ngx.HTTP_OK})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'OpenResty',
            documentation: 'Interrompe a execução e retorna o status.'
          },
           {
            label: 'ngx.var',
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: 'ngx.var.${1:variable_name}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'OpenResty',
            documentation: 'Acessa variáveis do Nginx (ex: ngx.var.remote_addr).'
          }
        ];

        return { suggestions: suggestions };
      }
    });

    validateLuaCode(editor.getValue());

    // 2. Adiciona um listener para validar sempre que o usuário digitar
    editor.onDidChangeModelContent(() => {
      validateLuaCode(editor.getValue());
    });
  }
  
  // ----------------------------------------------

  useEffect(() => {
    const fetchFunction = async () => {
      try {
        const response = await fetch(`/api/functions`); 
        if (!response.ok) throw new Error('Erro ao buscar dados');
        
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data.data || []);
        const foundFunction = list.find(f => f.id === parseInt(id));

        if (foundFunction) {
          setFormData({
            name: foundFunction.name,
            description: foundFunction.description || '',
            code: foundFunction.code || ''
          });
        } else {
          toast.error("Função não encontrada");
          navigate('/functions');
        }
      } catch (error) {
        toast.error("Erro ao carregar a função");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFunction();
  }, [id, navigate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/functions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao salvar');
      }

      toast.success("Função atualizada com sucesso!");
      navigate('/functions');

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCodeChange = (value) => {
    setFormData(prev => ({ ...prev, code: value }));
  };

  if (isLoading) return <div className="p-8 text-center">Carregando editor...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      <Card className="p-4 py-7 bg-[#f9f9f9] border-border/60 shadow-sm">
        {/* ... (cabeçalho do card igual ao anterior) ... */}
        <div className="flex items-end gap-4">
           <Button 
            variant="outline" 
            size="icon" 
            className="bg-background shrink-0"
            onClick={() => navigate('/functions')}
            >
            <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
             {/* ... (inputs de nome e descrição iguais) ... */}
             <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Nome
                </Label>
                <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="bg-background h-9"
                />
            </div>
            <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Descrição
                </Label>
                <Input 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleChange}
                className="bg-background h-9"
                />
            </div>
            </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Editar: {formData.name}</CardTitle>
          <CardDescription>Modifique o comportamento da sua função serverless.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-2">
            <Label htmlFor="code">Código Fonte (Lua)</Label>
            
            <div className="h-[500px] border border-input rounded-md overflow-hidden bg-[#ffffff]">
              <Editor
                height="100%"
                language="lua"
                theme="light"
                value={formData.code}
                onChange={handleCodeChange}
                onMount={handleEditorDidMount} // <-- CONECTA O INTELLISENSE AQUI
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  suggest: {
                    showWords: false // Evita sugestões de palavras genéricas do texto
                  }
                }}
                className='pt-2'
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Use <code>ngx.</code> para acessar a API do OpenResty. Pressione Ctrl+Space para ver sugestões.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => navigate('/functions')}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}