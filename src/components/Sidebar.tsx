"use client";

import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

type UserProfile = {
  fullName: string | null;
  role: string | null;
}

// Futuramente, os links aqui serão dinâmicos com base no papel do usuário (role)
const navLinks = [
  { href: '/dashboard', icon: 'fa-home', label: 'Início', roles: ['director', 'teacher', 'student'] },
  { href: '/dashboard/edu', icon: 'fa-graduation-cap', label: 'Facillit Edu', roles: ['director', 'teacher', 'student'] },
  { href: '/dashboard/admin', icon: 'fa-user-shield', label: 'Painel Admin', roles: ['director'] }, // Exemplo: link só para diretores
  { href: '/dashboard/settings', icon: 'fa-cog', label: 'Configurações', roles: ['director', 'teacher', 'student'] },
];

export default function Sidebar({ userProfile }: { userProfile: UserProfile }) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-dark-text text-white p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-10">
        <Image src="/assets/images/LOGO/png/logoazul.svg" alt="Facillit Hub Logo" width={32} height={32} className="brightness-0 invert" />
        <span className="font-bold text-xl">Facillit Hub</span>
      </div>
      <nav>
        <ul>
          {/* Filtra os links baseado no papel (role) do usuário */}
          {navLinks.filter(link => link.roles.includes(userProfile.role || '')).map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-colors">
                <i className={`fas ${link.icon} w-6 text-center`}></i>
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto pt-6 border-t border-white/10">
        {/* Exibe as informações do usuário logado */}
        <div className="mb-4">
          <p className="font-bold text-sm truncate">{userProfile.fullName}</p>
          <p className="text-xs text-gray-400 capitalize">{userProfile.role}</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-colors w-full text-left">
           <i className="fas fa-sign-out-alt w-6 text-center"></i>
           <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}