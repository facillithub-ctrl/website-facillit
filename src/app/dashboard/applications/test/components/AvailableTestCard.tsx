"use client";

import Image from 'next/image';

type Test = {
    id: string;
    title: string;
    subject: string | null;
    question_count: number;
    duration_minutes: number;
    difficulty: 'Fácil' | 'Médio' | 'Difícil';
    avg_score: number;
    total_attempts: number;
    points: number;
    cover_image_url?: string | null;
    collection?: string | null;
    is_campaign_test?: boolean; // Adicionado para destacar testes de campanha
    hasAttempted: boolean; // Adicionado para saber se o usuário já fez o teste
};

type Props = {
    test: Test;
    onStart: (testId: string) => void;
    onViewDetails: (testId: string) => void;
};

const difficultyStyles = {
    'Fácil': { icon: 'fa-leaf', color: 'text-green-500' },
    'Médio': { icon: 'fa-seedling', color: 'text-yellow-500' },
    'Difícil': { icon: 'fa-bolt', color: 'text-red-500' },
};

export default function AvailableTestCard({ test, onStart, onViewDetails }: Props) {
    const difficulty = difficultyStyles[test.difficulty] || difficultyStyles['Médio'];

    return (
        <div className={`glass-card flex flex-col p-5 relative overflow-hidden ${test.is_campaign_test ? 'border-2 border-yellow-400' : ''}`}>
            {test.is_campaign_test && (
                <div className="absolute top-0 left-0 bg-yellow-400 text-black text-xs font-bold px-3 py-1" style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)' }}>
                    <i className="fas fa-star mr-1"></i> Campanha
                </div>
            )}
            {test.cover_image_url && (
                <div className="relative h-40 w-full mb-4 mt-4">
                    <Image src={test.cover_image_url} alt={test.title} layout="fill" objectFit="cover" className="rounded-lg" />
                </div>
            )}
            <div className="flex justify-between items-start mt-4">
                <div>
                    <h3 className="text-lg font-bold text-dark-text dark:text-white mb-1">{test.title}</h3>
                    {test.collection && (
                        <span className="text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full mr-2">{test.collection}</span>
                    )}
                    {test.subject && (
                        <span className="text-xs font-semibold bg-royal-blue/10 text-royal-blue px-2 py-0.5 rounded-full">{test.subject}</span>
                    )}
                </div>
                <div className={`flex items-center gap-2 text-sm font-semibold ${difficulty.color}`}>
                    <i className={`fas ${difficulty.icon}`}></i>
                    <span>{test.difficulty}</span>
                </div>
            </div>
            
            <div className="text-xs text-dark-text-muted space-x-4 my-4">
                <span><i className="fas fa-list-ol mr-1"></i> {test.question_count} questões</span>
                <span><i className="fas fa-clock mr-1"></i> {test.duration_minutes} min</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-dark-text-muted mb-auto pb-4">
                <i className="fas fa-star text-yellow-400"></i>
                <span className="font-semibold">{test.avg_score.toFixed(1)}</span>
                <span>• {test.total_attempts.toLocaleString('pt-BR')} realizaram</span>
            </div>
            
            <div className="border-t border-white/10 pt-4 text-center">
                 <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-green-500 text-sm">+{test.points} pts</span>
                    {test.hasAttempted ? (
                        <button 
                            disabled 
                            className="bg-gray-400 text-white font-bold py-2 px-6 rounded-lg cursor-not-allowed"
                        >
                            Já foi resolvido
                        </button>
                    ) : (
                        <button 
                            onClick={() => onStart(test.id)}
                            className="bg-royal-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-transform hover:scale-105"
                        >
                            Iniciar Simulado
                        </button>
                    )}
                </div>
                 <button 
                    onClick={() => onViewDetails(test.id)} 
                    className="w-full text-center text-sm text-dark-text-muted hover:underline"
                 >
                    Conferir o gabarito
                </button>
            </div>
        </div>
    );
}