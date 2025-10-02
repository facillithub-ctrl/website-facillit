"use client";

import { useEffect, useState, ReactElement } from 'react';
import { Essay, EssayCorrection, Annotation, getEssayDetails, getCorrectionForEssay } from '../actions';
import Image from 'next/image';
import { VerificationBadge } from '@/components/VerificationBadge'; // Alterado

// O resto do código permanece o mesmo, pois a alteração foi apenas na linha de importação e no tipo.

// --- TIPOS E SUB-COMPONENTES ---

type FullEssayDetails = Essay & {
  correction: (EssayCorrection & { profiles: { full_name: string | null, verification_badge: string | null } }) | null;
  profiles: { full_name: string | null } | null;
};

// ... (restante do código idêntico ao da resposta anterior)
const competencyDetails = [
  { title: "Competência 1: Domínio da Escrita Formal", description: "Avalia o domínio da modalidade escrita formal da língua portuguesa e da norma-padrão." },
  { title: "Competência 2: Compreensão do Tema e Estrutura", description: "Avalia a compreensão da proposta de redação e a aplicação de conceitos de várias áreas do conhecimento para desenvolver o tema, dentro da estrutura do texto dissertativo-argumentativo." },
  { title: "Competência 3: Argumentação", description: "Avalia a capacidade de selecionar, relacionar, organizar e interpretar informações, fatos e opiniões em defesa de um ponto de vista." },
  { title: "Competência 4: Coesão e Coerência", description: "Avalia o uso de mecanismos linguísticos (conjunções, preposições, etc.) para construir uma argumentação coesa e coerente." },
  { title: "Competência 5: Proposta de Intervenção", description: "Avalia a elaboração de uma proposta de intervenção para o problema abordado, que respeite os direitos humanos." },
];

const markerStyles = {
    erro: { flag: 'text-red-500', highlight: 'bg-red-200 dark:bg-red-500/30 border-b-2 border-red-400' },
    acerto: { flag: 'text-green-500', highlight: 'bg-green-200 dark:bg-green-500/30' },
    sugestao: { flag: 'text-blue-500', highlight: 'bg-blue-200 dark:bg-blue-500/30' },
};

// FUNÇÃO DE RENDERIZAÇÃO CORRIGIDA E ROBUSTA
const renderAnnotatedText = (text: string, annotations?: Annotation[] | null): React.ReactNode => {
    const textAnnotations = annotations?.filter(a => a.type === 'text' && a.selection) || [];
    if (!text || textAnnotations.length === 0) {
        return text.split('\n\n').map((p, i) => <p key={i} className="mb-4">{p}</p>);
    }

    const selectionOccurrenceMap = new Map<string, number>();
    const positionedAnnotations = textAnnotations.map(anno => {
        const selection = anno.selection!;
        const occurrence = selectionOccurrenceMap.get(selection) || 0;
        selectionOccurrenceMap.set(selection, occurrence + 1);

        let index = -1;
        for (let i = 0; i <= occurrence; i++) {
            index = text.indexOf(selection, index + 1);
        }
        return { ...anno, startIndex: index };
    })
    .filter(anno => anno.startIndex !== -1)
    .sort((a, b) => a.startIndex - b.startIndex);

    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;

    positionedAnnotations.forEach(anno => {
        if (anno.startIndex > lastIndex) {
            nodes.push(text.substring(lastIndex, anno.startIndex));
        }
        nodes.push(
            <mark key={anno.id} className={`${markerStyles[anno.marker].highlight} relative group cursor-pointer px-1 rounded-sm`}>
                {anno.selection}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">{anno.comment}</span>
            </mark>
        );
        lastIndex = anno.startIndex + anno.selection!.length;
    });

    if (lastIndex < text.length) {
        nodes.push(text.substring(lastIndex));
    }

    return nodes.reduce((acc: React.ReactNode[], node) => {
        if (typeof node === 'string') {
            const paragraphs = node.split('\n\n').map((paragraphText, index, arr) => (
                <span key={index}>
                    {paragraphText}
                    {index < arr.length - 1 && <br />}
                </span>
            ));
            return [...acc, ...paragraphs];
        }
        return [...acc, node];
    }, []).map((node, i, allNodes) => {
        const elementsInParagraph: React.ReactNode[] = [];
        let currentNode = node as ReactElement;
        let currentIndex = i;
        while(currentNode && (currentNode as React.ReactElement)?.type !== 'br') {
            elementsInParagraph.push(currentNode);
            currentIndex++;
            currentNode = allNodes[currentIndex] as ReactElement;
        }
        if (elementsInParagraph.length > 0) {
            return <p key={i} className="mb-4">{elementsInParagraph}</p>
        }
        return null;
    });
};

const CompetencyModal = ({ competencyIndex, onClose }: { competencyIndex: number | null, onClose: () => void }) => {
    if (competencyIndex === null) return null;
    const { title, description } = competencyDetails[competencyIndex];

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-2 dark:text-white-text">{title}</h3>
                <p className="text-sm text-text-muted dark:text-dark-text-muted">{description}</p>
                <button onClick={onClose} className="mt-4 bg-royal-blue text-white py-2 px-4 rounded-lg text-sm font-bold">Entendi</button>
            </div>
        </div>
    );
};

export default function EssayCorrectionView({ essayId, onBack }: {essayId: string, onBack: () => void}) {
    const [details, setDetails] = useState<FullEssayDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [modalCompetency, setModalCompetency] = useState<number | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            const essayResult = await getEssayDetails(essayId);
            if (essayResult.data) {
                const correctionResult = await getCorrectionForEssay(essayId);
                setDetails({
                    ...(essayResult.data as FullEssayDetails),
                    correction: correctionResult.data || null,
                });
            }
            setIsLoading(false);
        };
        fetchDetails();
    }, [essayId]);

    if (isLoading) return <div className="text-center p-8">A carregar a sua redação...</div>;
    if (!details) return <div className="text-center p-8">Não foi possível carregar os detalhes da redação.</div>;

    const { title, content, correction, image_submission_url } = details;
    const annotations = correction?.annotations;

    return (
        <div>
            <CompetencyModal competencyIndex={modalCompetency} onClose={() => setModalCompetency(null)} />
            <button onClick={onBack} className="mb-4 text-sm text-royal-blue font-bold">
                <i className="fas fa-arrow-left mr-2"></i> Voltar
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md border dark:border-dark-border">
                    <h2 className="font-bold text-xl mb-4 dark:text-white-text">{title}</h2>
                    
                    {image_submission_url ? (
                        <div className="relative w-full h-auto">
                            <Image src={image_submission_url} alt="Redação enviada" width={800} height={1100} className="rounded-lg object-contain"/>
                            {annotations?.filter(a => a.type === 'image').map(a => (
                                <div key={a.id} className="absolute transform -translate-x-1 -translate-y-4 group text-xl" style={{ left: `${a.position?.x}%`, top: `${a.position?.y}%` }}>
                                    <i className={`fas fa-flag ${markerStyles[a.marker].flag}`}></i>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        {a.comment}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-gray-700 dark:text-dark-text-muted whitespace-pre-wrap leading-relaxed">
                            {renderAnnotatedText(content, annotations)}
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md border dark:border-dark-border">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-xl dark:text-white-text">Correção</h2>
                        {correction && <div className="text-2xl font-bold dark:text-white-text">{correction.final_grade}</div>}
                    </div>

                    {correction ? (
                        <div className="space-y-4">
                            {competencyDetails.map((_, i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-md bg-gray-50 dark:bg-gray-700/50">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm dark:text-white-text">Competência {i + 1}</span>
                                        <button onClick={() => setModalCompetency(i)} className="text-xs text-royal-blue">
                                            <i className="fas fa-info-circle"></i>
                                        </button>
                                    </div>
                                    <span className="font-bold text-sm dark:text-white-text">
                                        {correction[`grade_c${i + 1}` as keyof EssayCorrection] as React.ReactNode}
                                    </span>
                                </div>
                            ))}
                            <div>
                                <h3 className="font-bold mt-6 mb-2 dark:text-white-text">Feedback do Corretor</h3>
                                {correction.audio_feedback_url && (
                                    <div className="mb-4">
                                        <audio controls className="w-full">
                                            <source src={correction.audio_feedback_url} type="audio/webm" />
                                            O seu navegador não suporta o elemento de áudio.
                                        </audio>
                                    </div>
                                )}
                                <div className="text-sm text-gray-700 dark:text-dark-text-muted bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md whitespace-pre-wrap">{correction.feedback}</div>
                                <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                                    <span>Corrigido por: {correction.profiles?.full_name}</span>
                                    <VerificationBadge badge={correction.profiles?.verification_badge} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">A sua redação ainda está na fila para ser corrigida.</p>
                    )}
                </div>
            </div>
        </div>
    );
}