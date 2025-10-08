"use client";

import { useState } from 'react';
import CreateTestModal from './CreateTestModal';
import TestDetailView from './TestDetailView'; // Importa a nova view
import { getTestWithQuestions } from '../actions'; // Importa a nova action
import type { Test, TestWithQuestions } from '../actions';

type Props = {
  initialTests: Test[];
};

export default function TeacherTestDashboard({ initialTests }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tests] = useState(initialTests);

  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedTest, setSelectedTest] = useState<TestWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleViewDetails = async (testId: string) => {
    setIsLoading(true);
    const { data, error } = await getTestWithQuestions(testId);
    if (error) {
      alert("Erro ao carregar detalhes da avaliação: " + error);
    } else if (data) {
      setSelectedTest(data);
      setCurrentView('detail');
    }
    setIsLoading(false);
  };

  const handleBackToList = () => {
    setSelectedTest(null);
    setCurrentView('list');
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }
  
  if (currentView === 'detail' && selectedTest) {
    return <TestDetailView test={selectedTest} onBack={handleBackToList} />;
  }

  return (
    <div>
      {isModalOpen && <CreateTestModal onClose={() => setIsModalOpen(false)} />}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dark-text dark:text-white">Gerenciador de Avaliações</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90"
        >
          <i className="fas fa-plus mr-2"></i> Nova Avaliação
        </button>
      </div>
      
      <p className="text-text-muted dark:text-gray-400 mb-6">Crie, atribua e analise o desempenho de suas turmas.</p>
      
      <div className="bg-white dark:bg-dark-card rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4 px-2 text-dark-text dark:text-white">Minhas Avaliações</h2>
        <ul className="divide-y dark:divide-gray-700">
          {tests.length > 0 ? tests.map(test => (
            <li 
              key={test.id} 
              className="p-4 flex justify-between items-center"
            >
              <div 
                className="cursor-pointer hover:underline"
                onClick={() => handleViewDetails(test.id)}
              >
                <p className="font-bold text-dark-text dark:text-white">{test.title}</p>
                <p className="text-sm text-gray-500">
                  Criado em {new Date(test.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="space-x-2">
                <button onClick={() => alert("Função de editar em desenvolvimento.")} className="text-blue-500 hover:underline text-sm">Editar</button>
                <button onClick={() => alert("Função de excluir em desenvolvimento.")} className="text-red-500 hover:underline text-sm">Excluir</button>
              </div>
            </li>
          )) : (
            <p className="p-4 text-center text-gray-500">Nenhuma avaliação criada ainda. Clique em "Nova Avaliação" para começar.</p>
          )}
        </ul>
      </div>
    </div>
  );
}