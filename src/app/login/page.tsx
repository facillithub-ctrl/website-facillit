"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import createSupabaseClient from '@/utils/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createSupabaseClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('E-mail ou senha inválidos. Por favor, tente novamente.');
      setIsLoading(false);
    } else {
      router.refresh();
      router.push('/dashboard');
    }
  };

  // Função para login com provedores OAuth
  const handleOAuthLogin = async (provider: 'google' | 'azure') => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(`Erro ao fazer login com ${provider}: ${error.message}`);
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(135deg, #2e14ed 0%, #0c0082 100%)" }}>
      <Link href="/" className="fixed top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 backdrop-blur-sm hover:bg-white/20 transition-colors">
        <i className="fas fa-arrow-left"></i> Voltar
      </Link>
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg flex overflow-hidden my-8">
        <div className="hidden md:flex flex-1 items-center justify-center p-5 bg-white/20">
            <Image src="/assets/images/MASCOTE/login.png" alt="Mascote Facillit Hub Login" width={400} height={400} priority />
        </div>
        <div className="flex-1 p-8 flex flex-col justify-center">
            <div className="mb-8 flex justify-center">
                <Image src="/assets/images/LOGO/png/logoazul.svg" alt="Logo Facillit Hub" width={48} height={48} />
            </div>
            
            <div className="w-full max-w-sm mx-auto">
              <h2 className="text-2xl font-bold text-center mb-2 text-dark-text">Que bom te ver de novo!</h2>
              <p className="text-text-muted text-center mb-6">Faça login para continuar.</p>

              {/* Botões de OAuth adicionados */}
              <div className="space-y-3 mb-4">
                  <button onClick={() => handleOAuthLogin('google')} disabled={isLoading} className="w-full flex items-center justify-center gap-3 py-3 px-4 border rounded-lg hover:bg-gray-50 transition">
                      <Image src="/assets/images/LOGO/corp/Evolução-do-logótipo-da-Google-2016.jpg" alt="Google logo" width={20} height={20} />
                      <span className="font-medium">Continuar com Google</span>
                  </button>
                  <button onClick={() => handleOAuthLogin('azure')} disabled={isLoading} className="w-full flex items-center justify-center gap-3 py-3 px-4 border rounded-lg hover:bg-gray-50 transition">
                      {/* Adicione um ícone da Microsoft se desejar */}
                      <span className="font-medium">Continuar com Microsoft</span>
                  </button>
              </div>

              <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white/90 px-2 text-text-muted">Ou continue com</span></div>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-dark-text mb-1">E-mail</label>
                  <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 border rounded-lg" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-dark-text">Senha</label>
                    <Link href="#" className="text-xs text-royal-blue hover:underline">
                      Esqueci minha senha
                    </Link>
                  </div>
                  <input type="password" name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 border rounded-lg" />
                </div>
                {error && (<p className="text-red-500 text-sm text-center">{error}</p>)}
                <div>
                  <button type="submit" disabled={isLoading} className="w-full mt-2 py-3 px-4 bg-royal-blue text-white rounded-lg font-bold hover:bg-opacity-90 transition disabled:bg-gray-400">
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </button>
                </div>
              </form>
              <div className="text-sm text-text-muted text-center mt-6">
                Não tem uma conta? <Link href="/register" className="font-bold text-royal-blue">Crie uma agora</Link>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}