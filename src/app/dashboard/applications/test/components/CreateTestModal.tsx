"use client";

import { useState, useTransition } from 'react';
import type { Test } from '../actions';
import QuestionEditor, { type Question } from './QuestionEditor'; // Importa o novo componente

type Props = {
  onClose: () => void;
};

export default function CreateTestModal({ onClose }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isPending, startTransition] = useTransition();

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      question_type: 'multiple_choice',
      content: { statement: '', options: [''], correct_option: undefined },
      points: 1,
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const updateQuestion = (updatedQuestion: Question) => {
    setQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const testData = { title, description, questions };
      console.log("Salvando avaliação com questões:", testData);
      alert("Funcionalidade de salvar em desenvolvimento.");
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold">Criar Nova Avaliação</h3>
          <button onClick={onClose} className="text-gray-500 text-2xl">&times;</button>
        </div>

        <form id="create-test-form" onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">Título da Avaliação</label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Simulado ENEM - Ciências Humanas"
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Descrição / Instruções</label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Instruções para os alunos, temas abordados, etc."
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div className="p-4 border-t dark:border-gray-600 space-y-4">
             <h4 className="font-bold text-md">Questões da Avaliação</h4>
             {questions.map((q, index) => (
                <div key={q.id}>
                    <p className="font-semibold mb-2 text-sm">Questão {index + 1}</p>
                    <QuestionEditor 
                        question={q}
                        onUpdate={updateQuestion}
                        onRemove={removeQuestion}
                    />
                </div>
             ))}
             <button type="button" onClick={addQuestion} className="w-full py-2 border-2 border-dashed rounded-lg text-text-muted hover:border-royal-blue hover:text-royal-blue transition">
                <i className="fas fa-plus mr-2"></i> Adicionar Questão
             </button>
          </div>

        </form>

        <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-2 mt-auto">
          <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">
            Cancelar
          </button>
          <button type="submit" form="create-test-form" disabled={isPending} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 disabled:bg-gray-400">
            {isPending ? 'Salvando...' : 'Salvar Avaliação'}
          </button>
        </div>
      </div>
    </div>
  );
}