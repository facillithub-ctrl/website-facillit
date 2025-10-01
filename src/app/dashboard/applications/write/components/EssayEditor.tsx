"use client";

import { useState, useTransition, useRef } from 'react';
import Link from 'next/link';
import { Essay, EssayPrompt, saveOrUpdateEssay } from '../actions';
import PromptSelector from './PromptSelector';
import createClient from '@/utils/supabase/client';

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
    if (status === 'submitted' && !currentEssay.content && !currentEssay.image_submission_url) {
      alert('Você precisa de escrever um texto ou enviar uma imagem da sua redação para submeter.');
      return;
    }
    if (status === 'submitted' && !consent) {
      alert('Você precisa de concordar com os termos antes de enviar.');
      return;
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
        alert(status === 'draft' ? 'Rascunho salvo com sucesso!' : 'Redação enviada com sucesso!');
        onBack();
      } else {
        alert(`Erro: ${result.error}`);
      }
    });
  };

  if (!selectedPrompt && !essay) {
    return <PromptSelector prompts={prompts} onSelect={setSelectedPrompt} onBack={onBack} />;
  }

  return (
    <div className="relative">
        <button onClick={onBack} className="mb-4 text-sm text-royal-blue font-bold">
            <i className="fas fa-arrow-left mr-2"></i> Voltar para minhas redações
        </button>

        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md border dark:border-dark-border">
            <div className="mb-6 pb-6 border-b dark:border-dark-border">
                <h2 className="text-xl font-bold dark:text-white-text">{selectedPrompt?.title}</h2>
                <p className="text-sm text-gray-500 dark:text-dark-text-muted">{selectedPrompt?.source}</p>
                <div className="mt-4 space-y-4">
                  {selectedPrompt?.motivational_text && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-text-muted dark:text-dark-text-muted italic">{selectedPrompt.motivational_text}</p>
                    </div>
                  )}
                   <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-dark-text-muted whitespace-pre-wrap">{selectedPrompt?.description}</p>
                   </div>
                </div>
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
                <img src={currentEssay.image_submission_url} alt="Redação enviada" className="max-w-full max-h-96 mx-auto rounded-lg" />
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

            <div className="mt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-royal-blue focus:ring-royal-blue" />
                    <span className="text-sm text-gray-600 dark:text-dark-text-muted">
                        Li e concordo com os <Link href="/recursos/uso" target="_blank" className="underline font-bold">Termos de Uso</Link>. Autorizo o uso anônimo desta redação para o treinamento da inteligência artificial.
                    </span>
                </label>
            </div>

            <div className="mt-6 flex justify-end gap-4">
                <button onClick={() => handleSave('draft')} disabled={isPending} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 disabled:opacity-50">
                    {isPending ? 'A salvar...' : 'Salvar Rascunho'}
                </button>
                <button onClick={() => handleSave('submitted')} disabled={isPending} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 disabled:opacity-50">
                    {isPending ? 'A enviar...' : 'Enviar para Correção'}
                </button>
            </div>
        </div>
    </div>
  );
}