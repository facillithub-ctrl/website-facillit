"use client";

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { submitTestAttempt } from '../actions';
import type { TestWithQuestions, StudentAnswerPayload } from '../actions';
import Timer from './Timer';
import { useToast } from '@/contexts/ToastContext';
import ConfirmationModal from '@/components/ConfirmationModal';

type Props = {
  test: TestWithQuestions;
  onFinish: () => void;
};

export default function AttemptView({ test, onFinish }: Props) {
    const [isSubmitting, startSubmitTransition] = useTransition();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    // Armazena o objeto completo da resposta, incluindo o tempo gasto
    const [answers, setAnswers] = useState<StudentAnswerPayload[]>(
        test.questions.map(q => ({ questionId: q.id, answer: null, time_spent: 0 }))
    );
    const router = useRouter();
    const { addToast } = useToast();
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

    // Refs para controle de tempo
    const questionStartTimeRef = useRef<number>(Date.now());
    const totalTimeStartRef = useRef<number>(Date.now());

    // Efeito para atualizar o tempo da questão ao trocar de slide
    useEffect(() => {
        const previousQuestionIndex = currentQuestionIndex > 0 ? currentQuestionIndex - 1 : 0;
        const previousQuestionId = test.questions[previousQuestionIndex].id;
        
        // Zera o cronômetro para a nova questão
        questionStartTimeRef.current = Date.now();

        // Esta função de limpeza será chamada QUANDO a questão mudar
        return () => {
            const timeSpent = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
            setAnswers(currentAnswers =>
                currentAnswers.map(a =>
                    a.questionId === previousQuestionId
                        ? { ...a, time_spent: a.time_spent + timeSpent }
                        : a
                )
            );
        };
    }, [currentQuestionIndex, test.questions]);

    const handleAnswerChange = (questionId: string, answer: number | string) => {
        setAnswers(currentAnswers =>
            currentAnswers.map(a => (a.questionId === questionId ? { ...a, answer } : a))
        );
    };
    
    const goToNextQuestion = () => {
        if (currentQuestionIndex < test.questions.length - 1) {
            setCurrentQuestionIndex(i => i + 1);
        }
    };
    
    const goToPreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(i => i - 1);
        }
    };

    const executeSubmit = () => {
        // Salva o tempo da última questão antes de submeter
        const lastQuestionId = test.questions[currentQuestionIndex].id;
        const timeSpentOnLast = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
        const finalAnswers = answers.map(a => 
            a.questionId === lastQuestionId 
                ? { ...a, time_spent: a.time_spent + timeSpentOnLast } 
                : a
        );
        const totalTimeSpent = Math.round((Date.now() - totalTimeStartRef.current) / 1000);

        setConfirmModalOpen(false);
        startSubmitTransition(async () => {
            const result = await submitTestAttempt({
                test_id: test.id,
                answers: finalAnswers,
                time_spent: totalTimeSpent
            });

            if (result.error) {
                addToast({ title: "Erro ao Enviar", message: `Não foi possível registrar suas respostas: ${result.error}`, type: 'error' });
            } else {
                if (test.is_knowledge_test && test.related_prompt_id) {
                    if (confirm("Parabéns! Você concluiu o teste.\nAcha que consegue escrever uma redação sobre esse tema?")) {
                        router.push(`/dashboard/applications/write?promptId=${test.related_prompt_id}`);
                    } else {
                        onFinish();
                    }
                } else {
                    addToast({ title: "Simulado Enviado!", message: "Seu resultado já está disponível no painel.", type: 'success' });
                    onFinish();
                }
            }
        });
    };
    
    const handleFinishAttempt = () => {
        setConfirmModalOpen(true);
    };
    
    if (!test || !test.questions || test.questions.length === 0) {
        return (
            <div className="text-center p-8 glass-card">
                <p>Erro: O simulado não pôde ser carregado ou não contém questões.</p>
                <button onClick={onFinish} className="mt-4 bg-royal-blue text-white font-bold py-2 px-4 rounded-lg">
                    Voltar
                </button>
            </div>
        );
    }

    const currentQuestion = test.questions[currentQuestionIndex];
    const currentAnswer = answers.find(a => a.questionId === currentQuestion.id)?.answer;

    return (
        <div>
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                title="Finalizar Simulado?"
                message="Tem certeza que deseja finalizar e enviar suas respostas? Esta ação não pode ser desfeita."
                onConfirm={executeSubmit}
                onClose={() => setConfirmModalOpen(false)}
                confirmText="Finalizar e Enviar"
            />

            <div className="glass-card p-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white">{test.title}</h2>
                        <p className="text-dark-text-muted">Questão {currentQuestionIndex + 1} de {test.questions.length}</p>
                    </div>
                    <Timer isRunning={true} durationInSeconds={(test.duration_minutes || 60) * 60} onTimeUp={handleFinishAttempt} />
                </div>

                <div>
                    {currentQuestion.content.base_text && (
                        <div className="prose dark:prose-invert max-w-none mb-6 border dark:border-dark-border rounded-lg p-4 bg-gray-50 dark:bg-dark-card/50" dangerouslySetInnerHTML={{ __html: currentQuestion.content.base_text }} />
                    )}

                    {currentQuestion.content.statement && (
                        <div className="prose dark:prose-invert max-w-none mb-6" dangerouslySetInnerHTML={{ __html: currentQuestion.content.statement }} />
                    )}

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
                        onClick={goToPreviousQuestion}
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
                            onClick={goToNextQuestion}
                            className="bg-royal-blue hover:bg-opacity-90 font-bold py-2 px-4 rounded-lg"
                        >
                            Próxima
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}