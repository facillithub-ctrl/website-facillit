"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Essay, EssayPrompt, getEssaysForStudent } from '../actions';
import EssayEditor from './EssayEditor';
import EssayCorrectionView from './EssayCorrectionView';
import StatisticsWidget from './StatisticsWidget';
import ProgressionChart from './ProgressionChart';

// Tipos
type Stats = {
    totalCorrections: number;
    averages: { avg_final_grade: number; avg_c1: number; avg_c2: number; avg_c3: number; avg_c4: number; avg_c5: number; };
    pointToImprove: { name: string; average: number; };
    progression: { date: string; grade: number; }[];
} | null;

type RankInfo = {
    rank: number | null;
    state: string | null;
} | null;

type Props = {
  initialEssays: Partial<Essay>[];
  prompts: EssayPrompt[];
  statistics: Stats;
  streak: number;
  rankInfo: RankInfo;
};

// Componentes Internos para os novos widgets (sem alterações)
const WritingStreak = ({ days }: { days: number }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center gap-4">
        <div className={`text-4xl ${days > 0 ? 'animate-bounce text-orange-500' : 'text-gray-400'}`}>
            <i className="fas fa-fire"></i>
        </div>
        <div>
            <h4 className="font-bold dark:text-white">
                {days > 0 ? `Você está há ${days} dia${days > 1 ? 's' : ''} escrevendo!` : 'Comece sua sequência!'}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {days > 0 ? 'Continue assim para não perder o ritmo.' : 'Envie uma redação hoje.'}
            </p>
        </div>
    </div>
);

const StateRanking = ({ rank, state }: { rank: number | null, state: string | null }) => (
     <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center gap-4">
        <div className="text-4xl text-yellow-500">
            <i className="fas fa-trophy"></i>
        </div>
        <div>
            <h4 className="font-bold dark:text-white">
                {rank && state ? `Você está em #${rank} no ranking de ${state}!` : 'Ranking Indisponível'}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {rank && state ? 'Sua média está entre as melhores.' : 'Continue escrevendo para aparecer aqui.'}
            </p>
        </div>
    </div>
);

const ActionShortcuts = () => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h4 className="font-bold mb-3 dark:text-white">Atalhos</h4>
        <div className="space-y-2">
            <Link href="/dashboard/applications/test" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <i className="fas fa-file-alt w-5 text-center text-royal-blue"></i>
                <span className="text-sm font-medium dark:text-gray-200">Testar seu conhecimento em gramática</span>
            </Link>
             <Link href="/dashboard/applications/day" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <i className="fas fa-calendar-check w-5 text-center text-royal-blue"></i>
                <span className="text-sm font-medium dark:text-gray-200">Agendar redação no Facillit Day</span>
            </Link>
             <Link href="/dashboard/applications/library" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <i className="fas fa-book-open w-5 text-center text-royal-blue"></i>
                <span className="text-sm font-medium dark:text-gray-200">Ver argumentos coringas na Library</span>
            </Link>
        </div>
    </div>
);


export default function StudentDashboard({ initialEssays, prompts, statistics, streak, rankInfo }: Props) {
  const [essays, setEssays] = useState(initialEssays);
  const [view, setView] = useState<'dashboard' | 'edit' | 'view_correction'>('dashboard');
  const [currentEssay, setCurrentEssay] = useState<Partial<Essay> | null>(null);

  const handleSelectEssay = (essay: Partial<Essay>) => {
    setCurrentEssay(essay);
    setView(essay.status === 'draft' ? 'edit' : 'view_correction');
  };

  const handleCreateNew = () => {
    setCurrentEssay(null);
    setView('edit');
  };

  const handleBackToDashboard = async () => {
    const result = await getEssaysForStudent();
    if (result.data) setEssays(result.data); 
    setView('dashboard');
    setCurrentEssay(null);
  };

  if (view === 'edit') return <EssayEditor essay={currentEssay} prompts={prompts} onBack={handleBackToDashboard} />;
  if (view === 'view_correction' && currentEssay?.id) return <EssayCorrectionView essayId={currentEssay.id} onBack={handleBackToDashboard} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dark-text dark:text-white">Meu Desempenho em Redação</h1>
        <button onClick={handleCreateNew} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">
          <i className="fas fa-plus mr-2"></i> Nova Redação
        </button>
      </div>
      
      {/* Novos Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <WritingStreak days={streak} />
          <StateRanking rank={rankInfo?.rank ?? null} state={rankInfo?.state ?? null} />
          <ActionShortcuts />
      </div>

      {/* Seção de estatísticas com verificação de nulo */}
      {statistics ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-1">
                <StatisticsWidget stats={statistics} />
              </div>
              <div className="lg:col-span-2">
                <ProgressionChart data={statistics.progression} />
              </div>
          </div>
      ) : (
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
              <p className="dark:text-white">Envie sua primeira redação para começar a ver suas estatísticas e progresso!</p>
          </div>
      )}

      {/* Histórico de Redações */}
      <div>
        <h2 className="text-2xl font-bold text-dark-text dark:text-white mb-4">Histórico de Redações</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <ul className="divide-y dark:divide-gray-700">
                {essays.length > 0 ? essays.map(essay => (
                  <li key={essay.id} onClick={() => handleSelectEssay(essay)} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center">
                    <div>
                      <p className="font-bold text-dark-text dark:text-white">{essay.title || "Redação sem título"}</p>
                      <p className="text-sm text-gray-500">{essay.status === 'draft' ? 'Rascunho' : `Enviada em: ${new Date(essay.submitted_at!).toLocaleDateString()}`}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${essay.status === 'corrected' ? 'bg-green-100 text-green-800' : essay.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                      {essay.status === 'corrected' ? 'Corrigida' : essay.status === 'submitted' ? 'Aguardando correção' : 'Rascunho'}
                    </span>
                  </li>
                )) : (<p className="p-4 text-center text-gray-500">Você ainda não tem nenhuma redação. Comece uma nova!</p>)}
            </ul>
        </div>
      </div>
    </div>
  );
}