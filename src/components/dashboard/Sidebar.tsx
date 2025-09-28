"use client";

import Link from 'next/link';
import Image from 'next/image';
import createClient from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/app/dashboard/types';

const navLinks = [
  { href: '/dashboard', icon: 'fa-home', label: 'Dashboard', roles: ['gestor', 'professor', 'aluno', 'vestibulando'] },
  { href: '/dashboard/edu', icon: 'fa-graduation-cap', label: 'Facillit Edu', roles: ['gestor', 'professor', 'aluno'] },
  { href: '/dashboard/day', icon: 'fa-calendar-check', label: 'Agenda & Tarefas', roles: ['gestor', 'professor', 'aluno', 'vestibulando'] },
  { href: '/dashboard/test', icon: 'fa-file-alt', label: 'Simulados', roles: ['aluno', 'vestibulando'] },
  { href: '/dashboard/connect', icon: 'fa-users', label: 'Comunidade', roles: ['gestor', 'professor', 'aluno', 'vestibulando'] },
  { href: '/dashboard/admin', icon: 'fa-user-shield', label: 'Painel Admin', roles: ['gestor'] },
];

type SidebarProps = {
  userProfile: UserProfile;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
  isDesktopCollapsed: boolean;
  setIsDesktopCollapsed: (isCollapsed: boolean) => void;
};

export default function Sidebar({ userProfile, isMobileOpen, setIsMobileOpen, isDesktopCollapsed, setIsDesktopCollapsed }: SidebarProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* Overlay para fechar o menu em telas pequenas */}
      <div
        onClick={() => setIsMobileOpen(false)}
        className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity ${
            isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside 
        className={`fixed lg:relative top-0 left-0 h-full text-white p-4 flex flex-col z-40 transition-all duration-300
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 ${isDesktopCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
        style={{ background: 'linear-gradient(180deg, #1a237e, #2e14ed, #4a148c)' }}
      >
        <div className="flex items-center justify-between mb-8 h-8">
            <div className={`flex items-center gap-3 ${isDesktopCollapsed ? 'lg:justify-center lg:w-full' : ''}`}>
                <Image src="/assets/images/LOGO/png/logoazul.svg" alt="Facillit Hub Logo" width={32} height={32} className="brightness-0 invert flex-shrink-0" />
                <span className={`font-bold text-xl whitespace-nowrap transition-opacity ${isDesktopCollapsed ? 'lg:opacity-0 lg:hidden' : ''}`}>Facillit</span>
            </div>
            <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-2xl text-white/80 hover:text-white">
                <i className="fas fa-times"></i>
            </button>
        </div>
        
        <nav className="flex-1">
          <ul>
            {navLinks
              .filter(link => userProfile.userCategory && link.roles.includes(userProfile.userCategory))
              .map((link) => (
              <li key={link.href}>
                <Link href={link.href} title={link.label} className={`flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-colors ${isDesktopCollapsed ? 'lg:justify-center' : ''}`}>
                  <i className={`fas ${link.icon} w-6 text-center text-lg`}></i>
                  <span className={isDesktopCollapsed ? 'lg:hidden' : ''}>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="pt-4 border-t border-white/10">
            {/* Botão de Recolher/Expandir para Desktop */}
            <button 
                onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)} 
                title={isDesktopCollapsed ? 'Expandir' : 'Recolher'} 
                className={`hidden lg:flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-colors w-full text-left ${isDesktopCollapsed ? 'lg:justify-center' : ''}`}
            >
                <i className={`fas ${isDesktopCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} w-6 text-center`}></i>
                <span className={isDesktopCollapsed ? 'hidden' : ''}>Recolher</span>
            </button>

            <button onClick={handleLogout} title="Sair" className={`flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-colors w-full text-left mt-2 ${isDesktopCollapsed ? 'lg:justify-center' : ''}`}>
                <i className="fas fa-sign-out-alt w-6 text-center"></i>
                <span className={isDesktopCollapsed ? 'hidden' : ''}>Sair</span>
            </button>
        </div>
      </aside>
    </>
  );
}