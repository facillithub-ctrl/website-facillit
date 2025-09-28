"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { UserProfile } from '@/app/dashboard/layout'; // Importando o tipo

export default function Topbar({ userProfile }: { userProfile: UserProfile }) {
  const [isProfileOpen, setProfileOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between flex-shrink-0">
      {/* Lado Esquerdo: Busca Universal */}
      <div className="relative w-full max-w-md">
        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input 
          type="search" 
          placeholder="Busca universal..." 
          className="w-full bg-gray-100 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-royal-blue"
        />
      </div>

      {/* Lado Direito: Ações e Perfil */}
      <div className="flex items-center gap-6">
        <button className="text-gray-500 hover:text-royal-blue text-xl"><i className="fas fa-th"></i></button>
        <button className="text-gray-500 hover:text-royal-blue text-xl"><i className="fas fa-bell"></i></button>
        <button className="text-gray-500 hover:text-royal-blue text-xl"><i className="fas fa-comment"></i></button>

        {/* Menu do Usuário */}
        <div className="relative">
          <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-royal-blue">
                {/* Fallback para as iniciais se não houver avatar */}
                {userProfile.avatarUrl ? (
                    <Image src={userProfile.avatarUrl} alt="Avatar" width={40} height={40} className="rounded-full" />
                ) : (
                    <span>{userProfile.fullName?.charAt(0)}</span>
                )}
            </div>
            <div className="text-left hidden md:block">
              <p className="font-bold text-sm truncate">{userProfile.fullName}</p>
              <p className="text-xs text-gray-500 capitalize">{userProfile.userCategory}</p>
            </div>
          </button>

          {/* Dropdown do Menu */}
          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-10">
              <ul>
                <li><Link href="/dashboard/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">Meu Perfil</Link></li>
                <li><Link href="/dashboard/settings" className="block px-4 py-2 text-sm hover:bg-gray-100">Configurações</Link></li>
                <li><Link href="/recursos/ajuda" className="block px-4 py-2 text-sm hover:bg-gray-100">Ajuda</Link></li>
                {/* O botão de sair está na Sidebar, mas poderia estar aqui também */}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}