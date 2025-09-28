"use client";

import { useState, useTransition } from 'react';
import { Essay, EssayPrompt, saveOrUpdateEssay } from '../actions';
import PromptSelector from './PromptSelector';

type Props = {
  essay: Partial<Essay> | null;
  prompts: EssayPrompt[];
  onBack: () => void;
};

export default function EssayEditor({ essay, prompts, onBack }: Props) {
  const [currentEssay, setCurrentEssay] = useState(essay || {});
  const [consent, setConsent] = useState(false); // Novo estado para o consentimento
  const [isPending, startTransition] = useTransition();
  const [selectedPrompt, setSelectedPrompt] = useState<EssayPrompt | null>(
    prompts.find(p => p.id === essay?.prompt_id) || null
  );

  const handleSave = (status: 'draft' | 'submitted') => {
    // Validação do consentimento ao enviar para correção
    if (status === 'submitted' && !consent) {
        alert('Você precisa autorizar o uso da redação para fins de melhoria da IA antes de enviar.');
        return;
    }

    startTransition(async () => {
      const updatedData = {
        ...currentEssay,
        status,
        prompt_id: selectedPrompt?.id,
        // Inclui o novo campo
        consent_to_ai_training: consent,
      };
      const result = await saveOrUpdateEssay(updatedData);
      if (!result.error) {
        alert(`Redação ${status === 'draft' ? 'salva' : 'enviada'} com sucesso!`);
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

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="mb-6 pb-6 border-b dark:border-gray-700">
                <h2 className="text-xl font-bold">{selectedPrompt?.title}</h2>
                <p className="text-sm text-gray-500">{selectedPrompt?.source}</p>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{selectedPrompt?.description}</p>
            </div>
            
            <input
                type="text"
                placeholder="Título da sua redação"
                value={currentEssay.title || ''}
                onChange={(e) => setCurrentEssay(prev => ({ ...prev, title: e.target.value }))}
                className="w-full text-2xl font-bold p-2 mb-4 bg-transparent focus:outline-none focus:ring-1 focus:ring-royal-blue rounded-md"
            />
            <textarea
                placeholder="Comece a escrever aqui..."
                value={currentEssay.content || ''}
                onChange={(e) => setCurrentEssay(prev => ({ ...prev, content: e.target.value }))}
                className="w-full h-96 p-4 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-royal-blue"
            />

            {/* Checkbox de Consentimento */}
            <div className="mt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-royal-blue focus:ring-royal-blue"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        Autorizo o uso anônimo desta redação para o treinamento e aprimoramento da inteligência artificial do Facillit Hub.
                    </span>
                </label>
            </div>

            <div className="mt-6 flex justify-end gap-4">
                <button onClick={() => handleSave('draft')} disabled={isPending} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 disabled:opacity-50">
                    {isPending ? 'Salvando...' : 'Salvar Rascunho'}
                </button>
                <button onClick={() => handleSave('submitted')} disabled={isPending} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 disabled:opacity-50">
                    {isPending ? 'Enviando...' : 'Enviar para Correção'}
                </button>
            </div>
        </div>

        <div className="fixed bottom-10 right-10 z-20">
            <button className="bg-royal-blue text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-2xl transition-transform hover:scale-110">
                <i className="fas fa-magic"></i>
            </button>
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-gray-700 p-3 rounded-lg shadow-md">
                <p className="text-sm text-dark-text dark:text-white">Precisa de ajuda para escrever?</p>
            </div>
        </div>
    </div>
  );
}