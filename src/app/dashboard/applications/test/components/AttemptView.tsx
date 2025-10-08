"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { submitTestAttempt } from '../actions';
import type { TestWithQuestions, StudentAnswer } from '../actions';
import Timer from './Timer';
import { useToast } from '@/contexts/ToastContext';
// Verifique se esta linha de importação está correta
import ConfirmationModal from '@/components/ConfirmationModal';

type Props = {
  test: TestWithQuestions;
  onFinish: () => void;
};

export default function AttemptView({ test, onFinish }: Props) {
    const [isSubmitting, startSubmitTransition] = useTransition();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<StudentAnswer[]>(
        test.questions.map(q => ({ questionId: q.id, answer: null }))
    );
    const router = useRouter();
    const { addToast } = useToast();
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

    const handleAnswerChange = (questionId: string, answer: number | string) => {
        setAnswers(currentAnswers =>
            currentAnswers.map(a => (a.questionId === questionId ? { ...a, answer } : a))
        );
    };

    const executeSubmit = () => {
        setConfirmModalOpen(false);
        startSubmitTransition(async () => {
            const result = await submitTestAttempt({
                test_id: test.id,
                answers: answers,
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
        if (!test) return;
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
        </div>
    );
}