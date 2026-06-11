import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login({ email, senha });
      // The refreshUser in AuthProvider will handle the redirect if we use a logic in App.tsx
      // But for now let's just navigate based on the user type we might get back (or wait for provider)
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Falha no login. Verifique suas credenciais.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8 flex flex-col items-center">
           <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
              <div className="w-6 h-6 border-4 border-primary-foreground rounded-md"></div>
           </div>
           <h1 className="text-3xl font-bold tracking-tight text-foreground">
            KitCheck
           </h1>
           <p className="text-muted-foreground font-medium mt-1">Gestão Inteligente de Eventos</p>
        </div>

        <Card className="border border-border shadow-xl rounded-2xl overflow-hidden bg-white">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold tracking-tight">Login</CardTitle>
            <CardDescription className="text-muted-foreground">
              Entre com seu email e senha para acessar o painel.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="email">Email</label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@reirakits.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-secondary/50 border-border focus:bg-white h-11 rounded-xl shadow-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="password">Senha</label>
                  <a href="#" className="text-xs text-primary font-bold hover:underline">Esqueceu a senha?</a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="bg-secondary/50 border-border focus:bg-white h-11 rounded-xl shadow-none transition-all"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl mt-2 shadow-lg shadow-primary/10 transition-all active:scale-[0.98]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar no Sistema
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t border-border bg-secondary/30 py-6 mt-4">
            <p className="text-[10px] uppercase tracking-widest text-center text-muted-foreground font-bold">
              © 2024 KitCheck - Todos os direitos reservados.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
