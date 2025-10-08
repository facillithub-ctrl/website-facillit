"use client";

type Test = {
    id: string;
    title: string;
    subject: string | null;
    question_count: number;
    duration_minutes: number;
    difficulty: 'Fácil' | 'Médio' | 'Difícil';
    avg_score: number;
    total_attempts: number;
    points: number;
};

type Props = {
    test: Test;
    onStart: (testId: string) => void;
    onViewDetails: (testId: string) => void; // Nova propriedade para ver detalhes
};

const difficultyStyles = {
    'Fácil': { icon: 'fa-leaf', color: 'text-green-500' },
    'Médio': { icon: 'fa-seedling', color: 'text-yellow-500' },
    'Difícil': { icon: 'fa-bolt', color: 'text-red-500' },
};

export default function AvailableTestCard({ test, onStart, onViewDetails }: Props) {
    const difficulty = difficultyStyles[test.difficulty] || difficultyStyles['Médio'];

    return (
        <div className="glass-card flex flex-col p-5">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-dark-text dark:text-white mb-1">{test.title}</h3>
                    {/* Exibe a categoria (subject) */}
                    {test.subject && (
                        <span className="text-xs font-semibold bg-royal-blue/10 text-royal-blue px-2 py-0.5 rounded-full">{test.subject}</span>
                    )}
                </div>
                <div className={`flex items-center gap-2 text-sm font-semibold ${difficulty.color}`}>
                    <i className={`fas ${difficulty.icon}`}></i>
                    <span>{test.difficulty}</span>
                </div>
            </div>
            
            <div className="text-xs text-dark-text-muted space-x-4 my-4">
                <span><i className="fas fa-list-ol mr-1"></i> {test.question_count} questões</span>
                <span><i className="fas fa-clock mr-1"></i> {test.duration_minutes} min</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-dark-text-muted mb-auto pb-4">
                <i className="fas fa-star text-yellow-400"></i>
                <span className="font-semibold">{test.avg_score.toFixed(1)}</span>
                <span>• {test.total_attempts.toLocaleString('pt-BR')} realizaram</span>
            </div>
            
            <div className="border-t border-white/10 pt-4 text-center">
                 <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-green-500 text-sm">+{test.points} pts</span>
                    <button 
                        onClick={() => onStart(test.id)}
                        className="bg-royal-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-transform hover:scale-105"
                    >
                        Iniciar Simulado
                    </button>
                </div>
                 <button 
                    onClick={() => onViewDetails(test.id)} 
                    className="w-full text-center text-sm text-dark-text-muted hover:underline"
                 >
                    Ver Detalhes
                </button>
            </div>
        </div>
    );
}