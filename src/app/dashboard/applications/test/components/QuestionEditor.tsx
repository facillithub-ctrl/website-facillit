"use client";

import { useState } from 'react';
import Image from 'next/image';
import RichTextEditor from './RichTextEditor'; // Importa o novo editor
import createClient from '@/utils/supabase/client'; // Importa o cliente Supabase

// Tipos de dados (permanecem os mesmos)
type QuestionContent = {
  statement: string; // Agora armazena HTML
  image_url?: string | null; // URL da imagem do enunciado
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
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  const handleContentChange = (field: keyof QuestionContent, value: any) => {
    onUpdate({
      ...question,
      content: { ...question.content, [field]: value },
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(question.content.options || [])];
    newOptions[index] = value;
    handleContentChange('options', newOptions);
  };

  const addOption = () => {
    const newOptions = [...(question.content.options || []), ''];
    handleContentChange('options', newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = (question.content.options || []).filter((_, i) => i !== index);
    if (question.content.correct_option === index) {
      handleContentChange('correct_option', undefined);
    } else if (question.content.correct_option && question.content.correct_option > index) {
        handleContentChange('correct_option', question.content.correct_option - 1);
    }
    handleContentChange('options', newOptions);
  };

  // Lógica de upload de imagem para o enunciado
  const handleImageUpload = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    const filePath = `question-images/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('tests') // Você pode precisar criar este bucket no seu Supabase
      .upload(filePath, file);

    if (uploadError) {
      alert(`Erro no upload: ${uploadError.message}`);
      setIsUploading(false);
      return null;
    }

    const { data } = supabase.storage.from('tests').getPublicUrl(filePath);
    const newImageUrl = data.publicUrl;

    // Atualiza o estado da questão com a URL da imagem
    handleContentChange('image_url', newImageUrl);

    setIsUploading(false);
    return newImageUrl;
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/50 space-y-3">
      <div className="flex justify-between items-center">
        <select
          value={question.question_type}
          onChange={(e) => onUpdate({ ...question, question_type: e.target.value as Question['question_type'] })}
          className="font-bold p-1 border rounded-md dark:bg-gray-800 dark:border-gray-600"
        >
          <option value="multiple_choice">Múltipla Escolha</option>
          <option value="dissertation">Dissertativa</option>
        </select>
        <button onClick={() => onRemove(question.id)} className="text-red-500 hover:text-red-700 text-sm">
          <i className="fas fa-trash-alt mr-1"></i> Remover
        </button>
      </div>

      {/* NOVO: Input para imagem do enunciado */}
      <div>
        <label className="block text-sm font-medium mb-1">Imagem do Enunciado (Opcional)</label>
        <input 
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
          disabled={isUploading}
          className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-royal-blue hover:file:bg-blue-100"
        />
        {isUploading && <p className="text-xs text-blue-500 mt-1">Enviando...</p>}
        {question.content.image_url && (
          <div className="mt-2">
            <Image src={question.content.image_url} alt="Preview da imagem da questão" width={200} height={100} className="rounded-md object-cover" />
          </div>
        )}
      </div>

      {/* Substitui o textarea pelo RichTextEditor */}
      <RichTextEditor
        value={question.content.statement}
        onChange={(value) => handleContentChange('statement', value)}
        placeholder="Digite o enunciado da questão aqui..."
      />

      {question.question_type === 'multiple_choice' && (
        <div className="space-y-2">
          <h5 className="text-sm font-semibold">Alternativas:</h5>
          {(question.content.options || []).map((option, index) => (
            <div key={index} className="flex items-center gap-2">
               <label className="flex items-center gap-2 font-mono">
                <input
                    type="radio"
                    name={`correct_option_${question.id}`}
                    checked={question.content.correct_option === index}
                    onChange={() => handleContentChange('correct_option', index)}
                    className="form-radio text-royal-blue"
                />
                 {String.fromCharCode(65 + index)}) {/* Converte 0, 1, 2... para A, B, C... */}
               </label>
              <input
                type="text"
                placeholder={`Texto da alternativa ${String.fromCharCode(65 + index)}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="flex-grow p-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-600"
              />
              <button onClick={() => removeOption(index)} className="text-gray-500 hover:text-red-500 text-xs">
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
          <button onClick={addOption} className="text-xs font-bold text-royal-blue">+ Adicionar alternativa</button>
        </div>
      )}
    </div>
  );
}