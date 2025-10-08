"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Tipos para os dados que virão da nossa nova action
type DashboardData = {
    stats: {
        simuladosFeitos: number;
        mediaGeral: number;
        taxaAcerto: number;
    };
    performanceBySubject: { materia: string; nota: number; simulados: number; }[];
    recentAttempts: {
        score: number;
        completed_at: string;
        tests: { title: string; subject: string | null };
    }[];
};

type Props = {
    dashboardData: DashboardData | null; // A prop agora recebe todos os dados
}

// Cores da sua paleta
const subjectColors: { [key: string]: string } = {
  'Matemática': '#8b5cf6', // Roxo
  'Física': '#ec4899',     // Rosa
  'Química': '#3b82f6',    // Azul
  'Biologia': '#22c55e',   // Verde
  'Português': '#f97316',   // Laranja
  'Default': '#6b7280',    // Cinza
};

// --- SUB-COMPONENTES DA DASHBOARD ---

const StatCard = ({ title, value, icon, trend }: { title: string, value: string | number, icon: string, trend?: string }) => (
  <div className="glass-card p-4 flex items-center justify-between">
    <div>
      <p className="text-sm text-dark-text-muted">{title}</p>
      <p className="text-2xl font-bold text-dark-text dark:text-white">{value}</p>
      {trend && <p className="text-xs text-green-500">{trend}</p>}
    </div>
    <div className="text-3xl text-lavender-blue">
      <i className={`fas ${icon}`}></i>
    </div>
  </div>
);

const ActionCard = ({ title, description, icon, actionText, onClick }: { title: string, description: string, icon: string, actionText: string, onClick: () => void }) => (
    <div className="glass-card p-4 flex items-center gap-4">
        <div className="bg-royal-blue/10 text-royal-blue w-12 h-12 flex items-center justify-center rounded-lg text-xl">
            <i className={`fas ${icon}`}></i>
        </div>
        <div>
            <h3 className="font-bold text-dark-text dark:text-white">{title}</h3>
            <p className="text-sm text-dark-text-muted">{description}</p>
            <button onClick={onClick} className="text-sm font-bold text-royal-blue mt-1 hover:underline">{actionText}</button>
        </div>
    </div>
);

const PerformanceChart = ({ data }: { data: DashboardData['performanceBySubject'] }) => (
    <div className="glass-card p-6 h-[320px]">
        <h3 className="font-bold mb-4 text-dark-text dark:text-white">Performance por Matéria</h3>
        <ResponsiveContainer width="100%" height="90%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 80, left: 0, bottom: 0 }}>
                <XAxis type="number" hide domain={[0, 10]} />
                <YAxis type="category" dataKey="materia" axisLine={false} tickLine={false} width={80} tick={{ fill: 'var(--text-muted-dark)' }} />
                <Tooltip 
                    cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                    contentStyle={{ backgroundColor: '#1A1A1D', border: '1px solid #2c2c31', borderRadius: '0.5rem' }}
                    labelStyle={{ color: '#f8f9fa' }}
                />
                <Bar dataKey="nota" barSize={12} radius={[0, 10, 10, 0]}>
                   {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={subjectColors[entry.materia] || subjectColors.Default} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div>
);

const RecentTests = ({ data }: { data: DashboardData['recentAttempts'] }) => {
    const getIconForSubject = (subject: string | null) => {
        switch (subject) {
            case 'Matemática': return '∫';
            case 'Física': return '⚡️';
            case 'Química': return '⚗️';
            default: return '📝';
        }
    }
    return (
        <div className="glass-card p-6">
            <h3 className="font-bold mb-4 text-dark-text dark:text-white">Últimos Simulados</h3>
            <div className="space-y-3">
                {data.map((simulado, i) => (
                    <div key={i} className={`p-3 rounded-lg flex items-center justify-between bg-white/10`}>
                        <div className="flex items-center gap-3">
                            <div className="text-xl">{getIconForSubject(simulado.tests.subject)}</div>
                            <div>
                                <p className="font-semibold text-sm text-dark-text dark:text-white">{simulado.tests.title}</p>
                                <p className="text-xs text-dark-text-muted">{new Date(simulado.completed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-lg text-royal-blue">{((simulado.score || 0) / 10).toFixed(1)}</p>
                            <p className="text-xs text-dark-text-muted">{simulado.score || 0}% acertos</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function StudentTestDashboard({ dashboardData }: Props) {
  
  if (!dashboardData) {
      return (
        <div className="p-8 text-center border-2 border-dashed rounded-lg glass-card">
            <h1 className="text-3xl font-bold text-dark-text dark:text-white mb-6">Meu Desempenho</h1>
            <h2 className="text-xl font-bold mb-2">Comece sua jornada!</h2>
            <p className="text-sm text-dark-text-muted">
                Faça seu primeiro simulado para ver suas estatísticas e acompanhar seu progresso.
            </p>
        </div>
      );
  }
  
  const { stats, performanceBySubject, recentAttempts } = dashboardData;

  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text dark:text-white mb-6">Meu Desempenho</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Simulados Feitos" value={stats.simuladosFeitos} icon="fa-file-alt" />
        <StatCard title="Média Geral" value={stats.mediaGeral.toFixed(1)} icon="fa-chart-bar" />
        <StatCard title="Taxa de Acerto" value={`${stats.taxaAcerto.toFixed(0)}%`} icon="fa-check-circle" />
        <StatCard title="Tempo Médio" value={"2m08s"} icon="fa-clock" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <ActionCard title="Teste Rápido" description="10 questões • 15 minutos" icon="fa-bolt" actionText="Começar agora" onClick={() => alert('Em breve!')}/>
        <ActionCard title="Simulado Personalizado" description="Configure suas preferências" icon="fa-sliders-h" actionText="Personalizar" onClick={() => alert('Em breve!')}/>
        <ActionCard title="Ver todos os resultados" description="Análise detalhada" icon="fa-chart-pie" actionText="Ver relatórios" onClick={() => alert('Em breve!')}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recentAttempts.length > 0 && <RecentTests data={recentAttempts} />}
        {performanceBySubject.length > 0 && <PerformanceChart data={performanceBySubject} />}
      </div>
    </div>
  );
}