"use client";

import { EssayPrompt } from '../actions';

type Props = {
  prompts: EssayPrompt[];
  onSelect: (prompt: EssayPrompt) => void;
  onBack: () => void;
};

export default function PromptSelector({ prompts, onSelect, onBack }: Props) {
  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm text-royal-blue font-bold">
        <i className="fas fa-arrow-left mr-2"></i> Voltar
      </button>
      <h1 className="text-3xl font-bold text-dark-text dark:text-white mb-6">Escolha um Tema</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prompts.map(prompt => (
          <div key={prompt.id} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col">
            <h2 className="text-lg font-bold">{prompt.title}</h2>
            <p className="text-sm text-gray-500 mb-2">{prompt.source}</p>
            <p className="text-gray-600 dark:text-gray-300 text-sm flex-grow">{prompt.description}</p>
            <button onClick={() => onSelect(prompt)} className="mt-4 bg-royal-blue/10 text-royal-blue font-bold py-2 px-4 rounded-lg self-start hover:bg-royal-blue/20">
              Escrever sobre este tema
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}