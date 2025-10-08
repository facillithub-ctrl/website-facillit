// src/app/dashboard/applications/test/components/QuestionEditor.tsx
"use client";

import { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';
import createClient from '@/utils/supabase/client';

export type QuestionContent = {
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
};

type Props = {
  question: Question;
  onUpdate: (updatedQuestion: Question) => void;
  onRemove: (questionId: string) => void;
};

export default function QuestionEditor({ question, onUpdate, onRemove }: Props) {
  const [localQuestion, setLocalQuestion] = useState<Question>(question);
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setLocalQuestion(question);
  }, [question]);

  const hasUnsavedChanges = JSON.stringify(localQuestion) !== JSON.stringify(question);

  const handleContentChange = (field: keyof QuestionContent, value: any) => {
    setLocalQuestion(prev => ({
      ...prev,
      content: { ...prev.content, [field]: value },
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(localQuestion.content.options || [])];
    newOptions[index] = value;
    handleContentChange('options', newOptions);
  };
  
  const handleSaveChanges = () => {
    onUpdate(localQuestion);
  };

  const handleDiscardChanges = () => {
    setLocalQuestion(question);
  };

  const addOption = () => {
    const newOptions = [...(localQuestion.content.options || []), ''];
    handleContentChange('options', newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = (localQuestion.content.options || []).filter((_, i) => i !== index);
    let newCorrectOption = localQuestion.content.correct_option;
    if (newCorrectOption === index) {
      newCorrectOption = undefined;
    } else if (newCorrectOption && newCorrectOption > index) {
      newCorrectOption = newCorrectOption - 1;
    }
    setLocalQuestion(prev => ({
        ...prev,
        content: {
            ...prev.content,
            options: newOptions,
            correct_option: newCorrectOption,
        }
    }));
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    const filePath = `question-images/${crypto.randomUUID()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from('tests').upload(filePath, file);

    if (uploadError) {
      alert(`Erro no upload: ${uploadError.message}`);
      setIsUploading(false);
      return null;
    }

    const { data } = supabase.storage.from('tests').getPublicUrl(filePath);
    const newImageUrl = data.publicUrl;

    handleContentChange('image_url', newImageUrl);

    setIsUploading(false);
    return newImageUrl;
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-3 relative">
      <div className="flex justify-between items-start">
        <select
          value={localQuestion.question_type}
          onChange={(e) => setLocalQuestion(prev => ({ ...prev, question_type: e.target.value as Question['question_type'] }))}
          className="font-bold p-1 border rounded-md dark:bg-gray-800 dark:border-gray-600"
        >
          <option value="multiple_choice">Múltipla Escolha</option>
          <option value="dissertation">Dissertativa</option>
        </select>
        <button type="button" onClick={() => onRemove(question.id)} className="text-red-500 hover:text-red-700 text-sm">
          <i className="fas fa-trash-alt mr-1"></i> Remover Questão
        </button>
      </div>
      
      {isUploading && <p className="text-xs text-blue-500">Enviando imagem...</p>}
      
      <RichTextEditor
        value={localQuestion.content.statement}
        onChange={(value) => handleContentChange('statement', value)}
        placeholder="Digite o enunciado da questão aqui..."
        onImageUpload={handleImageUpload}
      />

      {localQuestion.question_type === 'multiple_choice' && (
        <div className="space-y-2">
          <h5 className="text-sm font-semibold">Alternativas:</h5>
          {(localQuestion.content.options || []).map((option, index) => (
            <div key={index} className="flex items-center gap-2">
               <label className="flex items-center gap-2 font-mono">
                <input
                    type="radio"
                    name={`correct_option_${question.id}`}
                    checked={localQuestion.content.correct_option === index}
                    onChange={() => handleContentChange('correct_option', index)}
                    className="form-radio text-royal-blue"
                />
                 {String.fromCharCode(65 + index)})
               </label>
              <input
                type="text"
                placeholder={`Texto da alternativa ${String.fromCharCode(65 + index)}`}
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

      {hasUnsavedChanges && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800 flex justify-end items-center gap-3 rounded-b-lg -m-4 mt-4">
            <span className="text-xs font-semibold text-yellow-800 dark:text-yellow-300">Você tem alterações não salvas.</span>
            <button type="button" onClick={handleDiscardChanges} className="text-xs font-bold text-gray-600 dark:text-gray-300">
                Cancelar
            </button>
            <button 
                type="button"
                onClick={handleSaveChanges} 
                className="bg-royal-blue text-white font-bold py-1 px-3 rounded-md text-xs"
            >
                Salvar Alterações
            </button>
        </div>
      )}
    </div>
  );
}