// src/components/shared/UserProfileSheet.jsx
import { Button } from "@/components/ui/button";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext"; // Importa o hook de autenticação
import { useState } from "react";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Digite sua senha atual." }),
  password: z.string()
    .min(8, { message: "Deve ter no mínimo 8 caracteres." })
    .regex(/\d/, { message: "Deve conter pelo menos um número." })
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, { message: "Deve conter pelo menos um símbolo." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

export function UserProfileSheet() {
  const { user } = useAuth(); // Pega o usuário do contexto
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // --- 2. Inicialização do Formulário ---
  const form = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  async function onSubmit(data) {
    setIsSubmitting(true);
    
    const promise = fetch(`/api/users/${user.id}/change-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: data.currentPassword,
        newPassword: data.password
      })
    }).then(async (res) => {
      const responseData = await res.json();
      if (!res.ok) {
        // Se a API retornar erro (ex: senha atual errada), lançamos para o toast pegar
        throw new Error(responseData.message || 'Erro ao atualizar');
      }
      return responseData;
    });

    toast.promise(promise, {
      loading: 'Verificando e atualizando...',
      success: () => {
        form.reset();
        setIsSubmitting(false);
        return 'Sua senha foi alterada com sucesso!';
      },
      error: (err) => {
        setIsSubmitting(false);
        return err.message; 
      },
    });
  }

  return (
    <>
      <SheetHeader className="text-center">
        <SheetTitle>Perfil do Usuário</SheetTitle>
      </SheetHeader>
      
      {/* --- Informações do Usuário --- */}
      <div className="space-y-2 mx-5">
        <div className="space-y-1">
          <Label>Nome:</Label>
          <Input value={user.name} />
        </div>
        <div className="space-y-1">
          <Label>Email:</Label>
          <Input value={user.email} disabled />
        </div>
        <div className="space-y-1">
          <Label>Função:</Label>
          <div className="w-full">
            <Badge variant="outline" className="capitalize py-2.5 px-6 mt-1">{user.role}</Badge>
          </div>
        </div>
      </div>
      
      <Separator className="mt-5 mb-10" />
      {/* <Separator className="mb-10" /> */}

      
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 mx-5">
          <SheetTitle className="text text-center mb-5">Redefinir Senha</SheetTitle>

          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha Atual</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="**********" className='pl-4' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nova Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="**********" className='pl-4' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Nova Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="**********" className='pl-4' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <SheetFooter className='absolute bottom-0 left-1/2 -translate-x-1/2'>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Nova Senha'}
            </Button>
          </SheetFooter>
        </form>
      </Form>
    </>
  );
}

export default UserProfileSheet;