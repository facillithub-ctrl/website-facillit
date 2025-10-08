"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import AvailableTestCard from "./AvailableTestCard";
import AttemptView from "./AttemptView";

// --- TIPOS ---
type TestCardInfo = {
  id: string;
  title: string;
  subject: string | null;
  question_count: number;
  duration_minutes: number;
  difficulty: "Fácil" | "Médio" | "Difícil";
  avg_score: number;
  total_attempts: number;
  points: number;
};
type PerformanceData = { materia: string; nota: number; simulados: number };

// NOTE: backend returns `tests` as an ARRAY, so reflect that here.
type RecentAttempt = {
  tests: { title: string; subject: string | null }[]; // <-- array now
  completed_at: string;
  score: number;
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
type Props = { dashboardData: DashboardData | null; availableTests: TestCardInfo[] };

const subjectColors: { [key: string]: string } = {
  Matemática: "#8b5cf6",
  Física: "#ec4899",
  Química: "#3b82f6",
  Biologia: "#22c55e",
  Português: "#f97316",
  Default: "#6b7280",
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

const ActionCard = ({
  title,
  description,
  icon,
  actionText,
  onClick,
}: {
  title: string;
  description: string;
  icon: string;
  actionText: string;
  onClick: () => void;
}) => (
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

// ==================================================================
// CustomTooltip: tipagem local e segura (compatível com Recharts v3.x)
// ==================================================================
type CustomTooltipPayloadItem = {
  value?: number | string;
  name?: string;
  payload?: PerformanceData | Record<string, any>;
};

type CustomTooltipProps = {
  active?: boolean;
  label?: string | number;
  payload?: CustomTooltipPayloadItem[];
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const first = payload[0];
    // tenta pegar 'payload' do item (é onde seus campos reais estão: nota, simulados).
    const data = (first.payload as PerformanceData) ?? { nota: 0, simulados: 0, materia: "" };

    const notaStr = typeof data.nota === "number" ? data.nota.toFixed(1) : String(data.nota ?? "0");

    return (
      <div className="p-2 rounded-lg" style={{ backgroundColor: "#1A1A1D", border: "1px solid #2c2c31" }}>
        <p className="text-sm font-bold" style={{ color: "#f8f9fa" }}>{`${label}`}</p>
        <p className="text-xs" style={{ color: "#a0a0a0" }}>
          {`Acerto Médio: ${notaStr}% • ${data.simulados ?? 0} simulados`}
        </p>
      </div>
    );
  }

  return null;
};

const PerformanceChart = ({ data }: { data: PerformanceData[] }) => (
  <div className="glass-card p-6 h-[320px]">
    <h3 className="font-bold mb-4 text-dark-text dark:text-white">Performance por Matéria</h3>
    <ResponsiveContainer width="100%" height="90%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
        <XAxis type="number" hide domain={[0, 100]} />
        <YAxis type="category" dataKey="materia" axisLine={false} tickLine={false} width={80} tick={{ fill: "#a0a0a0" }} />
        <Tooltip cursor={{ fill: "rgba(255, 255, 255, 0.1)" }} content={<CustomTooltip />} />
        <Bar dataKey="nota" barSize={16} radius={[0, 10, 10, 0]}>
          {data.map((entry) => (
            <Cell key={`cell-${entry.materia}`} fill={subjectColors[entry.materia] || subjectColors.Default} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const RecentTests = ({ data }: { data: RecentAttempt[] }) => {
  const getIconForSubject = (subject: string | null) => {
    switch (subject) {
      case "Matemática":
        return "∫";
      case "Física":
        return "⚡️";
      case "Química":
        return "⚗️";
      default:
        return "📝";
    }
  };

  return (
    <div className="glass-card p-6">
      <h3 className="font-bold mb-4 text-dark-text dark:text-white">Últimos Simulados</h3>
      <div className="space-y-3">
        {data.map((simulado, i) => {
          // como `tests` é array no backend, pegamos o primeiro (ajuste conforme necessidade)
          const test = simulado.tests && simulado.tests.length > 0 ? simulado.tests[0] : { title: "—", subject: null };
          return (
            <div key={i} className={`p-3 rounded-lg flex items-center justify-between bg-white/10`}>
              <div className="flex items-center gap-3">
                <div className="text-xl">{getIconForSubject(test.subject)}</div>
                <div>
                  <p className="font-semibold text-sm text-dark-text dark:text-white">{test.title}</p>
                  <p className="text-xs text-dark-text-muted">
                    {new Date(simulado.completed_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-lavender-blue">{simulado.score.toFixed(1)}</p>
                <p className="text-xs text-dark-text-muted">acertos</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TestBrowser = ({ tests, onStartTest }: { tests: TestCardInfo[]; onStartTest: (testId: string) => void }) => (
  <div>
    <h2 className="text-2xl font-bold text-dark-text dark:text-white mb-6">Simulados Disponíveis</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tests.length > 0 ? (
        tests.map((test) => <AvailableTestCard key={test.id} test={test} onStart={onStartTest} />)
      ) : (
        <p className="text-dark-text-muted col-span-full text-center">Nenhum simulado disponível no momento.</p>
      )}
    </div>
  </div>
);

export default function StudentTestDashboard({ dashboardData, availableTests }: Props) {
  const [view, setView] = useState<"dashboard" | "browse" | "attempt">("dashboard");
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  const handleStartTest = (testId: string) => {
    setSelectedTestId(testId);
    setView("attempt");
  };

  const handleFinishAttempt = () => {
    setView("dashboard");
    window.location.reload();
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
            <ActionCard title="Teste Rápido" description="10 questões • 15 minutos" icon="fa-bolt" actionText="Começar agora" onClick={() => alert("Em breve!")} />
            <ActionCard title="Praticar" description="Escolha um simulado" icon="fa-stream" actionText="Ver todos" onClick={() => setView("browse")} />
            <ActionCard title="Meus Resultados" description="Análise detalhada" icon="fa-chart-pie" actionText="Ver relatórios" onClick={() => alert("Em breve!")} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboardData.recentAttempts?.length > 0 && <RecentTests data={dashboardData.recentAttempts} />}
            {dashboardData.performanceBySubject?.length > 0 && <PerformanceChart data={dashboardData.performanceBySubject} />}
          </div>
        </>
      )}
    </>
  );

  const renderContent = () => {
    switch (view) {
      case "browse":
        return (
          <>
            <button onClick={() => setView("dashboard")} className="text-sm font-bold text-royal-blue mb-6">
              <i className="fas fa-arrow-left mr-2"></i> Voltar para o Dashboard
            </button>
            <TestBrowser tests={availableTests} onStartTest={handleStartTest} />
          </>
        );
      case "attempt":
        if (!selectedTestId) {
          setView("browse");
          return null;
        }
        return <AttemptView testId={selectedTestId} onFinish={handleFinishAttempt} />;
      case "dashboard":
      default:
        return <MainDashboard />;
    }
  };

  return <div>{renderContent()}</div>;
}
