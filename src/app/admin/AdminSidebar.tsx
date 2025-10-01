"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminModules = [
    { name: 'Visão Geral', href: '/admin', icon: 'fa-tachometer-alt' },
    { name: 'Write', href: '/admin/write', icon: 'fa-pencil-alt' },
    { name: 'Task', href: '/admin/task', icon: 'fa-tasks', disabled: true },
    { name: 'Test', href: '/admin/test', icon: 'fa-file-alt', disabled: true },
    { name: 'Games', href: '/admin/games', icon: 'fa-gamepad', disabled: true },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white dark:bg-dark-card p-4 border-r dark:border-dark-border flex-shrink-0">
            <h2 className="text-lg font-bold mb-4 px-2 text-dark-text dark:text-white">Admin Módulos</h2>
            <nav>
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
        </aside>
    );
}