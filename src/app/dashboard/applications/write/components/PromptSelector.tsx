"use client";

import { useState, useMemo } from 'react';
import { EssayPrompt } from '../actions';

type Props = {
  prompts: EssayPrompt[];
  onSelect: (prompt: EssayPrompt) => void;
  onBack: () => void;
};

export default function PromptSelector({ prompts, onSelect, onBack }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = useMemo(() => {
    const allCategories = prompts.map(p => p.category).filter(Boolean) as string[];
    return ['Todos', ...Array.from(new Set(allCategories))];
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    return prompts.filter(prompt => {
      const matchesCategory = selectedCategory === 'Todos' || prompt.category === selectedCategory;
      const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (prompt.description && prompt.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [prompts, selectedCategory, searchTerm]);

  return (
    <div>
      <button onClick={onBack} className="mb-6 text-sm text-royal-blue font-bold">
        <i className="fas fa-arrow-left mr-2"></i> Voltar
      </button>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-dark-text dark:text-white-text mb-2">Escolha um Tema</h1>
        <p className="text-text-muted dark:text-dark-text-muted">Explore nossos temas e comece a praticar sua escrita.</p>
      </div>
      
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Pesquisar por título ou descrição..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 border rounded-lg bg-white dark:bg-dark-card dark:border-dark-border dark:text-white-text"
          />
        </div>
        <div className="flex-shrink-0">
          <select 
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full p-3 border rounded-lg bg-white dark:bg-dark-card dark:border-dark-border dark:text-white-text"
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Grid de Temas */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrompts.map(prompt => (
          <div key={prompt.id} className="p-6 bg-white dark:bg-dark-card rounded-lg shadow-md border dark:border-dark-border flex flex-col transition-transform hover:-translate-y-1">
            {prompt.image_url && (
              <img src={prompt.image_url} alt={prompt.title} className="w-full h-32 object-cover rounded-md mb-4" />
            )}
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold dark:text-white-text">{prompt.title}</h2>
              {prompt.category && <span className="text-xs font-semibold bg-royal-blue/10 text-royal-blue px-2 py-1 rounded-full">{prompt.category}</span>}
            </div>
            <p className="text-sm text-gray-500 mb-3">{prompt.source}</p>
            {prompt.motivational_text && (
                <p className="text-sm text-text-muted dark:text-dark-text-muted mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border-l-4 border-royal-blue">
                    {prompt.motivational_text}
                </p>
            )}
            <p className="text-gray-600 dark:text-dark-text-muted text-sm flex-grow mb-4">{prompt.description}</p>
            <button onClick={() => onSelect(prompt)} className="mt-auto bg-royal-blue text-white font-bold py-2 px-4 rounded-lg self-start hover:bg-opacity-90">
              Escrever sobre este tema
            </button>
          </div>
        ))}
        {filteredPrompts.length === 0 && (
            <p className="text-center text-text-muted dark:text-dark-text-muted md:col-span-2 lg:col-span-3 py-8">Nenhum tema encontrado com os filtros selecionados.</p>
        )}
      </div>
    </div>
  );
}