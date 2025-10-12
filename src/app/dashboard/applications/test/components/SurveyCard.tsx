"use client";

import Image from 'next/image';

// Tipo de dados simplificado para o card de pesquisa
type Survey = {
    id: string;
    title: string;
    question_count: number;
    duration_minutes: number;
    total_attempts: number;
    hasAttempted: boolean;
    cover_image_url?: string | null;
    collection?: string | null;
};

type Props = {
    survey: Survey;
    onStart: (surveyId: string) => void;
};

export default function SurveyCard({ survey, onStart }: Props) {
    return (
        <div className="glass-card flex flex-col p-5 relative overflow-hidden border-2 border-indigo-400">
            {/* Destaque visual para Pesquisa */}
            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                <i className="fas fa-poll-h mr-1"></i> Pesquisa
            </div>
            
            {survey.cover_image_url && (
                <div className="relative h-40 w-full mb-4 mt-4">
                    <Image src={survey.cover_image_url} alt={survey.title} layout="fill" objectFit="cover" className="rounded-lg" />
                </div>
            )}
            
            <div className="flex justify-between items-start mt-4">
                <div>
                    <h3 className="text-lg font-bold text-dark-text dark:text-white mb-1">{survey.title}</h3>
                    {survey.collection && (
                        <span className="text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full mr-2">{survey.collection}</span>
                    )}
                </div>
            </div>
            
            <div className="text-xs text-dark-text-muted space-x-4 my-4">
                <span><i className="fas fa-list-ol mr-1"></i> {survey.question_count} perguntas</span>
                <span><i className="fas fa-clock mr-1"></i> {survey.duration_minutes} min</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-dark-text-muted mb-auto pb-4">
                <span>{survey.total_attempts.toLocaleString('pt-BR')} respostas</span>
            </div>
            
            <div className="border-t border-white/10 pt-4 text-center">
                 <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-indigo-400">
                        <i className="fas fa-clipboard-check mr-1"></i> Sua Participação
                    </span>
                    {survey.hasAttempted ? (
                        <button 
                            disabled 
                            className="bg-gray-400 text-white font-bold py-2 px-6 rounded-lg cursor-not-allowed"
                        >
                            Respondida
                        </button>
                    ) : (
                        <button 
                            onClick={() => onStart(survey.id)}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg transition-transform hover:scale-105"
                        >
                            Iniciar Pesquisa
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}