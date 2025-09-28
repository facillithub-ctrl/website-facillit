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
      // SUCESSO NO LOGIN
      // 1. Força a revalidação dos Server Components na rota atual e futura
      router.refresh();
      // 2. Navega para o dashboard
      router.push('/dashboard');
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
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-dark-text mb-1">E-mail</label>
                  <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 border rounded-lg" />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-dark-text mb-1">Senha</label>
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