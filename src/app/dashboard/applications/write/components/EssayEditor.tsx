"use client";

import { useState, useTransition, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Essay, EssayPrompt, saveOrUpdateEssay, checkForPlagiarism } from '../actions';
import PromptSelector from './PromptSelector';
import createClient from '@/utils/supabase/client';
import Image from 'next/image';
import VersionHistory from './VersionHistory';
import Timer from './Timer';
import PlagiarismResultModal from './PlagiarismResultModal';

type Props = {
  essay: Partial<Essay> | null;
  prompts: EssayPrompt[];
  onBack: () => void;
};

export default function EssayEditor({ essay, prompts, onBack }: Props) {
  const [currentEssay, setCurrentEssay] = useState(essay || {});
  const [consent, setConsent] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const [selectedPrompt, setSelectedPrompt] = useState<EssayPrompt | null>(
    prompts.find(p => p.id === essay?.prompt_id) || null
  );
  const [showHistory, setShowHistory] = useState(false);
  const [isSimulado, setIsSimulado] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState<Awaited<ReturnType<typeof checkForPlagiarism>>['data'] | null>(null);

  useEffect(() => {
    if (isSimulado) {
      autoSaveTimerRef.current = setInterval(() => {
        setCurrentEssay(prevEssay => {
          if(prevEssay.content && prevEssay.id) {
            console.log("Salvando rascunho automaticamente...");
            startTransition(async () => {
              await saveOrUpdateEssay({ ...prevEssay, status: 'draft' });
            });
          }
          return prevEssay;
        });
      }, 60000);
    } else {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    }
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [isSimulado, startTransition]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert("Erro: Utilizador não autenticado.");
        setUploading(false);
        return;
    }

    const filePath = `submissions/${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('essays').upload(filePath, file);

    if (uploadError) {
      alert(`Erro no upload: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('essays').getPublicUrl(filePath);
    setCurrentEssay(prev => ({ ...prev, image_submission_url: data.publicUrl, content: '' }));
    setUploading(false);
  };

  const handleSave = (status: 'draft' | 'submitted') => {
    if (status === 'submitted') {
        if (!currentEssay.content && !currentEssay.image_submission_url) {
            alert('Você precisa de escrever um texto ou enviar uma imagem da sua redação para submeter.');
            return;
        }
        if (!consent) {
            alert('Você precisa de concordar com os termos antes de enviar.');
            return;
        }
    }

    startTransition(async () => {
      const updatedData = {
        ...currentEssay,
        status,
        prompt_id: selectedPrompt?.id,
        consent_to_ai_training: consent,
      };
      const result = await saveOrUpdateEssay(updatedData);
      
      if (!result.error) {
        if(status === 'submitted') setIsSimulado(false);
        alert(status === 'draft' ? 'Rascunho salvo com sucesso!' : 'Redação enviada com sucesso!');
        if(status === 'submitted') onBack();
      } else {
        alert(`Erro: ${result.error}`);
      }
    });
  };

  const handleRestoreVersion = (content: string) => {
      if(confirm("Você tem certeza que quer restaurar esta versão? O conteúdo atual no editor será substituído.")) {
          setCurrentEssay(prev => ({ ...prev, content }));
          setShowHistory(false);
      }
  };

  const handlePlagiarismCheck = async () => {
    if (!currentEssay.content || currentEssay.content.trim().length < 100) {
      alert("Escreva pelo menos 100 caracteres para verificar o plágio.");
      return;
    }
    setIsCheckingPlagiarism(true);
    const result = await checkForPlagiarism(currentEssay.content);
    if (result.data) {
      setPlagiarismResult(result.data);
    } else {
      alert(result.error);
    }
    setIsCheckingPlagiarism(false);
  };
  
  const handleExport = () => {
      const blob = new Blob([currentEssay.content || ''], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${currentEssay.title || 'redacao'}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  if (!selectedPrompt && !essay) {
    return <PromptSelector prompts={prompts} onSelect={setSelectedPrompt} onBack={onBack} />;
  }

  return (
    <div className="relative">
        <PlagiarismResultModal result={plagiarismResult} onClose={() => setPlagiarismResult(null)} />
        <div className="flex justify-between items-center mb-4">
            <button onClick={onBack} className="text-sm text-royal-blue font-bold">
                <i className="fas fa-arrow-left mr-2"></i> Voltar para minhas redações
            </button>
            {isSimulado && <Timer isRunning={isSimulado} durationInSeconds={5400} onTimeUp={() => alert("O tempo acabou!")} />}
        </div>

        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md border dark:border-dark-border">
            <div className="mb-6 pb-6 border-b dark:border-dark-border">
                <h2 className="text-xl font-bold dark:text-white-text">{selectedPrompt?.title}</h2>
                <p className="text-sm text-gray-500 dark:text-dark-text-muted">{selectedPrompt?.source}</p>
            </div>
            
            <input
                type="text"
                placeholder="Título da sua redação"
                value={currentEssay.title || ''}
                onChange={(e) => setCurrentEssay(prev => ({ ...prev, title: e.target.value }))}
                className="w-full text-2xl font-bold p-2 mb-4 bg-transparent focus:outline-none focus:ring-1 focus:ring-royal-blue rounded-md dark:text-white-text"
            />

            {currentEssay.image_submission_url ? (
              <div className="text-center p-4 border-2 border-dashed rounded-lg">
                <Image src={currentEssay.image_submission_url} alt="Redação enviada" width={500} height={700} className="max-w-full max-h-96 mx-auto rounded-lg" />
                <button onClick={() => setCurrentEssay(prev => ({...prev, image_submission_url: null}))} className="mt-4 text-sm text-red-500 font-bold">
                  Remover imagem e escrever
                </button>
              </div>
            ) : (
              <>
                <textarea
                    placeholder="Comece a escrever aqui..."
                    value={currentEssay.content || ''}
                    onChange={(e) => setCurrentEssay(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full h-96 p-4 border rounded-md dark:bg-dark-card dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-royal-blue dark:text-white-text"
                />
                <div className="text-center my-4">
                  <span className="text-sm text-text-muted dark:text-dark-text-muted">OU</span>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full py-3 border-2 border-dashed rounded-lg text-text-muted hover:border-royal-blue hover:text-royal-blue transition">
                  {uploading ? 'A enviar...' : 'Clique para enviar uma foto da sua redação'}
                </button>
              </>
            )}
            
            {currentEssay.id && !currentEssay.image_submission_url && (
                <div>
                    <div className="flex flex-wrap items-center gap-4 mt-4">
                        <button onClick={() => setShowHistory(!showHistory)} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-royal-blue disabled:opacity-50" disabled={!currentEssay.id}>
                            <i className="fas fa-history mr-2"></i>{showHistory ? 'Ocultar Histórico' : 'Ver Histórico'}
                        </button>
                        <button onClick={handlePlagiarismCheck} disabled={isCheckingPlagiarism} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-royal-blue disabled:opacity-50">
                            <i className={`fas ${isCheckingPlagiarism ? 'fa-spinner fa-spin' : 'fa-search'} mr-2`}></i>Verificar Plágio
                        </button>
                        <button onClick={handleExport} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-royal-blue">
                            <i className="fas fa-file-export mr-2"></i>Exportar
                        </button>
                    </div>
                    {showHistory && <VersionHistory essayId={currentEssay.id as string} onSelectVersion={handleRestoreVersion} />}
                </div>
            )}

            <div className="mt-6 border-t dark:border-dark-border pt-6">
                 {!isSimulado && (
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
                        <p className="text-sm font-medium mb-2">Deseja praticar em condições de prova?</p>
                        <button onClick={() => setIsSimulado(true)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
                            <i className="fas fa-stopwatch mr-2"></i> Iniciar Modo Simulado (90 min)
                        </button>
                    </div>
                 )}
                 <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-royal-blue focus:ring-royal-blue" />
                    <span className="text-sm text-gray-600 dark:text-dark-text-muted">
                        Eu li e concordo com a <Link href="/recursos/direito-autoral" target="_blank" className="underline font-bold">Política de Direitos Autorais</Link> e consinto com o uso da minha redação para o treinamento da inteligência artificial.
                    </span>
                </label>
            </div>

            <div className="mt-6 flex justify-end gap-4">
                <button onClick={() => handleSave('draft')} disabled={isPending} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 disabled:opacity-50">
                    {isPending ? 'Salvando...' : 'Salvar Rascunho'}
                </button>
                <button onClick={() => handleSave('submitted')} disabled={isPending || !consent} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 disabled:opacity-50">
                    {isPending ? 'Enviando...' : 'Enviar para Correção'}
                </button>
            </div>
        </div>
    </div>
  );
}