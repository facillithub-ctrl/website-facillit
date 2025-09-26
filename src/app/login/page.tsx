"use client"; // Formulários com estado e interações precisam ser Client Components

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// Importe seu cliente Supabase aqui
// import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  // Lógica de estado e submissão do formulário viria aqui
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');

  // async function handleLogin(e: React.FormEvent) {
  //   e.preventDefault();
  //   // Lógica de login com Supabase
  // }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(135deg, #2e14ed 0%, #0c0082 100%)" }}>
       {/* Adicione o back-to-home button aqui */}
      <div className="cadastro-container max-w-4xl w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg flex overflow-hidden">
        <div className="mascote-container hidden md:flex flex-1 items-center justify-center p-5">
            <Image src="/assets/images/MASCOTE/criar.png" alt="Mascote Facillit Hub" width={400} height={400} />
        </div>
        <div className="form-lado-a-lado flex-1 p-8">
            <div className="logo-container mb-8 flex justify-center">
                <Image src="/assets/images/LOGO/png/logoazul.svg" alt="Logo Facillit Hub" width={48} height={48} />
            </div>
            {/* O conteúdo do seu formulário de login viria aqui */}
            <h2 className="text-2xl font-bold text-center mb-2">Que bom te ver de novo!</h2>
            <p className="text-light-text text-center mb-6">Faça login para continuar.</p>
            {/* form... */}
        </div>
      </div>
    </div>
  );
}