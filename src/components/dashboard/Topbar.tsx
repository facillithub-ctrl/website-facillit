"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { UserProfile } from '@/app/dashboard/types';
import { useTheme } from '@/components/ThemeProvider';

const modulesData = [
  { slug: 'edu', icon: 'fa-graduation-cap', title: 'Edu' },
  { slug: 'games', icon: 'fa-gamepad', title: 'Games' },
  { slug: 'write', icon: 'fa-pencil-alt', title: 'Write' },
  { slug: 'day', icon: 'fa-calendar-check', title: 'Day' },
  { slug: 'play', icon: 'fa-play-circle', title: 'Play' },
  { slug: 'library', icon: 'fa-book-open', title: 'Library' },
  { slug: 'connect', icon: 'fa-users', title: 'Connect' },
  { slug: 'coach-career', icon: 'fa-bullseye', title: 'Coach' },
  { slug: 'lab', icon: 'fa-flask', title: 'Lab' },
  { slug: 'test', icon: 'fa-file-alt', title: 'Test' },
  { slug: 'task', icon: 'fa-tasks', title: 'Task' },
  { slug: 'create', icon: 'fa-lightbulb', title: 'Create' },
];

type TopbarProps = {
  userProfile: UserProfile;
  toggleSidebar: () => void;
};

export default function Topbar({ userProfile, toggleSidebar }: TopbarProps) {
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isGridOpen, setGridOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  const gridRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (gridRef.current && !gridRef.current.contains(event.target as Node)) {
        setGridOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [gridRef, profileRef]);


  return (
    <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between flex-shrink-0 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="text-gray-500 hover:text-royal-blue text-xl lg:hidden">
            <i className="fas fa-bars"></i>
        </button>

        <div className="relative hidden sm:block">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input 
              type="search" 
              placeholder="Busca universal..." 
              className="w-full max-w-xs bg-gray-100 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-royal-blue dark:bg-gray-700 dark:text-white"
            />
        </div>
      </div>
      
      <div className="flex items-center gap-4 md:gap-6">
        <button onClick={toggleTheme} className="text-gray-500 hover:text-royal-blue text-xl dark:text-gray-400">
            {theme === 'light' ? <i className="fas fa-moon"></i> : <i className="fas fa-sun"></i>}
        </button>
        
        <div className="relative" ref={gridRef}>
            <button onClick={() => setGridOpen(!isGridOpen)} className="text-gray-500 hover:text-royal-blue text-xl dark:text-gray-400">
                <i className="fas fa-th"></i>
            </button>
            {isGridOpen && (
                <div className="absolute top-full right-0 mt-4 w-[90vw] max-w-sm md:w-80 bg-white rounded-xl shadow-xl border z-10 p-4 dark:bg-gray-700 dark:border-gray-600">
                    <div className="grid grid-cols-3 gap-4">
                        {modulesData.map((module) => {
                            const isActive = userProfile.active_modules?.includes(module.slug);
                            const content = (
                                <>
                                    <i className={`fas ${module.icon} text-2xl mb-2 ${isActive ? 'text-royal-blue' : 'text-gray-400'}`}></i>
                                    <span className={`text-xs font-medium text-center ${isActive ? 'text-dark-text dark:text-white' : 'text-gray-500'}`}>{module.title}</span>
                                    {!isActive && <i className="fas fa-lock text-xs text-gray-400 absolute top-2 right-2"></i>}
                                </>
                            );

                            if (isActive) {
                                return (
                                    <Link key={module.slug} href={`/modulos/${module.slug}`} className="relative flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                        {content}
                                    </Link>
                                );
                            } else {
                                return (
                                    <div key={module.slug} className="relative flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-70" title={`${module.title} (inativo)`}>
                                        {content}
                                    </div>
                                );
                            }
                        })}
                    </div>
                </div>
            )}
        </div>
        
        <button className="text-gray-500 hover:text-royal-blue text-xl dark:text-gray-400 hidden sm:block"><i className="fas fa-bell"></i></button>
        <button className="text-gray-500 hover:text-royal-blue text-xl dark:text-gray-400 hidden sm:block"><i className="fas fa-comment"></i></button>

        <div className="relative" ref={profileRef}>
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