"use client";

import { useState } from 'react';
// Adicione a nova função getEssaysForStudent ao import
import { Essay, EssayPrompt, getEssaysForStudent } from '../actions';
import EssayEditor from './EssayEditor';
import EssayCorrectionView from './EssayCorrectionView';

type Props = {
  initialEssays: Partial<Essay>[];
  prompts: EssayPrompt[];
};

export default function StudentDashboard({ initialEssays, prompts }: Props) {
  // O estado 'essays' agora será a fonte da verdade para a lista
  const [essays, setEssays] = useState(initialEssays);
  const [view, setView] = useState<'list' | 'edit' | 'view_correction'>('list');
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

  // Função ATUALIZADA para recarregar os dados
  const handleBackToList = async () => {
    const result = await getEssaysForStudent();
    if (result.data) {
      setEssays(result.data); // Atualiza a lista com os dados mais recentes
    }
    setView('list');
    setCurrentEssay(null);
  };

  if (view === 'edit') {
    // Passamos a função atualizada para o editor
    return <EssayEditor essay={currentEssay} prompts={prompts} onBack={handleBackToList} />;
  }

  if (view === 'view_correction' && currentEssay?.id) {
    return <EssayCorrectionView essayId={currentEssay.id} onBack={handleBackToList} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dark-text dark:text-white">Minhas Redações</h1>
        <button onClick={handleCreateNew} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">
          <i className="fas fa-plus mr-2"></i> Nova Redação
        </button>
      </div>
      
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
  );
}