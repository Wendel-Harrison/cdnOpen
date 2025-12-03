import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";

// 1. Schema de Validação
const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "A senha atual é obrigatória." }),
  password: z.string()
    .min(8, { message: "Mínimo 8 caracteres." })
    .regex(/\d/, { message: "Deve ter pelo menos um número." })
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, { message: "Deve ter pelo menos um símbolo." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

export function ForceChangePasswordDialog() {
  const { user, logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Inicialização do Formulário
  const form = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { 
      currentPassword: "", 
      password: "", 
      confirmPassword: "" 
    },
    mode: "onChange", // Valida enquanto digita para feedback rápido
  });

  // Se o usuário não tiver a flag, nem renderiza o componente
  if (!user?.mustChangePassword) return null;
  
  const onSubmit = async (formData) => {
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/users/${user.id}/change-password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentPassword: formData.currentPassword,
                newPassword: formData.password
            })
        });

        let result;
        try {
            result = await response.json();
        } catch (e) {
            result = { message: 'Erro desconhecido na API' };
        }

        if (!response.ok) {
             throw new Error(result.message || 'Falha ao alterar senha');
        }

        toast.success("Senha definida com sucesso! Por favor, faça login novamente.");
        
        setTimeout(() => {
            logout();
        }, 2000);

      } catch (error) {
          console.error(error);
          toast.error(error.message);
      } finally {
          setIsSubmitting(false);
      }
  }

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-center mb-1">Welcome</DialogTitle>
          <DialogDescription className="text-center mb-2">
            Esse é seu primeiro acesso, redefina a sua senha.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 py-4">
              
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha Temporária (Atual)</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Senha que acabou de usar" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo: Nova Senha */}
              <FormField 
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="mt-7">
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="**********" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo: Confirmar Senha */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="mt-2 mb-5">
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="**********" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 sm:gap-0 pt-4">
                  <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Salvando..." : "Definir Senha"}
                  </Button>
              </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}