"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import createSupabaseClient from '@/utils/supabase/client';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Container, type ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createSupabaseClient();
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {};

  const options: ISourceOptions = useMemo(
    () => ({
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      interactivity: {
        events: {
          onClick: { enable: true, mode: "push" },
          onHover: { enable: true, mode: "repulse" },
        },
        modes: {
          push: { quantity: 4 },
          repulse: { distance: 100, duration: 0.4 },
        },
      },
      particles: {
        color: { value: "#ffffff" },
        links: { color: "#ffffff", distance: 150, enable: true, opacity: 0.4, width: 1 },
        move: { direction: "none", enable: true, outModes: { default: "out" }, random: false, speed: 2, straight: false },
        number: { density: { enable: true }, value: 80 },
        opacity: { value: 0.5 },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 5 } },
      },
      detectRetina: true,
    }),
    [],
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('E-mail ou senha inválidos. Por favor, tente novamente.');
      setIsLoading(false);
    } else {
      router.refresh();
      router.push('/dashboard');
    }
  };

  if (!init) {
    return <div className="min-h-screen bg-royal-blue" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(135deg, #2e14ed 0%, #0c0082 100%)" }}>
      <Particles id="tsparticles" options={options} className="absolute inset-0 z-0" />
      
      <div className="w-full max-w-4xl rounded-2xl shadow-lg flex overflow-hidden my-8 z-10">
        <div className="hidden md:flex flex-1 items-center justify-center p-5">
          <Image src="/assets/images/MASCOTE/login.png" alt="Mascote Facillit Hub Login" width={400} height={400} priority />
        </div>
        
        <div className="flex-1 p-8 flex flex-col justify-center bg-white animate-fade-in-right relative">
          <Link href="/" className="absolute top-6 right-6 z-10 flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <i className="fas fa-arrow-left"></i> Tela Inicial
          </Link>

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

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
              <span className="relative px-2 bg-white text-sm text-text-muted">ou</span>
            </div>

            <Link href="/login/institucional" className="w-full flex items-center justify-center gap-3 py-3 px-4 border rounded-lg hover:bg-gray-50 transition font-medium">
                <i className="fas fa-school text-royal-blue"></i>
                Acesso Institucional
            </Link>

            <div className="text-sm text-text-muted text-center mt-6">
              Não tem uma conta? <Link href="/register" className="font-bold text-royal-blue">Crie uma agora</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}