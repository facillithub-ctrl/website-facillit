"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { UserProfile } from '@/app/dashboard/layout';
import { useTheme } from '@/components/ThemeProvider';

export default function Topbar({ userProfile }: { userProfile: UserProfile }) {
  const [isProfileOpen, setProfileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between flex-shrink-0 dark:bg-gray-800 dark:border-gray-700">
      {/* Lado Esquerdo: Busca Universal */}
      <div className="relative w-full max-w-md">
        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input 
          type="search" 
          placeholder="Busca universal..." 
          className="w-full bg-gray-100 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-royal-blue dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Lado Direito: Ações e Perfil */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* BOTÃO DE TEMA */}
        <button onClick={toggleTheme} className="text-gray-500 hover:text-royal-blue text-xl dark:text-gray-400">
            {theme === 'light' ? <i className="fas fa-moon"></i> : <i className="fas fa-sun"></i>}
        </button>

        <button className="text-gray-500 hover:text-royal-blue text-xl dark:text-gray-400"><i className="fas fa-th"></i></button>
        <button className="text-gray-500 hover:text-royal-blue text-xl dark:text-gray-400"><i className="fas fa-bell"></i></button>
        <button className="text-gray-500 hover:text-royal-blue text-xl dark:text-gray-400"><i className="fas fa-comment"></i></button>

        {/* Menu do Usuário */}
        <div className="relative">
          <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-royal-blue dark:bg-gray-600">
                {userProfile.avatarUrl ? (
                    <Image src={userProfile.avatarUrl} alt="Avatar" width={40} height={40} className="rounded-full" />
                ) : (
                    <span>{userProfile.fullName?.charAt(0)}</span>
                )}
            </div>
            <div className="text-left hidden md:block dark:text-white">
              <p className="font-bold text-sm truncate">{userProfile.fullName}</p>
              <p className="text-xs text-gray-500 capitalize dark:text-gray-400">{userProfile.userCategory}</p>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-10 dark:bg-gray-700 dark:border-gray-600">
              <ul>
                <li><Link href="/dashboard/profile" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600">Meu Perfil</Link></li>
                <li><Link href="/dashboard/settings" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600">Configurações</Link></li>
                <li><Link href="/recursos/ajuda" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600">Ajuda</Link></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}