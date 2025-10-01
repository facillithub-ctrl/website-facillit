"use client";

import { useEffect, useState, useTransition, useRef } from 'react';
import { Essay, getEssayDetails, submitCorrection } from '../actions';
import Image from 'next/image';
import createClient from '@/utils/supabase/client';

type EssayWithProfile = Essay & {
    profiles: { full_name: string | null } | null;
};

type CommonError = { id: string; error_type: string };

export default function CorrectionInterface({ essayId, onBack }: { essayId: string; onBack: () => void }) {
    const [essay, setEssay] = useState<EssayWithProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    
    // Estados do formulário de correção
    const [feedback, setFeedback] = useState('');
    const [grades, setGrades] = useState({ c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 });
    const [isSubmitting, startTransition] = useTransition();

    // Novos estados para funcionalidades do professor
    const [paragraphComments, setParagraphComments] = useState<Record<number, string>>({});
    const [supportLinks, setSupportLinks] = useState<string[]>(['']);
    const [commonErrors, setCommonErrors] = useState<CommonError[]>([]);
    const [selectedErrors, setSelectedErrors] = useState<Set<string>>(new Set());
    
    // Estados para gravação de áudio
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isUploadingAudio, setIsUploadingAudio] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                // Buscar os tipos de erros comuns
                const { data: errorsData, error: errorsError } = await supabase.from('common_errors').select('id, error_type');
                if (errorsError) throw new Error(`Erro ao buscar erros: ${errorsError.message}`);
                setCommonErrors(errorsData || []);

                // Buscar detalhes da redação
                const result = await getEssayDetails(essayId);
                if (result.data) {
                    setEssay(result.data as EssayWithProfile);
                } else if (result.error) {
                    setError(result.error);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchInitialData();
    }, [essayId, supabase]);
    
    const handleGradeChange = (c: keyof typeof grades, value: string) => {
        const numericValue = parseInt(value, 10);
        if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 200) {
            setGrades(prev => ({ ...prev, [c]: numericValue }));
        }
    };

    const handleToggleError = (errorId: string) => {
        setSelectedErrors(prev => {
            const newSet = new Set(prev);
            if (newSet.has(errorId)) newSet.delete(errorId);
            else newSet.add(errorId);
            return newSet;
        });
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                audioChunksRef.current = [];
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            alert("Não foi possível aceder ao microfone. Por favor, verifique as permissões do seu navegador.");
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    };
    
    const uploadAudio = async (): Promise<string | null> => {
        if (!audioBlob) return null;
        
        setIsUploadingAudio(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("Erro: Utilizador não autenticado para upload.");
            setIsUploadingAudio(false);
            return null;
        }

        const filePath = `audio-feedbacks/${user.id}/${essayId}-${Date.now()}.webm`;
        const { error: uploadError } = await supabase.storage.from('audio_feedbacks').upload(filePath, audioBlob);

        if (uploadError) {
            alert(`Erro no upload do áudio: ${uploadError.message}`);
            setIsUploadingAudio(false);
            return null;
        }

        const { data } = supabase.storage.from('audio_feedbacks').getPublicUrl(filePath);
        setIsUploadingAudio(false);
        return data.publicUrl;
    };

    const handleSubmit = async () => {
        const final_grade = Object.values(grades).reduce((a, b) => a + b, 0);
        if (!feedback) {
            alert("Por favor, adicione um feedback geral.");
            return;
        }

        startTransition(async () => {
            let uploadedAudioUrl: string | null = null;
            if (audioBlob) {
                uploadedAudioUrl = await uploadAudio();
                if (!uploadedAudioUrl) {
                    alert("A correção não foi enviada porque houve uma falha no upload do áudio.");
                    return;
                }
            }

            const result = await submitCorrection({
                essay_id: essayId,
                feedback,
                grade_c1: grades.c1,
                grade_c2: grades.c2,
                grade_c3: grades.c3,
                grade_c4: grades.c4,
                grade_c5: grades.c5,
                final_grade,
                audio_feedback_url: uploadedAudioUrl,
                // Aqui você também enviaria os outros dados como paragraph_comments, etc.
            });
            
            if (!result.error && result.data) {
                const correctionId = result.data.id;
                const errorMappings = Array.from(selectedErrors).map(error_id => ({
                    correction_id: correctionId,
                    error_id: error_id
                }));
                
                if (errorMappings.length > 0) {
                    const { error: errorMappingError } = await supabase.from('essay_correction_errors').insert(errorMappings);
                    if (errorMappingError) {
                        alert(`A correção foi salva, mas houve um erro ao registrar os erros comuns: ${errorMappingError.message}`);
                    }
                }
                
                alert('Correção enviada com sucesso!');
                onBack();
            } else {
                alert(`Erro ao enviar correção: ${result.error}`);
            }
        });
    };

    if (isLoading) return <div className="text-center p-8">A carregar redação...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Erro ao carregar a redação: {error}</div>;
    if (!essay) return <div className="text-center p-8">Redação não encontrada.</div>;

    const totalGrade = Object.values(grades).reduce((a, b) => a + b, 0);

    return (
        <div>
            <button onClick={onBack} className="mb-4 text-sm text-royal-blue font-bold"><i className="fas fa-arrow-left mr-2"></i> Voltar para a fila</button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md border dark:border-dark-border">
                    <h2 className="font-bold text-xl mb-1 dark:text-white-text">{essay.title}</h2>
                    <p className="text-sm text-gray-500 dark:text-dark-text-muted mb-4">Enviada por: {essay.profiles?.full_name || 'Aluno desconhecido'}</p>
                    {essay.image_submission_url ? (
                        <Image src={essay.image_submission_url} alt="Redação enviada" width={800} height={1100} className="rounded-lg object-contain"/>
                    ) : (
                        <div className="text-gray-700 dark:text-dark-text-muted whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md">
                          {essay.content.split('\n\n').map((paragraph, index) => <p key={index} className="mb-4">{paragraph}</p>)}
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md border dark:border-dark-border space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-xl dark:text-white-text">Painel de Correção</h2>
                        <div className="text-2xl font-bold dark:text-white-text">{totalGrade}</div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i}>
                                <label className="block font-medium text-sm mb-1 dark:text-dark-text-muted">Comp. {i}</label>
                                <input type="number" max="200" min="0" step="40" value={grades[`c${i}` as keyof typeof grades]} onChange={(e) => handleGradeChange(`c${i}` as keyof typeof grades, e.target.value)} className="w-full p-2 border rounded-md dark:bg-dark-card dark:border-dark-border dark:text-white-text" />
                            </div>
                        ))}
                    </div>

                    <div>
                        <h3 className="font-bold mb-2 dark:text-white-text">Apontar Erros Comuns</h3>
                        <div className="flex flex-wrap gap-2">
                            {commonErrors.map(err => (
                                <button key={err.id} onClick={() => handleToggleError(err.id)} className={`px-3 py-1 text-xs rounded-full border transition-colors ${selectedErrors.has(err.id) ? 'bg-royal-blue text-white border-royal-blue' : 'bg-transparent border-gray-300 dark:border-dark-border dark:text-dark-text-muted hover:border-royal-blue'}`}>{err.error_type}</button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="font-bold mb-2 dark:text-white-text">Feedback Geral</h3>
                        <textarea rows={6} value={feedback} onChange={e => setFeedback(e.target.value)} className="w-full p-2 border rounded-md dark:bg-dark-card dark:border-dark-border dark:text-white-text"></textarea>
                        <div className="mt-2 flex items-center gap-4">
                            {!isRecording && !audioUrl && <button onClick={startRecording} className="flex items-center gap-2 text-sm text-royal-blue font-bold"><i className="fas fa-microphone"></i> Gravar áudio de feedback</button>}
                            {isRecording && <button onClick={stopRecording} className="flex items-center gap-2 text-sm text-red-500 font-bold"><i className="fas fa-stop-circle animate-pulse"></i> A gravar... (clique para parar)</button>}
                            {audioUrl && (
                                <div className="flex items-center gap-2 w-full">
                                    <audio src={audioUrl} controls className="flex-grow"></audio>
                                    <button onClick={() => { setAudioBlob(null); setAudioUrl(null); }} className="text-red-500"><i className="fas fa-trash"></i></button>
                                </div>
                            )}
                        </div>
                    </div>

                    <button onClick={handleSubmit} disabled={isSubmitting || isUploadingAudio} className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                        {isSubmitting ? 'A enviar...' : isUploadingAudio ? 'A processar áudio...' : 'Enviar Correção'}
                    </button>
                </div>
            </div>
        </div>
    );
}