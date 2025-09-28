"use client";

import { useEffect, useState, useTransition } from 'react';
import { Essay, getEssayDetails, submitCorrection } from '../actions';

// Ajustamos o tipo para incluir o nome do aluno
type EssayWithProfile = Essay & {
    profiles: { full_name: string | null } | null;
};

export default function CorrectionInterface({ essayId, onBack }: { essayId: string; onBack: () => void }) {
    const [essay, setEssay] = useState<EssayWithProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [feedback, setFeedback] = useState('');
    const [grades, setGrades] = useState({ c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 });
    const [isSubmitting, startTransition] = useTransition();

    useEffect(() => {
        getEssayDetails(essayId).then(result => {
            if (result.data) {
                setEssay(result.data as EssayWithProfile);
            } else if (result.error) {
                setError(result.error);
            }
            setIsLoading(false);
        });
    }, [essayId]);
    
    const handleGradeChange = (c: keyof typeof grades, value: string) => {
        const numericValue = parseInt(value, 10);
        // Garante que a nota esteja entre 0 e 200
        if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 200) {
            setGrades(prev => ({ ...prev, [c]: numericValue }));
        }
    };
    
    const handleSubmit = () => {
        const final_grade = Object.values(grades).reduce((a, b) => a + b, 0);
        if (!feedback) {
            alert("Por favor, adicione um feedback geral.");
            return;
        }
        
        startTransition(async () => {
            const result = await submitCorrection({
                essay_id: essayId,
                feedback,
                grade_c1: grades.c1,
                grade_c2: grades.c2,
                grade_c3: grades.c3,
                grade_c4: grades.c4,
                grade_c5: grades.c5,
                final_grade
            });
            if (!result.error) {
                alert('Correção enviada com sucesso!');
                onBack();
            } else {
                alert(`Erro ao enviar correção: ${result.error}`);
            }
        });
    };

    if (isLoading) return <div>Carregando redação...</div>;
    if (error) return <div>Erro ao carregar a redação: {error}</div>;
    if (!essay) return <div>Redação não encontrada.</div>;

    const totalGrade = Object.values(grades).reduce((a, b) => a + b, 0);

    return (
        <div>
            <button onClick={onBack} className="mb-4 text-sm text-royal-blue font-bold">
                <i className="fas fa-arrow-left mr-2"></i> Voltar para a fila
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna da Redação */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="font-bold text-xl mb-1">{essay.title}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Enviada por: {essay.profiles?.full_name || 'Aluno desconhecido'}</p>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {essay.content}
                    </p>
                </div>
                {/* Coluna de Feedback */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-xl">Painel de Correção</h2>
                        <div className="text-xl font-bold">Nota Final: {totalGrade}</div>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i}>
                                <label className="block font-medium text-sm mb-1">Competência {i}</label>
                                <input 
                                    type="number" 
                                    max="200" 
                                    min="0" 
                                    step="40"
                                    value={grades[`c${i}` as keyof typeof grades]}
                                    onChange={(e) => handleGradeChange(`c${i}` as keyof typeof grades, e.target.value)}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" 
                                />
                            </div>
                        ))}
                        <div>
                            <label className="block font-medium text-sm mb-1">Feedback Geral</label>
                            <textarea 
                                rows={8}
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                            ></textarea>
                        </div>
                        <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                            {isSubmitting ? 'Enviando...' : 'Enviar Correção'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}