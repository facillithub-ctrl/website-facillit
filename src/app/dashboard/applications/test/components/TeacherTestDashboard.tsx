"use client";

import { useState, useEffect, useTransition, useCallback } from 'react';
import CreateTestModal from './CreateTestModal';
import TestDetailView from './TestDetailView';
import { getTestWithQuestions, getTestsForTeacher, deleteCampaign, Campaign, Test, getResultsForTeacher } from '../actions';
import type { TestWithQuestions } from '../actions';
import { useToast } from '@/contexts/ToastContext';
import createClient from '@/utils/supabase/client';
import type { UserProfile } from '@/app/dashboard/types';
import CampaignManager from './CampaignManager';
import ResultsDashboard from './ResultsDashboard';
import ClassAnalytics from './ClassAnalytics';
import SurveyResultsView from './SurveyResultsView'; // A importação deve ser default

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

type Result = {
  id: string;
  student_name: string;
  test_title: string;
  score: number;
  date: string;
  class_id?: string;
  class_name?: string | null;
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
  const [tests, setTests] = useState(initialTests);
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'analytics' | 'campaigns' | 'results' | 'class-analytics' | 'survey-results'>('list');
  const [selectedTest, setSelectedTest] = useState<TestWithQuestions | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [classStats, setClassStats] = useState<AggregatedClassStats[]>([]);
  const [resultsData, setResultsData] = useState<Result[]>([]);
  
  const isInstitutional = !!userProfile.organization_id;

  const refreshTests = async () => {
      const { data } = await getTestsForTeacher();
      setTests(data || []);
  };

  useEffect(() => {
    if (isInstitutional) {
      const fetchInitialData = async () => {
        setIsLoading(true);
        const supabase = createClient();
        
        const { data: classData, error: classError } = await supabase
          .from('class_members')
          .select('school_classes(id, name)')
          .eq('user_id', userProfile.id)
          .eq('role', 'teacher');

        if (classError) {
          console.error("Erro ao buscar turmas:", classError);
          addToast({ title: "Erro", message: "Não foi possível carregar suas turmas.", type: "error" });
        } else if (classData) {
          const mappedClasses = classData
            .map(item => {
              const sc = item.school_classes;
              return Array.isArray(sc) ? sc[0] : sc;
            })
            .filter((c): c is SchoolClass => !!c);
            
          setClasses(mappedClasses);
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

  const handleViewResults = async () => {
    setIsLoading(true);
    const { data, error } = await getResultsForTeacher();
    if (error) {
        addToast({ title: "Erro", message: "Não foi possível carregar os resultados.", type: "error" });
    } else {
        setResultsData(data || []);
        setCurrentView('results');
    }
    setIsLoading(false);
  };

  const handleViewSurveyResults = (test: Test) => {
      setSelectedTest(test as TestWithQuestions);
      setCurrentView('survey-results');
  };

  const handleBackToList = () => {
    setSelectedTest(null);
    setSelectedClassId(null);
    setCurrentView('list');
  };
  
  const handleStartTest = () => {
    addToast({ title: "Ação de Aluno", message: "Professores não iniciam simulados, apenas visualizam.", type: 'error'});
  };

  const handleSelectClass = (classId: string) => {
    setSelectedClassId(classId);
    setCurrentView('class-analytics');
  };

  const renderMainContent = () => {
    if (isLoading) {
      return <div className="text-center p-8">Carregando dados do professor...</div>;
    }
    
    if (currentView === 'detail' && selectedTest) {
      return <TestDetailView test={selectedTest} onBack={handleBackToList} onStartTest={handleStartTest} />;
    }
    if (currentView === 'class-analytics' && selectedClassId) {
      return <ClassAnalytics classId={selectedClassId} onBack={handleBackToList} />;
    }
    if (currentView === 'campaigns') {
      return <CampaignManager />;
    }
    if (currentView === 'results') {
      return <ResultsDashboard results={resultsData} onViewDetails={handleViewDetails} />;
    }
    if (currentView === 'survey-results' && selectedTest) {
      return <SurveyResultsView testId={selectedTest.id} testTitle={selectedTest.title} onBack={handleBackToList} />;
    }
    return (
        <div className="space-y-12">
            {isInstitutional && classStats.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold mb-4 text-dark-text dark:text-white">Visão Geral das Turmas</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classStats.map(stat => (
                            <ClassStatCard key={stat.class_id} stats={stat} onSelectClass={handleSelectClass} />
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
                                  {test.test_type === 'pesquisa' ? (
                                    <span className="text-xs font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full flex-shrink-0">
                                      Pesquisa
                                    </span>
                                  ) : test.is_knowledge_test && (
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
                                  {test.test_type === 'pesquisa' ? (
                                      <button onClick={() => handleViewSurveyResults(test)} className="text-green-600 hover:underline text-sm font-semibold">Resultados</button>
                                  ) : (
                                      <button onClick={() => handleViewResults()} className="text-green-600 hover:underline text-sm font-semibold">Resultados</button>
                                  )}
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
      {isModalOpen && <CreateTestModal onClose={() => {setIsModalOpen(false); refreshTests();}} classes={classes} isInstitutional={isInstitutional} />}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dark-text dark:text-white">Gerenciador de Avaliações</h1>
        <div className="flex gap-2">
             <button 
                onClick={() => handleViewResults()}
                className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90"
            >
                <i className="fas fa-chart-bar mr-2"></i> Resultados
            </button>
            <button 
                onClick={() => setCurrentView('campaigns')}
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