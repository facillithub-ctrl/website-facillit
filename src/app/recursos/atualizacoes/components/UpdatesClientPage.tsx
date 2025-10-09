"use client";

import { useState, useMemo } from 'react';
import type { Update } from '@/app/dashboard/types';

// Mapeia os slugs para nomes amigáveis
const moduleNames: { [key: string]: string } = {
  'general': 'Geral',
  'facillit-write': 'Facillit Write',
  'facillit-test': 'Facillit Test',
  'facillit-edu': 'Facillit Edu',
  'facillit-day': 'Facillit Day',
  // Adicione outros módulos aqui conforme necessário
};

// Card de atualização individual que expande ao clicar
const UpdateCard = ({ update, isActive, onClick }: { update: Update, isActive: boolean, onClick: () => void }) => {
    const categoryStyles: { [key: string]: string } = {
        'Nova Funcionalidade': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        'Melhoria': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        'Correção': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    };

    return (
        <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
            <button
                onClick={onClick}
                className="w-full text-left p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-dark-text dark:text-white">{update.title}</h3>
                    <i className={`fas fa-chevron-down text-gray-500 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}></i>
                </div>
                <p className="text-sm text-text-muted dark:text-gray-400 mt-1">
                    {new Date(update.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
            </button>
            <div className={`grid transition-all duration-500 ease-in-out ${isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="px-5 pb-5 pt-2 border-t dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-4">
                            {update.version && (
                                <span className="text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-0.5 rounded-full">
                                    v{update.version}
                                </span>
                            )}
                            {update.category && (
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryStyles[update.category] || 'bg-gray-200'}`}>
                                    {update.category}
                                </span>
                            )}
                        </div>
                        {/* CORREÇÃO: As classes de texto foram removidas para o 'prose' assumir o controle total */}
                        <div
                            className="prose prose-sm dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: update.content }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};


export const UpdatesClientPage = ({ initialUpdates }: { initialUpdates: Update[] }) => {
    const [selectedModule, setSelectedModule] = useState('all');
    const [activeUpdateId, setActiveUpdateId] = useState<string | null>(initialUpdates[0]?.id || null);

    const modules = useMemo(() => {
        const uniqueModules = new Set(initialUpdates.map(u => u.module_slug || 'general'));
        return ['all', ...Array.from(uniqueModules)];
    }, [initialUpdates]);

    const filteredUpdates = useMemo(() => {
        if (selectedModule === 'all') {
            return initialUpdates;
        }
        return initialUpdates.filter(update => (update.module_slug || 'general') === selectedModule);
    }, [initialUpdates, selectedModule]);

    return (
        <section className="py-12 bg-white dark:bg-dark-background">
            <div className="container mx-auto px-6 max-w-6xl flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* --- BARRA LATERAL --- */}
                <aside className="lg:w-1/4 self-start sticky top-28">
                    <h3 className="font-bold text-lg mb-4 text-dark-text dark:text-white">Módulos</h3>
                    <ul className="space-y-2">
                        {modules.map(slug => (
                            <li key={slug}>
                                <button
                                    onClick={() => setSelectedModule(slug)}
                                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                                        selectedModule === slug
                                            ? 'bg-royal-blue/10 text-royal-blue font-bold'
                                            : 'text-text-muted hover:bg-gray-100 hover:text-royal-blue dark:hover:bg-gray-800'
                                    }`}
                                >
                                    {slug === 'all' ? 'Todas as Atualizações' : moduleNames[slug] || slug}
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* --- CONTEÚDO PRINCIPAL --- */}
                <div className="lg:w-3/4 space-y-6">
                    {filteredUpdates.length > 0 ? (
                        filteredUpdates.map(update => (
                            <UpdateCard
                                key={update.id}
                                update={update}
                                isActive={activeUpdateId === update.id}
                                onClick={() => setActiveUpdateId(activeUpdateId === update.id ? null : update.id)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-text-muted">Nenhuma atualização encontrada para este módulo.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};