"use client";

import { useState, useEffect } from 'react';
import RichTextEditor from '@/components/DynamicRichTextEditor';

export type QuestionContent = {
  base_text?: string | null;
  statement: string;
  image_url?: string | null;
  options?: string[];
  correct_option?: number;
};

export type Question = {
  id: string;
  question_type: 'multiple_choice' | 'dissertation';
  content: QuestionContent;
  points: number;
  thematic_axis?: string | null; // Eixo temático
};

type Props = {
  question: Question;
  onUpdate: (updatedQuestion: Question) => void;
  onRemove: (questionId: string) => void;
  isSurvey: boolean; // Nova propriedade
};

export default function QuestionEditor({ question, onUpdate, onRemove, isSurvey }: Props) {
  const [localQuestion, setLocalQuestion] = useState<Question>(question);

  useEffect(() => {
    setLocalQuestion(question);
  }, [question]);

  // Função unificada para atualizar o estado local e notificar o componente pai
  const handleUpdate = (field: keyof Question | `content.${keyof QuestionContent}`, value: any) => {
    const updatedQuestion = { ...localQuestion };
    if (String(field).startsWith('content.')) {
        const contentField = String(field).split('.')[1] as keyof QuestionContent;
        updatedQuestion.content = { ...updatedQuestion.content, [contentField]: value };
    } else {
        (updatedQuestion as any)[field] = value;
    }
    setLocalQuestion(updatedQuestion);
    onUpdate(updatedQuestion);
  };
  
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(localQuestion.content.options || [])];
    newOptions[index] = value;
    handleUpdate('content.options', newOptions);
  };

  const addOption = () => {
    const newOptions = [...(localQuestion.content.options || []), ''];
    handleUpdate('content.options', newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = (localQuestion.content.options || []).filter((_, i) => i !== index);
    let newCorrectOption = localQuestion.content.correct_option;
    if (newCorrectOption === index) {
      newCorrectOption = undefined;
    } else if (newCorrectOption && newCorrectOption > index) {
      newCorrectOption = newCorrectOption - 1;
    }
    
    const updatedQuestion = { ...localQuestion, content: { ...localQuestion.content, options: newOptions, correct_option: newCorrectOption }};
    setLocalQuestion(updatedQuestion);
    onUpdate(updatedQuestion);
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-4 relative">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
                 <select
                    value={localQuestion.question_type}
                    onChange={(e) => handleUpdate('question_type', e.target.value)}
                    className="font-bold p-1 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                 >
                    <option value="multiple_choice">Múltipla Escolha</option>
                    <option value="dissertation">Dissertativa</option>
                </select>
                <input
                    type="text"
                    placeholder="Eixo Temático (Ex: Gramática)"
                    value={localQuestion.thematic_axis || ''}
                    onChange={(e) => handleUpdate('thematic_axis', e.target.value)}
                    className="p-1 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600"
                />
            </div>
            <button type="button" onClick={() => onRemove(question.id)} className="text-red-500 hover:text-red-700 text-sm">
              <i className="fas fa-trash-alt mr-1"></i> Remover
            </button>
        </div>
      
      <div className="space-y-1">
        <label className="text-sm font-medium">Texto Base (Opcional)</label>
        <RichTextEditor
            value={localQuestion.content.base_text || ''}
            onChange={(value) => handleUpdate('content.base_text', value)}
            placeholder="Digite o texto de apoio, gráfico, etc."
            height={150}
        />
      </div>

      <div className="space-y-1">
         <label className="text-sm font-medium">Enunciado da Questão</label>
         <RichTextEditor
            value={localQuestion.content.statement}
            onChange={(value) => handleUpdate('content.statement', value)}
            placeholder="Digite o enunciado aqui..."
        />
      </div>

      {localQuestion.question_type === 'multiple_choice' && (
        <div className="space-y-2">
          <h5 className="text-sm font-semibold">Alternativas {!isSurvey && '(Marque a correta)'}:</h5>
          {(localQuestion.content.options || []).map((option, index) => (
            <div key={index} className="flex items-center gap-2">
               {/* Esconde o radio button de resposta correta se for pesquisa */}
               {!isSurvey && (
                 <label className="flex items-center gap-2 font-mono cursor-pointer">
                  <input
                      type="radio"
                      name={`correct_option_${question.id}`}
                      checked={localQuestion.content.correct_option === index}
                      onChange={() => handleUpdate('content.correct_option', index)}
                      className="form-radio h-4 w-4 text-royal-blue focus:ring-royal-blue"
                  />
                   {String.fromCharCode(65 + index)})
                 </label>
               )}
              <input
                type="text"
                placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="flex-grow p-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-600"
              />
              <button type="button" onClick={() => removeOption(index)} className="text-gray-500 hover:text-red-500 text-xs">
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
          <button type="button" onClick={addOption} className="text-xs font-bold text-royal-blue">+ Adicionar alternativa</button>
        </div>
      )}
    </div>
  );
}