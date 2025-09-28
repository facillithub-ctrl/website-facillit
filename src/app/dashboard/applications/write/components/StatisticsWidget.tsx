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
}

export default function StatisticsWidget({ stats }: { stats: Stats }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
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
             <div className="mt-6 text-center bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold dark:text-white">Ponto a Melhorar</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Sua menor média está na <strong>{stats.pointToImprove.name}</strong>. Que tal focar nela na próxima redação?
                </p>
            </div>
        </div>
    );
}