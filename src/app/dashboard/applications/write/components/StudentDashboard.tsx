"use client";

import { useState } from 'react';
import { Essay, EssayPrompt, getEssaysForStudent } from '../actions';
import EssayEditor from './EssayEditor';
import EssayCorrectionView from './EssayCorrectionView';
import StatisticsWidget from './StatisticsWidget';
import ProgressionChart from './ProgressionChart';

// Define o tipo para as estatísticas, permitindo que seja nulo
type Stats = {
    totalCorrections: number;
    averages: { avg_final_grade: number; avg_c1: number; avg_c2: number; avg_c3: number; avg_c4: number; avg_c5: number; };
    pointToImprove: { name: string; average: number; };
    progression: { date: string; grade: number; }[];
} | null;

type Props = {
  initialEssays: Partial<Essay>[];
  prompts: EssayPrompt[];
  statistics: Stats; // Recebe as estatísticas como prop
};

export default function StudentDashboard({ initialEssays, prompts, statistics }: Props) {
  const [essays, setEssays] = useState(initialEssays);
  const [view, setView] = useState<'dashboard' | 'edit' | 'view_correction'>('dashboard');
  const [currentEssay, setCurrentEssay] = useState<Partial<Essay> | null>(null);

  const handleSelectEssay = (essay: Partial<Essay>) => {
    setCurrentEssay(essay);
    if (essay.status === 'draft') {
      setView('edit');
    } else {
      setView('view_correction');
    }
  };

  const handleCreateNew = () => {
    setCurrentEssay(null);
    setView('edit');
  };

  const handleBackToDashboard = async () => {
    const result = await getEssaysForStudent();
    if (result.data) {
      setEssays(result.data); 
    }
    setView('dashboard');
    setCurrentEssay(null);
    // Para uma experiência ainda melhor, você poderia revalidar os dados da página
    // e recarregar as estatísticas aqui.
  };

  if (view === 'edit') {
    return <EssayEditor essay={currentEssay} prompts={prompts} onBack={handleBackToDashboard} />;
  }

  if (view === 'view_correction' && currentEssay?.id) {
    return <EssayCorrectionView essayId={currentEssay.id} onBack={handleBackToDashboard} />;
  }

  // TELA PRINCIPAL DO DASHBOARD DO ALUNO
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dark-text dark:text-white">Meu Desempenho em Redação</h1>
        <button onClick={handleCreateNew} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">
          <i className="fas fa-plus mr-2"></i> Nova Redação
        </button>
      </div>

      {statistics ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <StatisticsWidget stats={statistics} />
              <ProgressionChart data={statistics.progression} />
          </div>
      ) : (
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
              <p className="dark:text-white">Envie sua primeira redação para começar a ver suas estatísticas e progresso!</p>
          </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-dark-text dark:text-white mb-4">Histórico de Redações</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <ul className="divide-y dark:divide-gray-700">
                {essays.length > 0 ? essays.map(essay => (
                  <li key={essay.id} onClick={() => handleSelectEssay(essay)} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center">
                    <div>
                      <p className="font-bold text-dark-text dark:text-white">{essay.title || "Redação sem título"}</p>
                      <p className="text-sm text-gray-500">
                        {essay.status === 'draft' ? 'Rascunho' : `Enviada em: ${new Date(essay.submitted_at!).toLocaleDateString()}`}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        essay.status === 'corrected' ? 'bg-green-100 text-green-800' : 
                        essay.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {essay.status === 'corrected' ? 'Corrigida' : essay.status === 'submitted' ? 'Enviada' : 'Rascunho'}
                    </span>
                  </li>
                )) : (
                  <p className="p-4 text-center text-gray-500">Você ainda não tem nenhuma redação. Comece uma nova!</p>
                )}
            </ul>
        </div>
      </div>
    </div>
  );
}