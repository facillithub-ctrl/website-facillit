"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Essay, EssayPrompt, getEssaysForStudent } from '../actions';
import EssayEditor from './EssayEditor';
import EssayCorrectionView from './EssayCorrectionView';
import StatisticsWidget from './StatisticsWidget';
import ProgressionChart from './ProgressionChart';
import CountdownWidget from '@/components/dashboard/CountdownWidget';

// --- TIPOS E PROPS ---

type Stats = {
    totalCorrections: number;
    averages: { avg_final_grade: number; avg_c1: number; avg_c2: number; avg_c3: number; avg_c4: number; avg_c5: number; };
    pointToImprove: { name: string; average: number; };
    progression: { date: string; grade: number; }[];
} | null;

type RankInfo = { rank: number | null; state: string | null; } | null;
type FrequentError = { error_type: string; count: number };
type CurrentEvent = { id: string; title: string; summary: string | null; link: string };

type Props = {
  initialEssays: Partial<Essay>[];
  prompts: EssayPrompt[];
  statistics: Stats;
  streak: number;
  rankInfo: RankInfo;
  frequentErrors: FrequentError[];
  currentEvents: CurrentEvent[];
  targetExam: string | null | undefined;
  examDate: string | null | undefined;
};

// --- WIDGETS E SUB-COMPONENTES ---

const WritingStreak = ({ days }: { days: number }) => (
    <div className="flex items-center gap-4">
        <div className={`text-4xl ${days > 0 ? 'animate-bounce text-orange-500' : 'text-gray-400'}`}><i className="fas fa-fire"></i></div>
        <div>
            <h4 className="font-bold dark:text-white-text">{days > 0 ? `Você está há ${days} dia${days > 1 ? 's' : ''} escrevendo!` : 'Comece sua sequência!'}</h4>
            <p className="text-sm text-gray-500 dark:text-dark-text-muted">{days > 0 ? 'Continue assim.' : 'Envie uma redação hoje.'}</p>
        </div>
    </div>
);

const StateRanking = ({ rank, state }: { rank: number | null, state: string | null }) => (
     <div className="flex items-center gap-4">
        <div className="text-4xl text-yellow-500"><i className="fas fa-trophy"></i></div>
        <div>
            <h4 className="font-bold dark:text-white-text">{rank && state ? `Você está em #${rank} no ranking de ${state}!` : 'Ranking Indisponível'}</h4>
            <p className="text-sm text-gray-500 dark:text-dark-text-muted">{rank && state ? 'Sua média está entre as melhores.' : 'Escreva para aparecer aqui.'}</p>
        </div>
    </div>
);

const ActionShortcuts = () => (
    <div>
        <h4 className="font-bold mb-3 dark:text-white-text text-center">Atalhos</h4>
        <div className="space-y-2">
            <Link href="/dashboard/applications/test" className="flex items-center gap-3 p-2 rounded-md hover:bg-black/10">
                <i className="fas fa-file-alt w-5 text-center text-royal-blue"></i>
                <span className="text-sm font-medium dark:text-gray-200">Testar gramática</span>
            </Link>
             <Link href="/dashboard/applications/day" className="flex items-center gap-3 p-2 rounded-md hover:bg-black/10">
                <i className="fas fa-calendar-check w-5 text-center text-royal-blue"></i>
                <span className="text-sm font-medium dark:text-gray-200">Agendar redação</span>
            </Link>
             <Link href="/dashboard/applications/library" className="flex items-center gap-3 p-2 rounded-md hover:bg-black/10">
                <i className="fas fa-book-open w-5 text-center text-royal-blue"></i>
                <span className="text-sm font-medium dark:text-gray-200">Ver argumentos</span>
            </Link>
        </div>
    </div>
);

// NOVO WIDGET para usar a prop 'currentEvents'
const CurrentEventsWidget = ({ events }: { events: CurrentEvent[] }) => (
    <div className="glass-card p-6 h-full flex flex-col">
        <h3 className="font-bold text-lg mb-4 dark:text-white">Fique por Dentro</h3>
        {events.length > 0 ? (
            <ul className="space-y-3 overflow-y-auto flex-1">
                {events.map(event => (
                    <li key={event.id}>
                        <a href={event.link} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-md hover:bg-black/10 transition-colors">
                            <p className="font-semibold text-sm dark:text-white">{event.title}</p>
                            {event.summary && <p className="text-xs text-dark-text-muted mt-1">{event.summary}</p>}
                        </a>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-sm text-dark-text-muted m-auto text-center">Nenhuma notícia recente disponível.</p>
        )}
    </div>
);


// --- COMPONENTE PRINCIPAL ---

export default function StudentDashboard({ initialEssays, prompts, statistics, streak, rankInfo, frequentErrors, currentEvents, targetExam, examDate }: Props) {
  const [essays, setEssays] = useState(initialEssays);
  const [view, setView] = useState<'dashboard' | 'edit' | 'view_correction'>('dashboard');
  const [currentEssay, setCurrentEssay] = useState<Partial<Essay> | null>(null);
  const searchParams = useSearchParams();

  const handleSelectEssay = useCallback((essay: Partial<Essay>) => {
    setCurrentEssay(essay);
    setView(essay.status === 'corrected' ? 'view_correction' : 'edit');
  }, []);

  useEffect(() => {
    const essayIdFromUrl = searchParams.get('essayId');
    if (essayIdFromUrl) {
      const essayToOpen = initialEssays.find(e => e.id === essayIdFromUrl);
      if (essayToOpen) {
        handleSelectEssay(essayToOpen);
      }
    }
  }, [searchParams, initialEssays, handleSelectEssay]);

  const handleCreateNew = () => {
    setCurrentEssay(null);
    setView('edit');
  };

  const handleBackToDashboard = async () => {
    const result = await getEssaysForStudent();
    if (result.data) setEssays(result.data);
    setView('dashboard');
    setCurrentEssay(null);
    window.history.pushState({}, '', '/dashboard/applications/write');
  };

  if (view === 'edit') return <EssayEditor essay={currentEssay} prompts={prompts} onBack={handleBackToDashboard} />;
  if (view === 'view_correction' && currentEssay?.id) return <EssayCorrectionView essayId={currentEssay.id} onBack={handleBackToDashboard} />;

  return (
    <div>
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dark-text dark:text-white-text">Meu Desempenho em Redação</h1>
        <button onClick={handleCreateNew} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">
          <i className="fas fa-plus mr-2"></i> Nova Redação
        </button>
      </div>
      
      {/* --- LINHA SUPERIOR DE CARDS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6">
          <CountdownWidget targetExam={targetExam} examDate={examDate} />
        </div>

        <div className="glass-card p-6 lg:col-span-2 flex flex-col justify-center space-y-4">
            <WritingStreak days={streak} />
            <hr className="border-white/20"/>
            <StateRanking rank={rankInfo?.rank ?? null} state={rankInfo?.state ?? null} />
        </div>

        <div className="glass-card p-6">
            <ActionShortcuts />
        </div>
      </div>

      {/* --- LINHA DO MEIO DE CARDS (ATUALIZADA) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
            {statistics ? (
                <ProgressionChart
                    data={statistics.progression}
                />
            ) : (
                <div className="glass-card h-full flex items-center justify-center p-8">
                    <p className="text-center dark:text-white-text">Seu gráfico de progressão e plano de ação aparecerão aqui.</p>
                </div>
            )}
        </div>
        
        <div className="lg:col-span-1">
            <div className="glass-card p-6 h-full">
                {statistics ? <StatisticsWidget stats={statistics} frequentErrors={frequentErrors}/> : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-center dark:text-white-text">Suas estatísticas aparecerão aqui.</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* --- NOVA LINHA INFERIOR DE CARDS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-dark-text dark:text-white-text mb-4">Histórico de Redações</h2>
            <div className="glass-card p-4">
                <ul className="divide-y divide-white/20">
                    {essays.length > 0 ? essays.map(essay => (
                      <li key={essay.id} onClick={() => handleSelectEssay(essay)} className="p-4 hover:bg-black/10 rounded-lg cursor-pointer flex justify-between items-center">
                        <div>
                          <p className="font-bold text-dark-text dark:text-white-text">{essay.title || "Redação sem título"}</p>
                          <p className="text-sm text-gray-500 dark:text-dark-text-muted">{essay.status === 'draft' ? 'Rascunho' : `Enviada em: ${new Date(essay.submitted_at!).toLocaleDateString()}`}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${essay.status === 'corrected' ? 'bg-green-100 text-green-800' : essay.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-800'}`}>
                          {essay.status === 'corrected' ? 'Corrigida' : essay.status === 'submitted' ? 'Aguardando correção' : 'Rascunho'}
                        </span>
                      </li>
                    )) : (<p className="p-4 text-center text-gray-500 dark:text-dark-text-muted">Você ainda não tem nenhuma redação. Comece uma nova!</p>)}
                </ul>
            </div>
        </div>
        <div className="lg:col-span-1">
             <h2 className="text-2xl font-bold text-dark-text dark:text-white-text mb-4">Notícias</h2>
             <CurrentEventsWidget events={currentEvents} />
        </div>
      </div>

    </div>
  );
}