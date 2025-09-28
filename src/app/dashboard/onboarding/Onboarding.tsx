"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import createClient from '@/utils/supabase/client';
import type { UserProfile } from '../types';

const modulesData = [
  { slug: 'edu', icon: 'fa-graduation-cap', title: 'Facillit Edu', description: 'Gestão pedagógica e de alunos.', roles: ['aluno', 'professor', 'gestor'] },
  { slug: 'games', icon: 'fa-gamepad', title: 'Facillit Games', description: 'Gamificação para aprender.', roles: ['aluno', 'vestibulando'] },
  { slug: 'write', icon: 'fa-pencil-alt', title: 'Facillit Write', description: 'Enviar e corrigir redações.', roles: ['aluno', 'professor', 'vestibulando'] },
  { slug: 'day', icon: 'fa-calendar-check', title: 'Facillit Day', description: 'Agenda, tarefas e hábitos.', roles: ['aluno', 'professor', 'gestor', 'vestibulando'] },
  { slug: 'play', icon: 'fa-play-circle', title: 'Facillit Play', description: 'Streaming educacional.', roles: ['aluno', 'professor', 'gestor', 'vestibulando'] },
  { slug: 'library', icon: 'fa-book-open', title: 'Facillit Library', description: 'Biblioteca e portfólios.', roles: ['aluno', 'professor', 'gestor', 'vestibulando'] },
  { slug: 'connect', icon: 'fa-users', title: 'Facillit Connect', description: 'Rede social de estudos.', roles: ['aluno', 'professor', 'gestor', 'vestibulando'] },
  { slug: 'coach-career', icon: 'fa-bullseye', title: 'Facillit Coach', description: 'Soft skills e orientação de carreira.', roles: ['aluno', 'professor', 'gestor', 'vestibulando'] },
  { slug: 'lab', icon: 'fa-flask', title: 'Facillit Lab', description: 'Laboratório virtual de STEM.', roles: ['aluno', 'professor', 'vestibulando'] },
  { slug: 'test', icon: 'fa-file-alt', title: 'Facillit Test', description: 'Simulados, quizzes e provas.', roles: ['aluno', 'professor', 'vestibulando'] },
  { slug: 'task', icon: 'fa-tasks', title: 'Facillit Task', description: 'Gestão de tarefas gerais.', roles: ['aluno', 'professor', 'gestor', 'vestibulando'] },
  { slug: 'create', icon: 'fa-lightbulb', title: 'Facillit Create', description: 'Mapas mentais e gráficos.', roles: ['aluno', 'professor', 'gestor', 'vestibulando'] },
];

export default function Onboarding({ userProfile }: { userProfile: UserProfile }) {
    const supabase = createClient();
    const router = useRouter();
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const toggleModule = (slug: string) => {
        setSelectedModules(prev =>
            prev.includes(slug) ? prev.filter(m => m !== slug) : [...prev, slug]
        );
    };

    const handleContinue = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { error } = await supabase
                .from('profiles')
                .update({
                    active_modules: selectedModules,
                    has_completed_onboarding: true
                })
                .eq('id', user.id);

            if (!error) {
                // CORREÇÃO DEFINITIVA: Força um recarregamento da página para o dashboard.
                // Isso garante que o layout do servidor busque os novos dados e exiba a interface correta.
                window.location.assign('/dashboard');
            } else {
                console.error("Erro ao salvar módulos:", error);
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    };
    
    const availableModules = modulesData.filter(module => 
        userProfile.userCategory && module.roles.includes(userProfile.userCategory)
    );

    return (
        <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-dark-text mb-2">Bem-vindo(a) ao Facillit Hub!</h1>
                <p className="text-text-muted mb-8">Personalize sua experiência. Selecione os módulos que você mais usará no seu dia a dia.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {availableModules.map(module => (
                        <button
                            key={module.slug}
                            onClick={() => toggleModule(module.slug)}
                            className={`p-4 border rounded-lg text-center transition-all duration-200
                                ${selectedModules.includes(module.slug) ? 'bg-royal-blue text-white border-royal-blue ring-2 ring-blue-300' : 'hover:border-royal-blue hover:bg-blue-50'}`}
                        >
                            <i className={`fas ${module.icon} text-3xl mb-2 ${selectedModules.includes(module.slug) ? 'text-white' : 'text-royal-blue'}`}></i>
                            <h3 className="font-bold">{module.title}</h3>
                            <p className="text-xs opacity-80">{module.description}</p>
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleContinue}
                    disabled={isLoading || selectedModules.length === 0}
                    className="w-full py-3 bg-royal-blue text-white font-bold rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-opacity-90"
                >
                    {isLoading ? 'Salvando...' : 'Continuar para o Dashboard'}
                </button>
            </div>
        </div>
    );
}