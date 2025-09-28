"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/app/dashboard/layout'; // Importando o tipo

const navLinks = [
  { href: '/dashboard', icon: 'fa-home', label: 'Dashboard', roles: ['gestor', 'professor', 'aluno', 'vestibulando'] },
  { href: '/dashboard/edu', icon: 'fa-graduation-cap', label: 'Facillit Edu', roles: ['gestor', 'professor', 'aluno'] },
  { href: '/dashboard/day', icon: 'fa-calendar-check', label: 'Agenda & Tarefas', roles: ['gestor', 'professor', 'aluno', 'vestibulando'] },
  { href: '/dashboard/test', icon: 'fa-file-alt', label: 'Simulados', roles: ['aluno', 'vestibulando'] },
  { href: '/dashboard/connect', icon: 'fa-users', label: 'Comunidade', roles: ['gestor', 'professor', 'aluno', 'vestibulando'] },
  { href: '/dashboard/admin', icon: 'fa-user-shield', label: 'Painel Admin', roles: ['gestor'] }, // Apenas para Gestores
  // Adicione outros links aqui
];

export default function Sidebar({ userProfile }: { userProfile: UserProfile }) {
  const router = useRouter();
  const supabase = createClient();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className={`bg-dark-text text-white p-4 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center gap-3 mb-8 h-8">
        <Image src="/assets/images/LOGO/png/logoazul.svg" alt="Facillit Hub Logo" width={32} height={32} className="brightness-0 invert flex-shrink-0" />
        <span className={`font-bold text-xl transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>Facillit</span>
      </div>
      
      <nav className="flex-1">
        <ul>
          {navLinks
            .filter(link => userProfile.userCategory && link.roles.includes(userProfile.userCategory))
            .map((link) => (
            <li key={link.href}>
              <Link href={link.href} title={link.label} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-colors">
                <i className={`fas ${link.icon} w-6 text-center text-lg`}></i>
                <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="pt-4 border-t border-white/10">
        <button onClick={() => setIsCollapsed(!isCollapsed)} title={isCollapsed ? 'Expandir' : 'Recolher'} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-colors w-full text-left">
           <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} w-6 text-center`}></i>
           <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>Recolher</span>
        </button>
        <button onClick={handleLogout} title="Sair" className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-colors w-full text-left mt-2">
           <i className="fas fa-sign-out-alt w-6 text-center"></i>
           <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>Sair</span>
        </button>
      </div>
    </aside>
  );
}