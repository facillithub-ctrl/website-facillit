"use client";

import { useState, useEffect } from 'react';
import CreateTestModal from './CreateTestModal';
import TestDetailView from './TestDetailView';
import { getTestWithQuestions } from '../actions';
import type { Test, TestWithQuestions } from '../actions';
import { useToast } from '@/contexts/ToastContext';
import createClient from '@/utils/supabase/client';
import type { UserProfile } from '@/app/dashboard/types';

// Tipos de dados aprimorados para o dashboard do professor
type SchoolClass = {
  id: string;
  name: string;
};

type AggregatedClassStats = {
    class_id: string;
    class_name: string;
    average_score: number;
    total_attempts: number;
    hardest_axis: string | null;
    easiest_axis: string | null;
};

type Props = {
  initialTests: Test[];
  userProfile: UserProfile;
};

// --- SUB-COMPONENTES PARA O NOVO DASHBOARD ---

// Card de Estatísticas da Turma
const ClassStatCard = ({ stats, onSelectClass }: { stats: AggregatedClassStats, onSelectClass: (classId: string) => void }) => (
    <div className="glass-card p-5 cursor-pointer hover:border-royal-blue transition-all" onClick={() => onSelectClass(stats.class_id)}>
        <h3 className="font-bold text-lg text-dark-text dark:text-white">{stats.class_name}</h3>
        <div className="grid grid-cols-2 gap-4 mt-4 text-center">
            <div>
                <p className="text-2xl font-bold text-royal-blue">{stats.average_score.toFixed(0)}%</p>
                <p className="text-xs text-dark-text-muted">Média Geral</p>
            </div>
            <div>
                <p className="text-2xl font-bold text-royal-blue">{stats.total_attempts}</p>
                <p className="text-xs text-dark-text-muted">Simulados Feitos</p>
            </div>
        </div>
        <div className="mt-4 text-sm space-y-2">
            <p><strong className="text-red-500">Maior Dificuldade:</strong> {stats.hardest_axis || 'N/A'}</p>
            <p><strong className="text-green-500">Maior Facilidade:</strong> {stats.easiest_axis || 'N/A'}</p>
        </div>
         <p className="text-center text-xs text-royal-blue font-bold mt-4">Ver detalhes</p>
    </div>
);


// --- COMPONENTE PRINCIPAL ---

export default function TeacherTestDashboard({ initialTests, userProfile }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tests] = useState(initialTests);
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'analytics'>('list');
  const [selectedTest, setSelectedTest] = useState<TestWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [classStats, setClassStats] = useState<AggregatedClassStats[]>([]);
  
  const isInstitutional = !!userProfile.organization_id;

  // Efeito para buscar turmas e estatísticas agregadas
  useEffect(() => {
    if (isInstitutional) {
      const fetchInitialData = async () => {
        setIsLoading(true);
        const supabase = createClient();
        
        // 1. Buscar as turmas do professor
        const { data: classData, error: classError } = await supabase
          .from('class_members')
          .select('school_classes(id, name)')
          .eq('user_id', userProfile.id)
          .eq('role', 'teacher');

        if (classError) {
          console.error("Erro ao buscar turmas:", classError);
          addToast({ title: "Erro", message: "Não foi possível carregar suas turmas.", type: "error" });
        } else if (classData) {
          // LINHA CORRIGIDA ABAIXO
          const mappedClasses = classData
            .map(item => item.school_classes)
            .filter((c): c is SchoolClass => c !== null && c !== undefined);
            
          setClasses(mappedClasses);

          // 2. Buscar estatísticas para cada turma encontrada
          if(mappedClasses.length > 0) {
            const classIds = mappedClasses.map(c => c.id);
            const { data: statsData, error: statsError } = await supabase.rpc('get_class_performance_summary', { p_class_ids: classIds });

            if(statsError) {
                console.error("Erro ao buscar estatísticas das turmas:", statsError);
            } else {
                setClassStats(statsData || []);
            }
          }
        }
        setIsLoading(false);
      };

      fetchInitialData();
    }
  }, [isInstitutional, userProfile.id, addToast]);

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

  const renderMainContent = () => {
    if (isLoading) {
      return <div className="text-center p-8">Carregando dados do professor...</div>;
    }
    
    if (currentView === 'detail' && selectedTest) {
      return <TestDetailView test={selectedTest} onBack={handleBackToList} onStartTest={handleStartTest} />;
    }

    return (
        <div className="space-y-12">
            {isInstitutional && classStats.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold mb-4 text-dark-text dark:text-white">Visão Geral das Turmas</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classStats.map(stat => (
                            <ClassStatCard key={stat.class_id} stats={stat} onSelectClass={() => alert(`Em breve: Painel de análise detalhada para a turma: ${stat.class_name}`)} />
                        ))}
                    </div>
                </div>
            )}

            <div>
              <h2 className="text-2xl font-bold mb-4 text-dark-text dark:text-white">Minhas Avaliações</h2>
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
                               {test.class_id && (
                                   <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full self-start mt-1">
                                      Turma Específica
                                  </span>
                               )}
                              <p className="text-sm text-gray-500 mt-1 flex-grow">
                                  {test.description || 'Nenhuma descrição fornecida.'}
                              </p>
                              <div className="text-xs text-gray-400 mt-4">
                                  Criado em {new Date(test.created_at).toLocaleDateString('pt-BR')}
                              </div>
                              <div className="mt-4 border-t dark:border-gray-700 pt-3 flex justify-end gap-3">
                                  <button onClick={() => alert("Em breve: Visualizar resultados detalhados dos alunos para este teste.")} className="text-green-600 hover:underline text-sm font-semibold">Resultados</button>
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
  };

  return (
    <div>
      {isModalOpen && <CreateTestModal onClose={() => setIsModalOpen(false)} classes={classes} isInstitutional={isInstitutional} />}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dark-text dark:text-white">Gerenciador de Avaliações</h1>
        <div className="flex gap-2">
            <button 
                onClick={() => alert("Em breve: Criação e gestão de Campanhas.")}
                className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90"
            >
                <i className="fas fa-trophy mr-2"></i> Campanhas
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90"
            >
              <i className="fas fa-plus mr-2"></i> Nova Avaliação
            </button>
        </div>
      </div>
      
      <p className="text-text-muted dark:text-gray-400 mb-6">Crie, atribua e analise o desempenho de suas turmas.</p>
      
      {renderMainContent()}
    </div>
  );
}