"use client";

import { useState, useEffect } from 'react';
import CreateTestModal from './CreateTestModal';
import TestDetailView from './TestDetailView';
import { getTestWithQuestions } from '../actions';
import type { Test, TestWithQuestions } from '../actions';
import { useToast } from '@/contexts/ToastContext';
import createClient from '@/utils/supabase/client';
import type { UserProfile } from '@/app/dashboard/types'; // Importar UserProfile

type Props = {
  initialTests: Test[];
  userProfile: UserProfile; // MODIFICAÇÃO: Receber o perfil do usuário
};

type SchoolClass = {
  id: string;
  name: string;
};

export default function TeacherTestDashboard({ initialTests, userProfile }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tests] = useState(initialTests);
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedTest, setSelectedTest] = useState<TestWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  
  // MODIFICAÇÃO: Verifica se a conta é institucional
  const isInstitutional = !!userProfile.organization_id;

  useEffect(() => {
    // Busca as turmas apenas se for um professor institucional
    if (isInstitutional) {
      const fetchClasses = async () => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('class_members')
          .select('school_classes(id, name)')
          .eq('user_id', userProfile.id)
          .eq('role', 'teacher');

        if (error) {
          console.error("Erro ao buscar turmas do professor:", error);
        } else if (data) {
          // Mapeia os dados para o formato esperado
          const mappedClasses = data.map(item => item.school_classes).filter(Boolean) as SchoolClass[];
          setClasses(mappedClasses);
        }
      };

      fetchClasses();
    }
  }, [isInstitutional, userProfile.id]);

  const handleViewDetails = async (testId: string) => {
    setIsLoading(true);
    const { data, error } = await getTestWithQuestions(testId);
    if (error) {
      addToast({ title: "Erro ao Carregar", message: "Não foi possível carregar os detalhes da avaliação.", type: 'error' });
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
  
  const handleStartTest = () => {
    addToast({ title: "Ação de Aluno", message: "Professores não iniciam simulados, apenas visualizam.", type: 'error'});
  };

  if (isLoading) {
    return <div className="text-center p-8">Carregando...</div>;
  }
  
  if (currentView === 'detail' && selectedTest) {
    return <TestDetailView test={selectedTest} onBack={handleBackToList} onStartTest={handleStartTest} />;
  }

  return (
    <div>
      {isModalOpen && <CreateTestModal onClose={() => setIsModalOpen(false)} classes={classes} isInstitutional={isInstitutional} />}

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
      
      <div>
        <h2 className="text-xl font-bold mb-4 text-dark-text dark:text-white">Minhas Avaliações</h2>
        {tests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tests.map(test => (
                    <div key={test.id} className="bg-white dark:bg-dark-card rounded-lg shadow p-5 flex flex-col">
                        <div className="flex items-start justify-between">
                            <h3 
                                className="font-bold text-lg text-dark-text dark:text-white cursor-pointer hover:underline pr-2"
                                onClick={() => handleViewDetails(test.id)}
                            >
                                {test.title}
                            </h3>
                            {test.is_knowledge_test && (
                                <span className="text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full flex-shrink-0">
                                    Conhecimento
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1 flex-grow">
                            {test.description || 'Nenhuma descrição fornecida.'}
                        </p>
                        <div className="text-xs text-gray-400 mt-4">
                            Criado em {new Date(test.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="mt-4 border-t dark:border-gray-700 pt-3 flex justify-end gap-3">
                            <button onClick={() => handleViewDetails(test.id)} className="text-royal-blue hover:underline text-sm font-semibold">Ver Detalhes</button>
                            <button onClick={() => addToast({ title: "Em Breve", message: "A função de excluir ainda está em desenvolvimento.", type: 'error'})} className="text-red-500 hover:underline text-sm font-semibold">Excluir</button>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="p-8 text-center border-2 border-dashed rounded-lg bg-white dark:bg-dark-card">
                <h2 className="text-xl font-bold mb-2">Nenhuma avaliação criada</h2>
                <p className="text-sm text-gray-500">
                    Clique em &quot;Nova Avaliação&quot; para começar.
                </p>
            </div>
        )}
      </div>
    </div>
  );
}