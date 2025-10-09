"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const adminModules = [
    { name: 'Visão Geral', href: '/admin', icon: 'fa-tachometer-alt' },
    { name: 'Gerenciar Escolas', href: '/admin/schools', icon: 'fa-school' },
    { name: 'Atualizações', href: '/admin/updates', icon: 'fa-bullhorn' },
    { name: 'Write', href: '/admin/write', icon: 'fa-pencil-alt' },
    { name: 'Task', href: '/admin/task', icon: 'fa-tasks', disabled: true },
    { name: 'Test', href: '/admin/test', icon: 'fa-file-alt' },
    { name: 'Games', href: '/admin/games', icon: 'fa-gamepad', disabled: true },
];

type SidebarProps = {
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
};

export default function AdminSidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            <div
                onClick={() => setIsMobileOpen(false)}
                className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity ${
                    isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            />
            <aside 
                className={`fixed lg:relative top-0 left-0 h-full bg-white dark:bg-dark-card p-4 border-r dark:border-dark-border flex-shrink-0 flex flex-col z-40 transition-transform duration-300
                ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
                lg:translate-x-0 lg:w-64`}
            >
                <div className="flex items-center justify-between mb-8 h-8">
                    <div className="flex items-center gap-3">
                        <Image src="/assets/images/LOGO/png/logoazul.svg" alt="Facillit Hub Logo" width={32} height={32} />
                        <span className="font-bold text-xl text-dark-text dark:text-white">Admin</span>
                    </div>
                    <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-2xl text-gray-500 hover:text-dark-text">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <h2 className="text-sm font-bold mb-4 px-2 text-gray-500 uppercase tracking-wider">Módulos</h2>
                <nav className="flex-1">
                    <ul>
                        {adminModules.map(mod => {
                            const isActive = pathname === mod.href;
                            return (
                                <li key={mod.href}>
                                    <Link href={mod.disabled ? '#' : mod.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors
                                        ${isActive ? 'bg-royal-blue/10 text-royal-blue font-bold' : ''}
                                        ${mod.disabled ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`
                                    }>
                                        <i className={`fas ${mod.icon} w-5 text-center`}></i>
                                        <span>{mod.name}</span>
                                        {mod.disabled && <span className="text-xs ml-auto bg-gray-200 dark:bg-gray-600 px-2 rounded-full">Breve</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
                <div className="mt-auto pt-4 border-t dark:border-gray-700">
                     <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <i className="fas fa-arrow-left w-5 text-center"></i>
                        <span>Voltar ao Hub</span>
                    </Link>
                </div>
            </aside>
        </>
    );
}