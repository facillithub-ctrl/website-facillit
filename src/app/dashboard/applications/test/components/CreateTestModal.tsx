// src/app/dashboard/applications/test/components/CreateTestModal.tsx
"use client";

import { useState, useTransition } from 'react';
import QuestionEditor, { type Question } from './QuestionEditor';
import { createOrUpdateTest } from '../actions';
import { useToast } from '@/contexts/ToastContext';

type Props = {
  onClose: () => void;
};

export default function CreateTestModal({ onClose }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

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
    if (!title) {
      addToast({ message: "O título da avaliação é obrigatório.", type: 'error' });
      return;
    }

    startTransition(async () => {
      const result = await createOrUpdateTest({
        title,
        description,
        questions,
        is_public: isPublic
      });

      if (result.error) {
        addToast({ message: `Erro ao salvar: ${result.error}`, type: 'error' });
      } else {
        addToast({ message: "Avaliação criada com sucesso!", type: 'success' });
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <h3 className="text-lg font-bold">Criar Nova Avaliação</h3>
          <button type="button" onClick={onClose} className="text-gray-500 text-2xl">&times;</button>
        </div>

        <form id="create-test-form" onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">Título da Avaliação</label>
            <input
              id="title" type="text" required value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Simulado ENEM - Ciências Humanas"
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Descrição / Instruções</label>
            <textarea
              id="description" rows={3} value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Instruções para os alunos, temas abordados, etc."
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border dark:border-gray-700">
            <input
              id="is_public" type="checkbox" checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-royal-blue focus:ring-royal-blue"
            />
            <div>
              <label htmlFor="is_public" className="font-medium text-sm text-dark-text dark:text-white">
                Simulado Público
              </label>
              <p className="text-xs text-text-muted dark:text-gray-400">
                Se marcado, este simulado será visível para todos os alunos na plataforma.
              </p>
            </div>
          </div>
          
          <div className="pt-4 border-t dark:border-gray-600 space-y-4">
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

        <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-2 mt-auto flex-shrink-0">
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