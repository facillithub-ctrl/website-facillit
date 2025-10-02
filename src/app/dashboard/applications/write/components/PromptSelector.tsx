"use client";

import { useState, useMemo } from 'react';
import { EssayPrompt } from '../actions';
import Image from 'next/image';

type Props = {
  prompts: EssayPrompt[];
  onSelect: (prompt: EssayPrompt) => void;
  onBack: () => void;
};

// NOVO: Componente para exibir a dificuldade
const DifficultyStars = ({ level }: { level: number }) => (
    <div className="flex items-center gap-1" title={`Dificuldade: ${level} de 5`}>
        {[...Array(5)].map((_, i) => (
            <i
                key={i}
                className={`fas fa-star text-xs ${i < level ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
            />
        ))}
    </div>
);


const PromptCard = ({ prompt, onSelect }: { prompt: EssayPrompt, onSelect: (p: EssayPrompt) => void }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const publicationDate = prompt.publication_date 
        ? new Date(prompt.publication_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) 
        : null;

    const deadlineDate = prompt.deadline 
        ? new Date(prompt.deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : null;

    return (
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md border dark:border-dark-border flex flex-col transition-all hover:shadow-xl hover:-translate-y-1">
            {prompt.image_url && (
                <div className="relative h-40 w-full">
                    <Image src={prompt.image_url} alt={prompt.title} layout="fill" objectFit="cover" className="rounded-t-lg" />
                    {prompt.cover_image_source && (
                        <span className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                            Fonte: {prompt.cover_image_source}
                        </span>
                    )}
                </div>
            )}
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    {prompt.category && (
                        <span className="text-xs font-semibold bg-royal-blue/10 text-royal-blue px-2 py-1 rounded-full self-start">{prompt.category}</span>
                    )}
                    {prompt.difficulty && <DifficultyStars level={prompt.difficulty} />}
                </div>

                <h2 className="text-lg font-bold dark:text-white-text mb-1">{prompt.title}</h2>
                <p className="text-sm text-gray-500 mb-3">{prompt.source}</p>
                
                <p className={`text-gray-600 dark:text-dark-text-muted text-sm flex-grow mb-4 transition-all duration-300 ${isExpanded ? 'line-clamp-none' : 'line-clamp-3'}`}>
                    {prompt.description}
                </p>

                {prompt.description && prompt.description.length > 150 && (
                     <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs text-royal-blue font-bold self-start mb-4">
                        {isExpanded ? 'Ler menos' : 'Ler mais...'}
                    </button>
                )}

                {/* Exibição das Tags */}
                {prompt.tags && prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {prompt.tags.map(tag => (
                            <span key={tag} className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">{tag}</span>
                        ))}
                    </div>
                )}

                <div className="text-xs text-gray-500 mt-auto space-y-1">
                    {publicationDate && <p><i className="fas fa-calendar-alt mr-2"></i>Publicado em: {publicationDate}</p>}
                    {deadlineDate && <p><i className="fas fa-hourglass-end mr-2"></i>Prazo: {deadlineDate}</p>}
                </div>

                <button onClick={() => onSelect(prompt)} className="mt-4 bg-royal-blue text-white font-bold py-2 px-4 rounded-lg self-start hover:bg-opacity-90">
                    Escrever sobre este tema
                </button>
            </div>
        </div>
    );
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
                            (prompt.description && prompt.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (prompt.tags && prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
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
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Pesquisar por título, descrição ou tag..."
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrompts.map(prompt => (
          <PromptCard key={prompt.id} prompt={prompt} onSelect={onSelect} />
        ))}
        {filteredPrompts.length === 0 && (
            <p className="text-center text-text-muted dark:text-dark-text-muted md:col-span-2 lg:col-span-3 py-8">Nenhum tema encontrado com os filtros selecionados.</p>
        )}
      </div>
    </div>
  );
}