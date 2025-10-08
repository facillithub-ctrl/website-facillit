"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type ProgressionData = {
    date: string;
    grade: number;
};

type Props = {
    data: ProgressionData[];
};

export default function ProgressionChart({ data }: Props) {
    return (
        <div className="glass-card p-6 h-full flex flex-col">
            {/* Metade Superior: Gráfico de Progressão */}
            <div className="flex-1 min-h-[250px]">
                <h3 className="font-bold text-lg mb-4 dark:text-white">Sua Progressão</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="date" tick={{ fill: '#a0a0a0' }} fontSize={12} />
                        <YAxis domain={[0, 1000]} tick={{ fill: '#a0a0a0' }} fontSize={12} />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(30, 30, 30, 0.8)', 
                                borderColor: '#2f2f2f',
                                borderRadius: '0.5rem'
                            }}
                            labelStyle={{ color: '#f9fafb' }}
                        />
                        <Line type="monotone" dataKey="grade" name="Nota" stroke="#5e55f9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Linha divisória */}
            <hr className="border-white/20 my-4" />

            {/* Metade Inferior: Plano de Prática (Placeholder CORRIGIDO) */}
            <div className="flex-1">
                <h3 className="font-bold text-lg dark:text-white mb-4">Plano de Prática</h3>
                {/* O 'bg-black/10' foi removido para eliminar a sobreposição */}
                <div className="h-full flex items-center justify-center text-center rounded-lg p-4">
                    <p className="text-sm text-gray-300 dark:text-gray-300">
                        Em breve, você verá aqui sugestões de temas e exercícios com base nos seus resultados para praticar e evoluir ainda mais.
                    </p>
                </div>
            </div>
        </div>
    );
}