"use client";

import React, { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid
} from "recharts";
import AvailableTestCard from "./AvailableTestCard";
import AttemptView from "./AttemptView";
import TestDetailView from "./TestDetailView";
import ResultsView from "./ResultsView";
import { 
    getTestWithQuestions, 
    type TestWithQuestions, 
    getQuickTest, 
    getStudentResultsHistory 
} from '../actions';

// --- TIPOS ---
type TestCardInfo = {
  id: string;
  title: string;
  subject: string | null;
  question_count: number;
  duration_minutes: number;
  difficulty: "Fácil" | "Médio" | "Difícil";
  hasAttempted: boolean;
};

type KnowledgeTest = {
  id: string;
  title: string;
  subject: string | null;
  questions: { count: number }[];
};

type PerformanceData = { materia: string; nota: number; simulados: number };

type RecentAttempt = {
  tests: { title: string; subject: string | null }[] | null;
  completed_at: string;
  score: number | null;
};

type DashboardData = {
  stats: {
    simuladosFeitos: number;
    mediaGeral: number;
    taxaAcerto: number;
  };
  performanceBySubject: PerformanceData[];
  recentAttempts: RecentAttempt[];
};

type AttemptHistory = {
  id: string;
  completed_at: string | null;
  score: number | null;
  tests: {
    title: string | null;
    subject: string | null;
    questions: { count: number }[] | null;
  } | null;
};

type Props = {
  dashboardData: DashboardData | null;
  initialAvailableTests: TestCardInfo[];
  knowledgeTests: KnowledgeTest[];
};


// --- SUB-COMPONENTES ---

const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: string }) => (
    <div className="glass-card p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-dark-text-muted">{title}</p>
        <p className="text-2xl font-bold text-dark-text dark:text-white">{value}</p>
      </div>
      <div className="text-3xl text-lavender-blue">
        <i className={`fas ${icon}`}></i>
      </div>
    </div>
);

const ActionCard = ({ title, description, icon, actionText, onClick, }: { title: string; description: string; icon: string; actionText: string; onClick: () => void;}) => (
    <div className="glass-card p-4 flex items-center gap-4">
      <div className="bg-royal-blue/10 text-royal-blue w-12 h-12 flex items-center justify-center rounded-lg text-xl">
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <h3 className="font-bold text-dark-text dark:text-white">{title}</h3>
        <p className="text-sm text-dark-text-muted">{description}</p>
        <button onClick={onClick} className="text-sm font-bold text-royal-blue mt-1 hover:underline">
          {actionText}
        </button>
      </div>
    </div>
);

const KnowledgeTestWidget = ({ test, onStart }: { test: KnowledgeTest; onStart: (testId: string) => void; }) => (
    <div className="glass-card p-6 flex flex-col h-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
        <h3 className="font-bold mb-1 dark:text-white">Teste seu Conhecimento</h3>
        <p className="text-lg font-semibold text-dark-text dark:text-white flex-grow">{test.title}</p>
        <p className="text-xs text-dark-text-muted mb-4">{test.questions[0]?.count || 0} questões • {test.subject}</p>
        <button onClick={() => onStart(test.id)} className="mt-auto bg-white/80 dark:bg-white/90 text-royal-blue font-bold py-2 px-6 rounded-lg hover:bg-white transition-transform hover:scale-105 w-full">
            Começar
        </button>
    </div>
);

const TestBrowser = ({ initialTests, onStartTest, onViewDetails }: { initialTests: TestCardInfo[]; onStartTest: (testId: string) => void, onViewDetails: (testId: string) => void }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    const categories = useMemo(() => {
        const allCategories = initialTests.map(t => t.subject).filter(Boolean) as string[];
        return ['Todos', ...Array.from(new Set(allCategories))];
    }, [initialTests]);

    const filteredTests = useMemo(() => {
        return initialTests.filter(test => {
            const matchesCategory = selectedCategory === 'Todos' || test.subject === selectedCategory;
            const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [initialTests, selectedCategory, searchTerm]);

    return (
        <div>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                 <div className="relative flex-grow">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input type="text" placeholder="Pesquisar por título..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-3 pl-10 border rounded-lg bg-white dark:bg-dark-card dark:border-dark-border" />
                </div>
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full md:w-48 p-3 border rounded-lg bg-white dark:bg-dark-card dark:border-dark-border">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.length > 0 ? (
                    filteredTests.map((test) => <AvailableTestCard key={test.id} test={test} onStart={onStartTest} onViewDetails={onViewDetails} />)
                ) : (
                    <p className="text-dark-text-muted col-span-full text-center py-8">Nenhum simulado encontrado com os filtros selecionados.</p>
                )}
            </div>
        </div>
    );
};

const RecentTests = ({ data }: { data: RecentAttempt[] }) => {
    //... (código sem alteração)
};
const PerformanceChart = ({ data }: { data: PerformanceData[] }) => {
    //... (código sem alteração)
};

// --- COMPONENTE PRINCIPAL ---
export default function StudentTestDashboard({ dashboardData, initialAvailableTests, knowledgeTests }: Props) {
  const [view, setView] = useState<"dashboard" | "browse" | "attempt" | "detail" | "results">("dashboard");
  const [selectedTest, setSelectedTest] = useState<TestWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultsHistory, setResultsHistory] = useState<AttemptHistory[]>([]);

  const handleStartTest = (testData: TestWithQuestions) => {
    setSelectedTest(testData);
    setView("attempt");
  };

  const handleFinishAttempt = () => {
    setView("dashboard");
    window.location.reload();
  };
  
  const handleViewDetails = async (testId: string) => {
    setIsLoading(true);
    const { data } = await getTestWithQuestions(testId);
    if (data) {
        setSelectedTest(data);
        setView("detail");
    } else {
        alert("Não foi possível carregar os detalhes do simulado.");
    }
    setIsLoading(false);
  };
  
  const handleInitiateTestFromBrowse = async (testId: string) => {
    setIsLoading(true);
    const { data } = await getTestWithQuestions(testId);
    if (data) {
        handleStartTest(data);
    } else {
        alert("Não foi possível iniciar o simulado.");
    }
    setIsLoading(false);
  }

  const handleStartQuickTest = async () => {
    setIsLoading(true);
    const { data, error } = await getQuickTest();
    if (error) {
        alert(error);
    } else if (data) {
        handleStartTest(data);
    }
    setIsLoading(false);
  };

  const handleViewResults = async () => {
    setIsLoading(true);
    const { data, error } = await getStudentResultsHistory();
    if (error) {
        alert(error);
    } else if (data) {
        setResultsHistory(data as AttemptHistory[]);
        setView("results");
    }
    setIsLoading(false);
  };

  const handleBackToDashboard = () => {
    setView("dashboard");
    setSelectedTest(null);
  };

  const MainDashboard = () => (
    <>
      <h1 className="text-3xl font-bold text-dark-text dark:text-white mb-6">Meu Desempenho</h1>
      {!dashboardData ? (
         <div className="p-8 text-center border-2 border-dashed rounded-lg glass-card">
           <h2 className="text-xl font-bold mb-2">Comece sua jornada!</h2>
           <p className="text-sm text-dark-text-muted mb-4">Faça seu primeiro simulado para ver suas estatísticas e acompanhar seu progresso.</p>
           <button onClick={() => setView("browse")} className="bg-royal-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90">
             Ver Simulados
           </button>
         </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard title="Simulados Feitos" value={dashboardData.stats.simuladosFeitos} icon="fa-file-alt" />
            <StatCard title="Média Geral" value={`${dashboardData.stats.mediaGeral.toFixed(0)}%`} icon="fa-chart-bar" />
            <StatCard title="Taxa de Acerto" value={`${dashboardData.stats.taxaAcerto.toFixed(0)}%`} icon="fa-check-circle" />
            <StatCard title="Tempo Médio" value={"~2m"} icon="fa-clock" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <ActionCard title="Teste Rápido" description="10 questões • 15 minutos" icon="fa-bolt" actionText="Começar agora" onClick={handleStartQuickTest} />
            <ActionCard title="Praticar" description="Escolha um simulado" icon="fa-stream" actionText="Ver todos" onClick={() => setView("browse")} />
            <ActionCard title="Meus Resultados" description="Análise detalhada" icon="fa-chart-pie" actionText="Ver relatórios" onClick={handleViewResults} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              {dashboardData.recentAttempts?.length > 0 && <RecentTests data={dashboardData.recentAttempts} />}
            </div>
            <div className="lg:col-span-2">
              {knowledgeTests.length > 0 && <KnowledgeTestWidget test={knowledgeTests[0]} onStart={handleInitiateTestFromBrowse} />}
            </div>
            <div className="lg:col-span-5">
              {dashboardData.performanceBySubject?.length > 0 && <PerformanceChart data={dashboardData.performanceBySubject} />}
            </div>
          </div>
        </>
      )}
    </>
  );

  const renderContent = () => {
    if (isLoading) {
        return <div className="text-center p-8">Carregando...</div>;
    }
    switch (view) {
      case "browse":
        return (
          <>
            <button onClick={handleBackToDashboard} className="text-sm font-bold text-royal-blue mb-6">
              <i className="fas fa-arrow-left mr-2"></i> Voltar para o Dashboard
            </button>
            <TestBrowser initialTests={initialAvailableTests} onStartTest={handleInitiateTestFromBrowse} onViewDetails={handleViewDetails} />
          </>
        );
      case "attempt":
        if (!selectedTest) {
          setView("browse"); return null;
        }
        return <AttemptView test={selectedTest} onFinish={handleFinishAttempt} />;
      case "detail":
          if (!selectedTest) {
              setView("browse"); return null;
          }
          return <TestDetailView test={selectedTest} onBack={() => setView("browse")} onStartTest={handleStartTest} />;
      case "results":
          return <ResultsView attempts={resultsHistory} onBack={handleBackToDashboard} />;
      case "dashboard":
      default:
        return <MainDashboard />;
    }
  };

  return <div>{renderContent()}</div>;
}