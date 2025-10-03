"use client";

import { useEffect, useState, useTransition, useRef, MouseEvent } from 'react';
import { Essay, getEssayDetails, submitCorrection, Annotation, getAIFeedbackForEssay, AIFeedback } from '../actions';
import Image from 'next/image';
import createClient from '@/utils/supabase/client';

// --- SUB-COMPONENTES E TIPOS ---

type EssayWithProfile = Essay & {
    profiles: { full_name: string | null } | null;
};

type CommonError = { id: string; error_type: string };

type AnnotationPopupProps = {
    position: { top: number; left: number };
    onSave: (comment: string, marker: Annotation['marker']) => void;
    onClose: () => void;
};

const AnnotationPopup = ({ position, onSave, onClose }: AnnotationPopupProps) => {
    const [comment, setComment] = useState('');
    const [marker, setMarker] = useState<Annotation['marker']>('sugestao');

    const handleSave = () => {
        if (comment.trim()) {
            onSave(comment, marker);
        }
    };

    return (
        <div
            className="absolute z-10 bg-white dark:bg-dark-card shadow-lg rounded-lg p-3 w-64 border dark:border-dark-border"
            style={{ top: position.top, left: position.left }}
            onClick={(e) => e.stopPropagation()}
        >
            <textarea
                placeholder="Adicione seu comentário..."
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 mb-2"
                autoFocus
            />
            <div className="flex justify-between items-center">
                <select
                    value={marker}
                    onChange={(e) => setMarker(e.target.value as Annotation['marker'])}
                    className="text-xs p-1 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                    <option value="sugestao">Sugestão</option>
                    <option value="acerto">Acerto</option>
                    <option value="erro">Erro</option>
                </select>
                <div>
                    <button onClick={onClose} className="text-xs px-2 py-1 mr-1">Cancelar</button>
                    <button onClick={handleSave} className="text-xs bg-royal-blue text-white px-3 py-1 rounded-md font-bold">Salvar</button>
                </div>
            </div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL ---
export default function CorrectionInterface({ essayId, onBack }: { essayId: string; onBack: () => void }) {
    const [essay, setEssay] = useState<EssayWithProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const [feedback, setFeedback] = useState('');
    const [grades, setGrades] = useState({ c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 });
    const [isSubmitting, startTransition] = useTransition();

    const [commonErrors, setCommonErrors] = useState<CommonError[]>([]);
    const [selectedErrors, setSelectedErrors] = useState<Set<string>>(new Set());

    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isUploadingAudio, setIsUploadingAudio] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const [annotations, setAnnotations] = useState<Annotation[]>([]);

    const [popupState, setPopupState] = useState<{ visible: boolean; x: number; y: number; selectionText?: string; position?: Annotation['position'] }>({ visible: false, x: 0, y: 0 });
    const imageContainerRef = useRef<HTMLDivElement>(null);

    const [aiFeedback, setAIFeedback] = useState<AIFeedback | null>(null);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    const [isDrawing, setIsDrawing] = useState(false);
    const [selectionBox, setSelectionBox] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
    const startCoords = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const { data: errorsData, error: errorsError } = await supabase.from('common_errors').select('id, error_type');
                if (errorsError) throw new Error(`Erro ao buscar erros: ${errorsError.message}`);
                setCommonErrors(errorsData || []);

                const result = await getEssayDetails(essayId);
                if (result.data) {
                    setEssay(result.data as EssayWithProfile);
                } else if (result.error) {
                    setError(result.error);
                }

                const { data: existingAIFeedback } = await getAIFeedbackForEssay(essayId);
                if (existingAIFeedback) {
                    setAIFeedback(existingAIFeedback as AIFeedback);
                }

            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Ocorreu um erro desconhecido.");
                }
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
        } catch {
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

    const handleTextMouseUp = () => {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed && selection.toString().trim() !== '') {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setPopupState({ visible: true, x: rect.left + window.scrollX, y: rect.bottom + window.scrollY, selectionText: selection.toString() });
        } else if (popupState.visible) {
            setPopupState({ visible: false, x: 0, y: 0 });
        }
    };

    const handleImageMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if (popupState.visible) {
            setPopupState({ visible: false, x: 0, y: 0 });
            return;
        }
        setIsDrawing(true);
        const rect = imageContainerRef.current!.getBoundingClientRect();
        startCoords.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        setSelectionBox({ x: e.clientX - rect.left, y: e.clientY - rect.top, width: 0, height: 0 });
    };

    const handleImageMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!isDrawing) return;
        const rect = imageContainerRef.current!.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        const x = Math.min(startCoords.current.x, currentX);
        const y = Math.min(startCoords.current.y, currentY);
        const width = Math.abs(currentX - startCoords.current.x);
        const height = Math.abs(currentY - startCoords.current.y);
        setSelectionBox({ x, y, width, height });
    };

    const handleImageMouseUp = (e: MouseEvent<HTMLDivElement>) => {
        setIsDrawing(false);
        if (selectionBox && (selectionBox.width > 5 || selectionBox.height > 5)) {
            const rect = imageContainerRef.current!.getBoundingClientRect();
            const position = {
                x: (selectionBox.x / rect.width) * 100,
                y: (selectionBox.y / rect.height) * 100,
                width: (selectionBox.width / rect.width) * 100,
                height: (selectionBox.height / rect.height) * 100,
            };
            setPopupState({ visible: true, x: e.pageX, y: e.pageY, position });
        }
        setSelectionBox(null);
    };

    const handleSaveAnnotation = (comment: string, marker: Annotation['marker']) => {
        let newAnnotation: Annotation;

        if (popupState.selectionText) {
            newAnnotation = {
                id: crypto.randomUUID(),
                type: 'text',
                selection: popupState.selectionText,
                comment,
                marker,
            };
        } else if (popupState.position) {
            newAnnotation = {
                id: crypto.randomUUID(),
                type: 'image',
                position: popupState.position,
                comment,
                marker,
            };
        } else { return; }

        setAnnotations(prev => [...prev, newAnnotation]);
        setPopupState({ visible: false, x: 0, y: 0 });
    };

    const handleGenerateAIFeedback = async () => {
        if (!essay?.content?.trim()) {
            alert("A redação não tem conteúdo de texto para ser analisado. A análise de imagens (OCR) será implementada em breve.");
            return;
        }

        setIsGeneratingAI(true);
        try {
            const response = await fetch('/api/generate-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: essay.content }),
            });

            const responseBody = await response.json();

            if (!response.ok) {
                const errorMessage = responseBody.error || "Falha ao gerar o feedback da IA.";
                throw new Error(errorMessage);
            }

            setAIFeedback(responseBody);
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert("Ocorreu um erro desconhecido.");
            }
        } finally {
            setIsGeneratingAI(false);
        }
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
                annotations,
                ai_feedback: aiFeedback,
            });

            if (!result.error && result.data) {
                const correctionId = (result.data as { id: string }).id;
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

    const markerStyles = {
        erro: 'border-red-500',
        acerto: 'border-green-500',
        sugestao: 'border-blue-500',
    };

    return (
        <div>
            {popupState.visible && (
                <AnnotationPopup
                    position={{ top: popupState.y + 5, left: popupState.x }}
                    onSave={handleSaveAnnotation}
                    onClose={() => setPopupState({ visible: false, x: 0, y: 0 })}
                />
            )}
            <button onClick={onBack} className="mb-4 text-sm text-royal-blue font-bold"><i className="fas fa-arrow-left mr-2"></i> Voltar para a fila</button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md border dark:border-dark-border">
                    <h2 className="font-bold text-xl mb-1 dark:text-white-text">{essay.title}</h2>
                    <p className="text-sm text-gray-500 dark:text-dark-text-muted mb-4">Enviada por: {essay.profiles?.full_name || 'Aluno desconhecido'}</p>

                    {essay.image_submission_url ? (
                        <div
                            ref={imageContainerRef}
                            onMouseDown={handleImageMouseDown}
                            onMouseMove={handleImageMouseMove}
                            onMouseUp={handleImageMouseUp}
                            onMouseLeave={() => {setIsDrawing(false); setSelectionBox(null);}}
                            className="relative w-full h-auto cursor-crosshair"
                        >
                            <Image src={essay.image_submission_url} alt="Redação enviada" width={800} height={1100} className="rounded-lg object-contain select-none pointer-events-none" draggable="false" />

                            {isDrawing && selectionBox && (
                                <div className="absolute border-2 border-dashed border-royal-blue bg-royal-blue/20 pointer-events-none" style={{ left: selectionBox.x, top: selectionBox.y, width: selectionBox.width, height: selectionBox.height }} />
                            )}

                            {annotations.filter(a => a.type === 'image' && a.position?.width).map(a => (
                                <div key={a.id} className={`absolute border-2 bg-yellow-400/20 group pointer-events-none ${markerStyles[a.marker]}`} style={{ left: `${a.position!.x}%`, top: `${a.position!.y}%`, width: `${a.position!.width}%`, height: `${a.position!.height}%` }}>
                                    <div className="absolute -top-7 left-0 w-max px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {a.comment}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div onMouseUp={handleTextMouseUp} className="text-gray-700 dark:text-dark-text-muted whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md cursor-text">
                            {/* CORREÇÃO: Removida a renderização duplicada do texto */}
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
                        <h3 className="font-bold mb-2 dark:text-white-text">Análise com Inteligência Artificial</h3>
                        {aiFeedback ? (
                             <div className="p-4 bg-green-50 dark:bg-green-900/20 text-center rounded-lg">
                                <p className="text-sm text-green-700 dark:text-green-300 font-medium">Análise da IA já foi gerada para esta redação.</p>
                            </div>
                        ) : (
                            <button onClick={handleGenerateAIFeedback} disabled={isGeneratingAI} className="w-full flex items-center justify-center gap-2 py-2 px-4 border-2 border-dashed rounded-lg text-text-muted hover:border-royal-blue hover:text-royal-blue transition disabled:opacity-50">
                                <i className={`fas ${isGeneratingAI ? 'fa-spinner fa-spin' : 'fa-robot'}`}></i>
                                {isGeneratingAI ? 'Analisando...' : 'Gerar Análise com IA'}
                            </button>
                        )}
                    </div>

                    <div className="border-t dark:border-gray-700 pt-4">
                         <h3 className="font-bold mb-2 dark:text-white-text">Feedback Geral (Humano)</h3>
                         <textarea rows={6} value={feedback} onChange={e => setFeedback(e.target.value)} className="w-full p-2 border rounded-md dark:bg-dark-card dark:border-dark-border dark:text-white-text"></textarea>
                         <div className="mt-2 flex items-center gap-4">
                             {!isRecording && !audioUrl && <button onClick={startRecording} className="flex items-center gap-2 text-sm text-royal-blue font-bold"><i className="fas fa-microphone"></i> Gravar áudio</button>}
                             {isRecording && <button onClick={stopRecording} className="flex items-center gap-2 text-sm text-red-500 font-bold"><i className="fas fa-stop-circle animate-pulse"></i> A gravar...</button>}
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