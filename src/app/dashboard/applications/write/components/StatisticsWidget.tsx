import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type Stats = {
    totalCorrections: number;
    averages: {
        avg_final_grade: number;
        avg_c1: number;
        avg_c2: number;
        avg_c3: number;
        avg_c4: number;
        avg_c5: number;
    };
    pointToImprove: { name: string; average: number };
};

type FrequentError = { error_type: string; count: number };

// Novas props para o componente
type Props = {
    stats: Stats;
    frequentErrors: FrequentError[];
}

const FrequentErrorsChart = ({ data }: { data: FrequentError[] }) => {
  if (!data || data.length === 0) return null;
  const COLORS = ['#5e55f9', '#8884d8', '#82ca9d', '#ffc658', '#ff8042'];
  return (
    <div>
      <h4 className="font-semibold dark:text-white mt-6 text-center">Seus Erros Frequentes</h4>
      <ResponsiveContainer width="100%" height={150}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="error_type" cx="50%" cy="50%" outerRadius={60} fill="#8884d8" labelLine={false}>
            {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', borderColor: '#2f2f2f', borderRadius: '0.5rem' }}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};


export default function StatisticsWidget({ stats, frequentErrors }: Props) {
    return (
        <div>
            <h3 className="font-bold text-lg mb-4">Suas Estatísticas</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                    <p className="text-3xl font-bold text-royal-blue">{stats.totalCorrections}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Redações Corrigidas</p>
                </div>
                <div>
                    <p className="text-3xl font-bold text-royal-blue">{stats.averages.avg_final_grade.toFixed(0)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Média Geral</p>
                </div>
            </div>
            <div className="mt-6">
                <h4 className="font-semibold text-center mb-2 dark:text-white">Média por Competência</h4>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex justify-between items-center text-sm">
                            <span>Competência {i}</span>
                            <span className="font-bold">{stats.averages[`avg_c${i}` as keyof typeof stats.averages].toFixed(0)}</span>
                        </div>
                    ))}
                </div>
            </div>
            <hr className="border-white/20 my-4" />
            <div className="text-center bg-white/20 p-4 rounded-lg">
                <h4 className="font-semibold dark:text-white">Ponto a Melhorar</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Sua menor média está na <strong>{stats.pointToImprove.name}</strong>.
                </p>
            </div>
             <FrequentErrorsChart data={frequentErrors} />
        </div>
    );
}