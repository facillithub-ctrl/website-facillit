"use client";

import { useState } from 'react';
import CorrectionInterface from './CorrectionInterface';
import EssayCorrectionView from './EssayCorrectionView';
import type { UserProfile } from '@/app/dashboard/types'; // MODIFICAÇÃO: Importar UserProfile

type EssayListItem = {
  id: string;
  title: string | null;
  submitted_at: string | null;
  profiles: { full_name: string | null; } | null;
  essay_corrections?: { final_grade: number }[] | null;
};

type TeacherDashboardProps = {
  userProfile: UserProfile; // MODIFICAÇÃO: Adicionar userProfile
  pendingEssays: EssayListItem[];
  correctedEssays: EssayListItem[];
};

export default function TeacherDashboard({ userProfile, pendingEssays, correctedEssays }: TeacherDashboardProps) {
  const [view, setView] = useState<'list' | 'correct' | 'view_correction'>('list');
  const [selectedEssayId, setSelectedEssayId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'corrected'>('pending');
  
  // MODIFICAÇÃO: Identificar se o professor é institucional
  const isInstitutional = !!userProfile.organization_id;

  const handleSelectEssay = (essayId: string, status: 'pending' | 'corrected') => {
    setSelectedEssayId(essayId);
    setView(status === 'pending' ? 'correct' : 'view_correction');
  };

  const handleBack = () => {
    setSelectedEssayId(null);
    setView('list');
    // Idealmente, aqui você faria um router.refresh() para recarregar a lista
  };

  if (view === 'correct' && selectedEssayId) {
    return <CorrectionInterface essayId={selectedEssayId} onBack={handleBack} />;
  }

  if (view === 'view_correction' && selectedEssayId) {
    return <EssayCorrectionView essayId={selectedEssayId} onBack={handleBack} />;
  }
  
  const essaysToShow = activeTab === 'pending' ? pendingEssays : correctedEssays;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dark-text dark:text-white">Painel do Corretor</h1>
        {/* MODIFICAÇÃO: Botão de criar temas (futuramente abrirá um modal) */}
        <button 
            className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90"
            onClick={() => alert('Em breve: Modal para criar temas globais ou para turmas específicas.')}
        >
          <i className="fas fa-plus mr-2"></i> Novo Tema de Redação
        </button>
      </div>
      {isInstitutional && (
          <p className="text-sm text-text-muted mb-6">Você está visualizando as redações da sua instituição: <strong>{userProfile.schoolName}</strong>.</p>
      )}

      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('pending')}
            className={`${activeTab === 'pending' ? 'border-royal-blue text-royal-blue' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm`}
          >
            Pendentes ({pendingEssays.length})
          </button>
          <button
            onClick={() => setActiveTab('corrected')}
            className={`${activeTab === 'corrected' ? 'border-royal-blue text-royal-blue' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm`}
          >
            Corrigidas ({correctedEssays.length})
          </button>
        </nav>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-lg shadow p-4">
        <ul className="divide-y dark:divide-gray-700">
          {essaysToShow.length > 0 ? essaysToShow.map(essay => (
            <li 
              key={essay.id} 
              onClick={() => handleSelectEssay(essay.id, activeTab)} 
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-dark-text dark:text-white">{essay.title || "Redação sem título"}</p>
                  <p className="text-sm text-gray-500">
                    Enviada por {essay.profiles?.full_name || 'Aluno desconhecido'} em {new Date(essay.submitted_at!).toLocaleDateString()}
                  </p>
                </div>
                {activeTab === 'corrected' && (
                  <div className="text-right">
                    <p className="font-bold text-lg text-royal-blue">{essay.essay_corrections?.[0]?.final_grade ?? 'N/A'}</p>
                    <p className="text-xs text-gray-500">Nota Final</p>
                  </div>
                )}
              </div>
            </li>
          )) : (
            <p className="p-4 text-center text-gray-500">Nenhuma redação nesta categoria.</p>
          )}
        </ul>
      </div>
    </div>
  );
}