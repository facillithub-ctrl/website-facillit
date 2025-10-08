"use client";

import { useEffect, useState, useTransition } from 'react';
import { getTestWithQuestions, submitTestAttempt } from '../actions';
import type { TestWithQuestions } from '../actions';
// CORREÇÃO: Ajustado o caminho de importação para o local original do Timer.
import Timer from '../../write/components/Timer';

type Answer = { questionId: string; answer: number | string | null };

type Props = {
  testId: string;
  onFinish: () => void;
};

export default function AttemptView({ testId, onFinish }: Props) {
    const [test, setTest] = useState<TestWithQuestions | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, startSubmitTransition] = useTransition();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>([]);

    useEffect(() => {
        const fetchTest = async () => {
            setIsLoading(true);
            const { data } = await getTestWithQuestions(testId);
            if (data) {
                setTest(data);
                setAnswers(data.questions.map(q => ({ questionId: q.id, answer: null })));
            }
            setIsLoading(false);
        };
        fetchTest();
    }, [testId]);

    const handleAnswerChange = (questionId: string, answer: number | string) => {
        setAnswers(currentAnswers =>
            currentAnswers.map(a => (a.questionId === questionId ? { ...a, answer } : a))
        );
    };

    const handleFinishAttempt = () => {
        if (!test) return;

        if (confirm("Tem certeza que deseja finalizar e enviar suas respostas?")) {
            startSubmitTransition(async () => {
                let score = 0;
                test.questions.forEach((q) => {
                    const studentAnswer = answers.find(a => a.questionId === q.id);
                    if (q.question_type === 'multiple_choice' && studentAnswer?.answer === q.content.correct_option) {
                        score += q.points;
                    }
                });
                const totalPoints = test.questions.reduce((acc, q) => acc + q.points, 0);
                const finalPercentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    
                await submitTestAttempt({
                    test_id: test.id,
                    answers: answers,
                    score: finalPercentage,
                });
                alert("Simulado enviado com sucesso!");
                onFinish();
            });
        }
    };
    
    if (isLoading) return <div className="text-center p-8 glass-card">Carregando simulado...</div>;
    if (!test) return <div className="text-center p-8 glass-card">Erro ao carregar simulado. Tente novamente.</div>;

    const currentQuestion = test.questions[currentQuestionIndex];
    const currentAnswer = answers.find(a => a.questionId === currentQuestion.id)?.answer;

    return (
        <div className="glass-card p-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">{test.title}</h2>
                    <p className="text-dark-text-muted">Questão {currentQuestionIndex + 1} de {test.questions.length}</p>
                </div>
                <Timer isRunning={true} durationInSeconds={test.duration_minutes * 60} onTimeUp={handleFinishAttempt} />
            </div>

            <div>
                <div className="prose dark:prose-invert max-w-none mb-6" dangerouslySetInnerHTML={{ __html: currentQuestion.content.statement }} />

                {currentQuestion.question_type === 'multiple_choice' && (
                    <div className="space-y-3">
                        {currentQuestion.content.options?.map((option, index) => (
                            <label key={index} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${currentAnswer === index ? 'bg-royal-blue/30 border-royal-blue' : 'border-white/20 hover:bg-white/10'}`}>
                                <input
                                    type="radio"
                                    name={currentQuestion.id}
                                    checked={currentAnswer === index}
                                    onChange={() => handleAnswerChange(currentQuestion.id, index)}
                                    className="h-5 w-5 mr-4 text-royal-blue bg-transparent border-white/50 focus:ring-royal-blue"
                                />
                                <span className="font-mono mr-3 text-dark-text dark:text-white">{String.fromCharCode(65 + index)})</span>
                                <span className="text-dark-text dark:text-white">{option}</span>
                            </label>
                        ))}
                    </div>
                )}
                 {currentQuestion.question_type === 'dissertation' && (
                    <textarea 
                        placeholder="Digite sua resposta aqui..."
                        className="w-full h-48 p-4 border rounded-md dark:bg-dark-card dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-royal-blue dark:text-white"
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        value={(typeof currentAnswer === 'string' ? currentAnswer : '')}
                    />
                )}
            </div>
            
            <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/10">
                <button 
                    onClick={() => setCurrentQuestionIndex(i => i - 1)}
                    disabled={currentQuestionIndex === 0}
                    className="bg-white/20 hover:bg-white/30 font-bold py-2 px-4 rounded-lg disabled:opacity-50"
                >
                    Anterior
                </button>
                {currentQuestionIndex === test.questions.length - 1 ? (
                     <button onClick={handleFinishAttempt} disabled={isSubmitting} className="bg-green-500 hover:bg-green-600 font-bold py-2 px-6 rounded-lg disabled:opacity-50">
                        {isSubmitting ? 'Enviando...' : 'Finalizar e Enviar'}
                    </button>
                ) : (
                    <button 
                        onClick={() => setCurrentQuestionIndex(i => i + 1)}
                        className="bg-royal-blue hover:bg-opacity-90 font-bold py-2 px-4 rounded-lg"
                    >
                        Próxima
                    </button>
                )}
            </div>
        </div>
    );
}