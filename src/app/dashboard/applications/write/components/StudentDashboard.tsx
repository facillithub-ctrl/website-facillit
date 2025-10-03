"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Essay, EssayPrompt, getEssaysForStudent } from '../actions';
import EssayEditor from './EssayEditor';
import EssayCorrectionView from './EssayCorrectionView';
import StatisticsWidget from './StatisticsWidget';
import ProgressionChart from './ProgressionChart';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
};

// --- WIDGETS E SUB-COMPONENTES ---

const WritingStreak = ({ days }: { days: number }) => (
    <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-md border dark:border-dark-border flex items-center gap-4">
        <div className={`text-4xl ${days > 0 ? 'animate-bounce text-orange-500' : 'text-gray-400'}`}><i className="fas fa-fire"></i></div>
        <div>
            <h4 className="font-bold dark:text-white-text">{days > 0 ? `Você está há ${days} dia${days > 1 ? 's' : ''} escrevendo!` : 'Comece sua sequência!'}</h4>
            <p className="text-sm text-gray-500 dark:text-dark-text-muted">{days > 0 ? 'Continue assim para não perder o ritmo.' : 'Envie uma redação hoje.'}</p>
        </div>
    </div>
);

const StateRanking = ({ rank, state }: { rank: number | null, state: string | null }) => (
     <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-md border dark:border-dark-border flex items-center gap-4">
        <div className="text-4xl text-yellow-500"><i className="fas fa-trophy"></i></div>
        <div>
            <h4 className="font-bold dark:text-white-text">{rank && state ? `Você está em #${rank} no ranking de ${state}!` : 'Ranking Indisponível'}</h4>
            <p className="text-sm text-gray-500 dark:text-dark-text-muted">{rank && state ? 'A sua média está entre as melhores.' : 'Continue escrevendo para aparecer aqui.'}</p>
        </div>
    </div>
);

const ActionShortcuts = () => (
    <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-md border dark:border-dark-border">
        <h4 className="font-bold mb-3 dark:text-white-text">Atalhos</h4>
        <div className="space-y-2">
            <Link href="/dashboard/applications/test" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-dark-card/50">
                <i className="fas fa-file-alt w-5 text-center text-royal-blue"></i>
                <span className="text-sm font-medium dark:text-gray-200">Testar seu conhecimento em gramática</span>
            </Link>
             <Link href="/dashboard/applications/day" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-dark-card/50">
                <i className="fas fa-calendar-check w-5 text-center text-royal-blue"></i>
                <span className="text-sm font-medium dark:text-gray-200">Agendar redação no Facillit Day</span>
            </Link>
             <Link href="/dashboard/applications/library" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-dark-card/50">
                <i className="fas fa-book-open w-5 text-center text-royal-blue"></i>
                <span className="text-sm font-medium dark:text-gray-200">Ver argumentos coringas na Library</span>
            </Link>
        </div>
    </div>
);

const FrequentErrorsChart = ({ data }: { data: FrequentError[] }) => {
  if (!data || data.length === 0) return null;

  const COLORS = ['#2E14ED', '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md border dark:border-dark-border col-span-1 lg:col-span-2">
      <h3 className="font-bold text-lg mb-4 dark:text-white-text">Seus Erros Frequentes</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="error_type"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
             contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#2f2f2f', borderRadius: '0.5rem' }}
          />
          <Legend iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};


const CurrentEventsWidget = ({ events }: { events: CurrentEvent[] }) => {
  if (!events || events.length === 0) return null;
  return (
    <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md border dark:border-dark-border">
      <h3 className="font-bold text-lg mb-4 dark:text-white-text">Fique por Dentro</h3>
      <ul className="space-y-3">
        {events.map(event => (
          <li key={event.id}>
            <a href={event.link} target="_blank" rel="noopener noreferrer" className="block p-2 rounded-md hover:bg-gray-50 dark:hover:bg-dark-card/50">
              <p className="font-semibold text-sm text-royal-blue">{event.title}</p>
              {event.summary && <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">{event.summary}</p>}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL ---

export default function StudentDashboard({ initialEssays, prompts, statistics, streak, rankInfo, frequentErrors, currentEvents }: Props) {
  const [essays, setEssays] = useState(initialEssays);
  const [view, setView] = useState<'dashboard' | 'edit' | 'view_correction'>('dashboard');
  const [currentEssay, setCurrentEssay] = useState<Partial<Essay> | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const essayIdFromUrl = searchParams.get('essayId');
    if (essayIdFromUrl) {
      const essayToOpen = initialEssays.find(e => e.id === essayIdFromUrl);
      if (essayToOpen) {
        handleSelectEssay(essayToOpen);
      }
    }
  }, [searchParams, initialEssays]);

  const handleSelectEssay = (essay: Partial<Essay>) => {
    setCurrentEssay(essay);
    setView(essay.status === 'corrected' ? 'view_correction' : 'edit');
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <WritingStreak days={streak} />
          <StateRanking rank={rankInfo?.rank ?? null} state={rankInfo?.state ?? null} />
          <ActionShortcuts />
      </div>

      {statistics ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-1"><StatisticsWidget stats={statistics} /></div>
              <div className="lg:col-span-2"><ProgressionChart data={statistics.progression} /></div>
          </div>
      ) : (
          <div className="text-center p-8 bg-white dark:bg-dark-card rounded-lg shadow-md border dark:border-dark-border mb-6">
              <p className="dark:text-white-text">Envie sua primeira redação para começar a ver suas estatísticas e progresso!</p>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <FrequentErrorsChart data={frequentErrors} />
        <CurrentEventsWidget events={currentEvents} />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-dark-text dark:text-white-text mb-4">Histórico de Redações</h2>
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md border dark:border-dark-border p-4">
            <ul className="divide-y dark:divide-dark-border">
                {essays.length > 0 ? essays.map(essay => (
                  <li key={essay.id} onClick={() => handleSelectEssay(essay)} className="p-4 hover:bg-gray-50 dark:hover:bg-dark-card/50 cursor-pointer flex justify-between items-center">
                    <div>
                      <p className="font-bold text-dark-text dark:text-white-text">{essay.title || "Redação sem título"}</p>
                      <p className="text-sm text-gray-500 dark:text-dark-text-muted">{essay.status === 'draft' ? 'Rascunho' : `Enviada em: ${new Date(essay.submitted_at!).toLocaleDateString()}`}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${essay.status === 'corrected' ? 'bg-green-100 text-green-800' : essay.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                      {essay.status === 'corrected' ? 'Corrigida' : essay.status === 'submitted' ? 'Aguardando correção' : 'Rascunho'}
                    </span>
                  </li>
                )) : (<p className="p-4 text-center text-gray-500 dark:text-dark-text-muted">Você ainda não tem nenhuma redação. Comece uma nova!</p>)}
            </ul>
        </div>
      </div>
    </div>
  );
}