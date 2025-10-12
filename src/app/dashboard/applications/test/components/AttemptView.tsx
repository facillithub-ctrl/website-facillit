"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from 'react';
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
    const [answers, setAnswers] = useState<StudentAnswerPayload[]>(
        test.questions.map(q => ({ questionId: q.id, answer: null, time_spent: 0 }))
    );
    const router = useRouter();
    const { addToast } = useToast();

    // -- INÍCIO DAS MODIFICAÇÕES --

    // 1. Variável de controlo para saber se é uma pesquisa
    const isSurvey = test.test_type === 'pesquisa';

    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    // 2. O alerta de fraude só inicia aberto se NÃO for uma pesquisa
    const [isFraudAlertOpen, setFraudAlertOpen] = useState(!isSurvey);

    const questionStartTimeRef = useRef<number>(Date.now());
    const totalTimeStartRef = useRef<number>(Date.now());

    const executeSubmit = useCallback((isAutoSubmit = false) => {
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
                if(isAutoSubmit) {
                    addToast({ title: "Simulado Finalizado", message: "Sua tentativa foi encerrada por você ter saído da tela.", type: 'error' });
                } else if (!isSurvey && test.is_knowledge_test && test.related_prompt_id) {
                    if (confirm("Parabéns! Você concluiu o teste.\nAcha que consegue escrever uma redação sobre esse tema?")) {
                        router.push(`/dashboard/applications/write?promptId=${test.related_prompt_id}`);
                    } else {
                        onFinish();
                    }
                } else {
                    // 3. Mensagem de sucesso personalizada
                    addToast({ title: isSurvey ? "Pesquisa Enviada!" : "Simulado Enviado!", message: isSurvey ? "Obrigado pela sua participação." : "Seu resultado já está disponível no painel.", type: 'success' });
                    onFinish();
                }
            }
        });
    }, [addToast, answers, currentQuestionIndex, onFinish, router, test.id, test.is_knowledge_test, test.questions, test.related_prompt_id, isSurvey]);

    // 4. Mecanismos Antifraude agora só rodam se NÃO for pesquisa
    useEffect(() => {
        if (isSurvey) return; // Se for pesquisa, não adiciona os listeners

        const handleCopy = (e: ClipboardEvent) => { e.preventDefault(); addToast({ title: "Ação Bloqueada", message: "Copiar conteúdo não é permitido durante o simulado.", type: "error" }); };
        const handlePaste = (e: ClipboardEvent) => { e.preventDefault(); addToast({ title: "Ação Bloqueada", message: "Colar conteúdo não é permitido durante o simulado.", type: "error" }); };
        const handleVisibilityChange = () => { if (document.hidden && !isFraudAlertOpen && !isConfirmModalOpen) { executeSubmit(true); } };

        document.addEventListener('copy', handleCopy);
        document.addEventListener('paste', handlePaste);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isSurvey, isFraudAlertOpen, isConfirmModalOpen, addToast, executeSubmit]);

    // -- FIM DAS MODIFICAÇÕES --

    useEffect(() => {
        const previousQuestionIndex = currentQuestionIndex > 0 ? currentQuestionIndex - 1 : 0;
        const previousQuestionId = test.questions[previousQuestionIndex].id;
        questionStartTimeRef.current = Date.now();
        return () => {
            const timeSpent = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
            setAnswers(currentAnswers => currentAnswers.map(a => a.questionId === previousQuestionId ? { ...a, time_spent: a.time_spent + timeSpent } : a));
        };
    }, [currentQuestionIndex, test.questions]);

    const handleAnswerChange = (questionId: string, answer: number | string) => { setAnswers(currentAnswers => currentAnswers.map(a => (a.questionId === questionId ? { ...a, answer } : a))); };
    const goToNextQuestion = () => { if (currentQuestionIndex < test.questions.length - 1) { setCurrentQuestionIndex(i => i + 1); } };
    const goToPreviousQuestion = () => { if (currentQuestionIndex > 0) { setCurrentQuestionIndex(i => i - 1); } };
    const handleFinishAttempt = () => { setConfirmModalOpen(true); };

    if (!test || !test.questions || test.questions.length === 0) {
        return <div className="text-center p-8 glass-card"><p>Erro: O item não pôde ser carregado ou não contém questões.</p><button onClick={onFinish} className="mt-4 bg-royal-blue text-white font-bold py-2 px-4 rounded-lg">Voltar</button></div>;
    }

    const currentQuestion = test.questions[currentQuestionIndex];
    const currentAnswer = answers.find(a => a.questionId === currentQuestion.id)?.answer;

    return (
        <div>
            {/* 5. Alerta de fraude só aparece se NÃO for pesquisa */}
            {!isSurvey && isFraudAlertOpen && (
                 <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-xl max-w-md w-full text-center">
                        <i className="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
                        <h2 className="text-xl font-bold mb-2">Atenção!</h2>
                        <p className="text-text-muted mb-6">Para garantir a lisura do simulado, não é permitido sair desta tela (minimizar ou trocar de aba). Caso isso aconteça, sua tentativa será finalizada automaticamente. Ações de copiar e colar também estão desativadas.</p>
                        <button onClick={() => setFraudAlertOpen(false)} className="bg-royal-blue text-white font-bold py-2 px-6 rounded-lg">Entendi, começar o simulado</button>
                    </div>
                </div>
            )}

            {/* 6. Textos do modal de confirmação são dinâmicos */}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                title={isSurvey ? "Finalizar Pesquisa?" : "Finalizar Simulado?"}
                message={isSurvey ? "Tem certeza que deseja enviar suas respostas?" : "Tem certeza que deseja finalizar e enviar suas respostas? Esta ação não pode ser desfeita."}
                onConfirm={() => executeSubmit()}
                onClose={() => setConfirmModalOpen(false)}
                confirmText={isSurvey ? "Enviar Respostas" : "Finalizar e Enviar"}
            />

            <div className="glass-card p-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white">{test.title}</h2>
                        <p className="text-dark-text-muted">Questão {currentQuestionIndex + 1} de {test.questions.length}</p>
                    </div>
                    {/* 7. Timer só aparece se NÃO for pesquisa */}
                    {!isSurvey && <Timer isRunning={!isFraudAlertOpen} durationInSeconds={(test.duration_minutes || 60) * 60} onTimeUp={handleFinishAttempt} />}
                </div>
                <div>
                    {currentQuestion.content.base_text && ( <div className="prose dark:prose-invert max-w-none mb-6 border dark:border-dark-border rounded-lg p-4 bg-gray-50 dark:bg-dark-card/50" dangerouslySetInnerHTML={{ __html: currentQuestion.content.base_text }} /> )}
                    {currentQuestion.content.statement && ( <div className="prose dark:prose-invert max-w-none mb-6" dangerouslySetInnerHTML={{ __html: currentQuestion.content.statement }} /> )}
                    {currentQuestion.question_type === 'multiple_choice' && (
                        <div className="space-y-3">
                            {currentQuestion.content.options?.map((option, index) => (
                                <label key={index} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${currentAnswer === index ? 'bg-royal-blue/30 border-royal-blue' : 'border-white/20 hover:bg-white/10'}`}>
                                    <input type="radio" name={currentQuestion.id} checked={currentAnswer === index} onChange={() => handleAnswerChange(currentQuestion.id, index)} className="h-5 w-5 mr-4 text-royal-blue bg-transparent border-white/50 focus:ring-royal-blue"/>
                                    <span className="font-mono mr-3 text-dark-text dark:text-white">{String.fromCharCode(65 + index)})</span>
                                    <span className="text-dark-text dark:text-white">{option}</span>
                                </label>
                            ))}
                        </div>
                    )}
                    {currentQuestion.question_type === 'dissertation' && ( <textarea placeholder="Digite sua resposta aqui..." className="w-full h-48 p-4 border rounded-md dark:bg-dark-card dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-royal-blue dark:text-white" onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)} value={(typeof currentAnswer === 'string' ? currentAnswer : '')}/> )}
                </div>
                <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/10">
                    <button onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0 || (!isSurvey && isFraudAlertOpen)} className="bg-white/20 hover:bg-white/30 font-bold py-2 px-4 rounded-lg disabled:opacity-50">Anterior</button>
                    {currentQuestionIndex === test.questions.length - 1 ? (
                        <button onClick={handleFinishAttempt} disabled={isSubmitting || (!isSurvey && isFraudAlertOpen)} className="bg-green-500 hover:bg-green-600 font-bold py-2 px-6 rounded-lg disabled:opacity-50">
                            {/* 8. Texto do botão final é dinâmico */}
                            {isSubmitting ? 'Enviando...' : (isSurvey ? 'Finalizar Pesquisa' : 'Finalizar e Enviar')}
                        </button>
                    ) : (
                        <button onClick={goToNextQuestion} disabled={!isSurvey && isFraudAlertOpen} className="bg-royal-blue hover:bg-opacity-90 font-bold py-2 px-4 rounded-lg disabled:opacity-50">Próxima</button>
                    )}
                </div>
            </div>
        </div>
    );
}