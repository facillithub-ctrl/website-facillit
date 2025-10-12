"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import AvailableTestCard from "./AvailableTestCard";
import AttemptView from "./AttemptView";
import TestDetailView from "./TestDetailView";
import ResultsView from "./ResultsView";
import { 
    getTestWithQuestions, 
    type TestWithQuestions, 
    getQuickTest, 
    getStudentResultsHistory,
    type StudentCampaign,
    submitCampaignConsent
} from '../actions';
import { useToast } from "@/contexts/ToastContext";

// --- TIPOS ---
type TestCardInfo = {
  id: string;
  title: string;
  subject: string | null;
  question_count: number;
  duration_minutes: number;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  avg_score: number;
  total_attempts: number;
  points: number;
  hasAttempted: boolean;
  cover_image_url?: string | null;
  collection?: string | null;
  class_id?: string | null;
  is_campaign_test?: boolean;
};

type KnowledgeTest = {
  id: string;
  title: string;
  subject: string | null;
  questions: { count: number }[];
};

type PerformanceData = { materia: string; nota: number; simulados: number };

type RecentAttempt = {
  tests: { title: string; subject: string | null };
  completed_at: string;
  score: number | null;
};

type DashboardData = {
  stats: {
    simuladosFeitos: number;
    mediaGeral: number;
    taxaAcerto: number;
    tempoMedio: number;
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
  globalTests: TestCardInfo[];
  classTests: TestCardInfo[];
  knowledgeTests: KnowledgeTest[];
  campaigns: StudentCampaign[];
  consentedCampaignIds: string[];
};

// --- SUB-COMPONENTES ---

const CampaignConsentModal = ({ onConfirm, onCancel }: { onConfirm: () => void, onCancel: () => void }) => (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Termos da Campanha</h2>
            <div className="text-sm max-h-60 overflow-y-auto pr-2 mb-6">
                <p className="mb-2">Ao participar desta campanha, você concorda com as seguintes regras:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Tentativa Única:</strong> Cada simulado só pode ser realizado uma vez.</li>
                    <li><strong>Antifraude:</strong> Não é permitido copiar/colar conteúdo ou sair da tela do teste. Sair da tela resultará no encerramento imediato da sua tentativa.</li>
                    <li><strong>Uso de Dados:</strong> Seus resultados serão usados de forma anônima para compor o ranking da campanha.</li>
                </ul>
                <p className="mt-4">Para mais detalhes, consulte os <a href="/recursos/termos-campanha" target="_blank" className="text-royal-blue underline">Termos e Condições completos das Campanhas</a>.</p>
            </div>
            <div className="flex justify-end gap-4">
                <button onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                <button onClick={onConfirm} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg">Aceito e quero começar</button>
            </div>
        </div>
    </div>
);

const CampaignCard = ({ campaign, onStartTest }: { campaign: StudentCampaign, onStartTest: (testId: string, campaignId: string) => void }) => {
    const endDate = new Date(campaign.end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return (
        <div className="glass-card p-6">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold dark:text-white">{campaign.title}</h3>
                <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Termina em {diffDays} {diffDays === 1 ? 'dia' : 'dias'}
                </span>
            </div>
            <p className="text-sm text-dark-text-muted mb-4">{campaign.description}</p>
            <div className="space-y-2">
                {campaign.tests?.map(test => (
                    <div key={test.id} className="flex justify-between items-center p-2 rounded-md bg-white/10">
                        <div>
                            <p className="font-semibold text-sm dark:text-white">{test.title}</p>
                            <p className="text-xs text-dark-text-muted">{test.question_count} questões</p>
                        </div>
                        <button onClick={() => onStartTest(test.id, campaign.campaign_id)} className="bg-royal-blue text-white text-xs font-bold py-1 px-3 rounded-md">
                            Iniciar
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, unit }: { title: string; value: string | number; icon: string, unit?: string }) => (
    <div className="glass-card p-4 flex items-center justify-between h-full">
      <div>
        <p className="text-sm text-dark-text-muted">{title}</p>
        <p className="text-2xl font-bold text-dark-text dark:text-white">{value}<span className="text-base ml-1 font-normal">{unit}</span></p>
      </div>
      <div className="text-3xl text-lavender-blue">
        <i className={`fas ${icon}`}></i>
      </div>
    </div>
);

const ActionCard = ({ title, description, icon, actionText, onClick }: { title: string; description: string; icon: string; actionText: string; onClick: () => void;}) => (
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

const subjectColors: { [key: string]: string } = { Matemática: "#8b5cf6", Física: "#ec4899", Química: "#3b82f6", Biologia: "#22c55e", Português: "#f97316", Default: "#6b7280" };
type CustomTooltipProps = { active?: boolean; payload?: { payload: PerformanceData }[]; label?: string; };
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => { if (active && payload && payload.length) { const data = payload[0].payload; const notaStr = typeof data.nota === "number" ? data.nota.toFixed(1) : "0"; return ( <div className="p-2 rounded-lg" style={{ backgroundColor: "#1A1A1D", border: "1px solid #2c2c31" }}><p className="text-sm font-bold" style={{ color: "#f8f9fa" }}>{`${label}`}</p><p className="text-xs" style={{ color: "#a0a0a0" }}>{`Acerto Médio: ${notaStr}% • ${data.simulados ?? 0} simulados`}</p></div> ); } return null; };
const PerformanceChart = ({ data }: { data: PerformanceData[] }) => ( <div className="glass-card p-6 h-[320px]"><h3 className="font-bold mb-4 text-dark-text dark:text-white">Performance por Matéria</h3><ResponsiveContainer width="100%" height="90%"><BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}><XAxis type="number" hide domain={[0, 100]} /><YAxis type="category" dataKey="materia" axisLine={false} tickLine={false} width={80} tick={{ fill: "#a0a0a0" }} /><Tooltip cursor={{ fill: "rgba(255, 255, 255, 0.1)" }} content={<CustomTooltip />} /><Bar dataKey="nota" barSize={16} radius={[0, 10, 10, 0]}>{data.map((entry) => (<Cell key={`cell-${entry.materia}`} fill={subjectColors[entry.materia] || subjectColors.Default} />))}</Bar></BarChart></ResponsiveContainer></div> );
const RecentTests = ({ data }: { data: RecentAttempt[] }) => { const getIconForSubject = (subject: string | null) => { switch (subject) { case "Matemática": return "∫"; case "Física": return "⚡️"; case "Química": return "⚗️"; default: return "📝"; } }; return ( <div className="glass-card p-6"><h3 className="font-bold mb-4 text-dark-text dark:text-white">Últimos Simulados</h3><div className="space-y-3">{data.map((simulado, i) => { const test = simulado.tests; return (<div key={i} className={`p-3 rounded-lg flex items-center justify-between bg-white/10`}><div className="flex items-center gap-3"><div className="text-xl">{getIconForSubject(test.subject)}</div><div><p className="font-semibold text-sm text-dark-text dark:text-white">{test.title}</p><p className="text-xs text-dark-text-muted">{new Date(simulado.completed_at!).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</p></div></div><div className="text-right"><p className="font-bold text-lg text-lavender-blue">{simulado.score?.toFixed(1)}%</p><p className="text-xs text-dark-text-muted">acertos</p></div></div> ); })}</div></div> ); };


// --- COMPONENTE PRINCIPAL ---
export default function StudentTestDashboard({ dashboardData, globalTests, classTests, knowledgeTests, campaigns, consentedCampaignIds }: Props) {
  const [view, setView] = useState<"dashboard" | "browse" | "attempt" | "detail" | "results">("dashboard");
  const [selectedTest, setSelectedTest] = useState<TestWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultsHistory, setResultsHistory] = useState<AttemptHistory[]>([]);
  const [filter, setFilter] = useState<'all' | 'class' | 'global' | 'campaign'>('all');

  const [consentModal, setConsentModal] = useState<{isOpen: boolean, testId?: string, campaignId?: string}>({isOpen: false});
  
  const { addToast } = useToast(); // Hook para notificações
  
  const myConsentedCampaignIds = useMemo(() => new Set(consentedCampaignIds), [consentedCampaignIds]);

  const handleStartTest = (testData: TestWithQuestions) => { setSelectedTest(testData); setView("attempt"); };
  const handleFinishAttempt = () => { setView("dashboard"); window.location.reload(); };
  
  const handleViewDetails = async (testId: string) => { 
    setIsLoading(true); 
    const { data } = await getTestWithQuestions(testId); 
    if (data) { 
        if (!data.hasAttempted) {
            addToast({
                title: "Gabarito Indisponível",
                message: "Você precisa resolver o simulado antes de conferir o gabarito.",
                type: "error"
            });
            setIsLoading(false);
            return;
        }
        setSelectedTest(data); 
        setView("detail"); 
    } else { 
        addToast({ title: "Erro", message: "Não foi possível carregar os detalhes do simulado.", type: "error" }); 
    } 
    setIsLoading(false); 
  };
  
  const handleInitiateTest = async (testId: string, campaignId?: string) => {
    if (campaignId && !myConsentedCampaignIds.has(campaignId)) {
        setConsentModal({ isOpen: true, testId, campaignId });
        return;
    }
    
    setIsLoading(true);
    const { data } = await getTestWithQuestions(testId);
    if (data) {
        if (data.hasAttempted) {
            addToast({ title: "Simulado já Realizado", message: "Você já concluiu este simulado.", type: "error" });
            setIsLoading(false);
            return;
        }
        handleStartTest(data);
    } else {
        addToast({ title: "Erro", message: "Não foi possível iniciar o simulado.", type: "error" });
    }
    setIsLoading(false);
  };

  const handleConfirmConsent = async () => {
      const { testId, campaignId } = consentModal;
      if (!testId || !campaignId) return;

      setConsentModal({ isOpen: false });
      await submitCampaignConsent(campaignId);
      myConsentedCampaignIds.add(campaignId);
      handleInitiateTest(testId, campaignId);
  };

  const handleStartQuickTest = async () => { setIsLoading(true); const { data, error } = await getQuickTest(); if (error) { addToast({title: "Erro", message: error, type: "error"}); } else if (data) { handleStartTest(data); } setIsLoading(false); };
  
  const handleViewResults = async () => {
    setIsLoading(true);
    const { data, error } = await getStudentResultsHistory();
    if (error) {
        addToast({title: "Erro", message: error, type: "error"});
    } else if (data) {
        const mappedData = data.map(attempt => ({
            ...attempt,
            tests: Array.isArray(attempt.tests) ? attempt.tests[0] : attempt.tests,
        }));
        setResultsHistory(mappedData as unknown as AttemptHistory[]);
        setView("results");
    }
    setIsLoading(false);
  };
  
  const handleBackToDashboard = () => { setView("dashboard"); setSelectedTest(null); };

  const allCampaignTests = useMemo(() => {
    if (!campaigns || !Array.isArray(campaigns)) {
      return [];
    }
    return campaigns.flatMap(c => c.tests.map(t => {
        const baseTest = [...globalTests, ...classTests].find(gt => gt.id === t.id);
        if (!baseTest) return null;
        return { ...baseTest, is_campaign_test: true, campaignId: c.campaign_id };
    }))
    .filter(Boolean) as (TestCardInfo & { campaignId: string })[]
  }, [campaigns, globalTests, classTests]);

  const filteredTests = useMemo(() => {
        const classTestsWithType = classTests.map(t => ({...t, type: 'class'}));
        const globalTestsWithType = globalTests.map(t => ({...t, type: 'global'}));
        const campaignTestsWithType = allCampaignTests.map(t => ({...t, type: 'campaign'}));

        let testsToShow: (TestCardInfo & { type: string, campaignId?: string })[] = [];

        if (filter === 'all' || filter === 'class') testsToShow.push(...classTestsWithType);
        if (filter === 'all' || filter === 'global') testsToShow.push(...globalTestsWithType);
        if (filter === 'all' || filter === 'campaign') testsToShow.push(...campaignTestsWithType);

        const uniqueTests = new Map<string, TestCardInfo & { type: string, campaignId?: string }>();
        testsToShow.forEach(test => {
            const existing = uniqueTests.get(test.id);
            if (!existing || test.type === 'campaign') {
                uniqueTests.set(test.id, test);
            }
        });

        return Array.from(uniqueTests.values());

  }, [classTests, globalTests, allCampaignTests, filter]);

  const TestBrowser = () => {
    return (
        <div>
             <div className="mb-8 flex items-center justify-between">
                 <h2 className="text-2xl font-bold text-dark-text dark:text-white">Explorar Simulados</h2>
                 <div className="flex items-center gap-2 rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
                     <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm font-semibold rounded-md ${filter === 'all' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>Todos</button>
                     <button onClick={() => setFilter('campaign')} className={`px-3 py-1 text-sm font-semibold rounded-md ${filter === 'campaign' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>Campanhas</button>
                     <button onClick={() => setFilter('class')} className={`px-3 py-1 text-sm font-semibold rounded-md ${filter === 'class' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>Da Turma</button>
                     <button onClick={() => setFilter('global')} className={`px-3 py-1 text-sm font-semibold rounded-md ${filter === 'global' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>Globais</button>
                 </div>
            </div>

            {filteredTests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTests.map(test => (
                        <AvailableTestCard 
                            key={test.id} 
                            test={test} 
                            onStart={(testId) => handleInitiateTest(testId, (test as any).campaignId)} 
                            onViewDetails={handleViewDetails} 
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 glass-card">
                    <p className="text-lg">Nenhum simulado encontrado para este filtro.</p>
                </div>
            )}
        </div>
    );
};


  const MainDashboard = () => (
    <>
      <h1 className="text-3xl font-bold text-dark-text dark:text-white mb-6">Meu Desempenho em Testes</h1>
      {!dashboardData ? (
         <div className="p-8 text-center border-2 border-dashed rounded-lg glass-card">
           <h2 className="text-xl font-bold mb-2">Comece sua jornada!</h2>
           <p className="text-sm text-dark-text-muted mb-4">Faça seu primeiro simulado para ver suas estatísticas e acompanhar seu progresso.</p>
           <button onClick={() => setView("browse")} className="bg-royal-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90">Ver Simulados</button>
         </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Simulados Feitos" value={dashboardData.stats.simuladosFeitos} icon="fa-file-alt" />
            <StatCard title="Média Geral" value={`${dashboardData.stats.mediaGeral.toFixed(0)}`} icon="fa-chart-bar" unit="%" />
            <StatCard title="Taxa de Acerto" value={`${dashboardData.stats.taxaAcerto.toFixed(0)}`} icon="fa-check-circle" unit="%" />
            <StatCard title="Tempo Médio" value={`${(dashboardData.stats.tempoMedio / 60).toFixed(0)}`} unit="min" icon="fa-clock" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionCard title="Teste Rápido" description="10 questões • 15 minutos" icon="fa-bolt" actionText="Começar agora" onClick={handleStartQuickTest} />
            <ActionCard title="Praticar" description="Escolha um simulado" icon="fa-stream" actionText="Ver todos" onClick={() => setView("browse")} />
            <ActionCard title="Meus Resultados" description="Análise detalhada" icon="fa-chart-pie" actionText="Ver relatórios" onClick={handleViewResults} />
          </div>
          
          {campaigns && campaigns.length > 0 && (
                 <div>
                    <h2 className="text-2xl font-bold mb-6 text-dark-text dark:text-white">Campanhas Ativas</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {campaigns.map(campaign => (
                            <CampaignCard key={campaign.campaign_id} campaign={campaign} onStartTest={handleInitiateTest} />
                        ))}
                    </div>
                </div>
            )}

          <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
            <div className="lg:col-span-5">
                {dashboardData.performanceBySubject?.length > 0 && <PerformanceChart data={dashboardData.performanceBySubject} />}
            </div>
            <div className="lg:col-span-3">
                {dashboardData.recentAttempts?.length > 0 && <RecentTests data={dashboardData.recentAttempts} />}
            </div>
          </div>
          
          {knowledgeTests && knowledgeTests.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {knowledgeTests.slice(0, 3).map(kt => (
                    <KnowledgeTestWidget key={kt.id} test={kt} onStart={handleInitiateTest} />
                ))}
            </div>
          )}
        </div>
      )}
    </>
  );

  const renderContent = () => {
    if (isLoading) { return <div className="text-center p-8">Carregando...</div>; }
    switch (view) {
      case "browse": return ( <><button onClick={handleBackToDashboard} className="text-sm font-bold text-royal-blue mb-6"><i className="fas fa-arrow-left mr-2"></i> Voltar</button><TestBrowser /></> );
      case "attempt": if (!selectedTest) { setView("browse"); return null; } return <AttemptView test={selectedTest} onFinish={handleFinishAttempt} />;
      case "detail": if (!selectedTest) { setView("browse"); return null; } return <TestDetailView test={selectedTest} onBack={() => setView("browse")} onStartTest={handleStartTest} />;
      case "results": return <ResultsView attempts={resultsHistory} onBack={handleBackToDashboard} />;
      case "dashboard": default: return <MainDashboard />;
    }
  };

  return <div>
        {consentModal.isOpen && (
            <CampaignConsentModal 
                onConfirm={handleConfirmConsent} 
                onCancel={() => setConsentModal({isOpen: false})}
            />
        )}
        {renderContent()}
    </div>;
}