"use client";

import { useState, useTransition, useEffect, useRef } from 'react';
import QuestionEditor, { type Question } from './QuestionEditor';
import { createOrUpdateTest } from '../actions';
import { useToast } from '@/contexts/ToastContext';
import createClient from '@/utils/supabase/client';
import Image from 'next/image';


type EssayPrompt = {
  id: string;
  title: string;
};

type Props = {
  onClose: () => void;
  classes: { id: string; name: string }[];
  isInstitutional: boolean; // Indica se o professor pertence a uma instituição
};

export default function CreateTestModal({ onClose, classes, isInstitutional }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [testType, setTestType] = useState<'avaliativo' | 'pesquisa'>('avaliativo'); // Novo estado
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [collection, setCollection] = useState('');
  const [isPublic, setIsPublic] = useState(!isInstitutional);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();
  
  const [isKnowledgeTest, setIsKnowledgeTest] = useState(false);
  const [essayPrompts, setEssayPrompts] = useState<EssayPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSerie, setSelectedSerie] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrompts = async () => {
        const supabase = createClient();
        const { data } = await supabase.from('essay_prompts').select('id, title').order('title');
        if (data) setEssayPrompts(data);
    };
    fetchPrompts();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const filePath = `covers/${crypto.randomUUID()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;

    const { error: uploadError } = await supabase.storage.from('tests').upload(filePath, file);

    if (uploadError) {
        addToast({ title: "Erro no Upload", message: uploadError.message, type: 'error' });
        setIsUploading(false);
        return;
    }

    const { data } = supabase.storage.from('tests').getPublicUrl(filePath);
    setCoverImageUrl(data.publicUrl);
    setIsUploading(false);
    addToast({ title: "Upload Concluído", message: "Imagem de capa enviada com sucesso!", type: 'success' });
  };
  
  const handleJsonImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') {
                throw new Error("Não foi possível ler o arquivo.");
            }
            const importedQuestions = JSON.parse(text);

            if (!Array.isArray(importedQuestions)) {
                throw new Error("O JSON deve conter um array de questões.");
            }
            
            const newQuestions: Question[] = importedQuestions.map(q => {
                if (!q.question_type || !q.content || !q.content.statement) {
                    throw new Error(`Questão inválida encontrada no arquivo: ${JSON.stringify(q)}`);
                }
                return {
                    ...q,
                    id: crypto.randomUUID(),
                    points: q.points || 1,
                };
            });

            setQuestions(prev => [...prev, ...newQuestions]);
            addToast({ title: "Sucesso!", message: `${newQuestions.length} questões foram importadas.`, type: 'success' });

        } catch (error) {
            const message = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
            addToast({ title: "Erro de Importação", message: `Não foi possível importar o arquivo: ${message}`, type: 'error' });
        } finally {
            if (jsonInputRef.current) {
                jsonInputRef.current.value = "";
            }
        }
    };
    reader.readAsText(file);
  };


  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      question_type: 'multiple_choice',
      content: { statement: '', options: [''], correct_option: undefined, base_text: '' },
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
      addToast({ title: "Campo Obrigatório", message: "O título da avaliação é obrigatório.", type: 'error' });
      return;
    }
    if (isInstitutional && !selectedClass) {
        addToast({ title: "Campo Obrigatório", message: "Você deve selecionar uma turma para criar uma avaliação.", type: 'error' });
        return;
    }
    if (isKnowledgeTest && !selectedPrompt) {
        addToast({ title: "Ação Necessária", message: "Para um 'Teste de Conhecimento', você deve associar um tema de redação.", type: 'error' });
        return;
    }

    startTransition(async () => {
      const result = await createOrUpdateTest({
        title,
        description,
        questions,
        is_public: selectedClass ? false : isInstitutional ? false : isPublic,
        is_knowledge_test: isKnowledgeTest,
        related_prompt_id: selectedPrompt,
        cover_image_url: coverImageUrl || null,
        collection: collection || null,
        class_id: selectedClass,
        serie: selectedSerie,
        test_type: testType,
      });

      if (result.error) {
        addToast({ title: "Erro ao Salvar", message: `Não foi possível criar a avaliação: ${result.error}`, type: 'error' });
      } else {
        addToast({ title: "Sucesso!", message: "A avaliação foi criada e já está disponível.", type: 'success' });
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">Título da Avaliação</label>
                <input id="title" type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Simulado ENEM - Ciências Humanas"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                  <label htmlFor="test_type" className="block text-sm font-medium mb-1">Tipo de Avaliação</label>
                  <select id="test_type" value={testType} onChange={e => setTestType(e.target.value as any)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 bg-white">
                      <option value="avaliativo">Avaliativo (com nota)</option>
                      <option value="pesquisa">Pesquisa (sem nota)</option>
                  </select>
              </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Descrição / Instruções</label>
            <textarea id="description" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Instruções para os alunos, temas abordados, etc."
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="class_id" className="block text-sm font-medium mb-1">
                Atribuir para Turma {isInstitutional && <span className="text-red-500">*</span>}
              </label>
              <select
                id="class_id"
                value={selectedClass || ''}
                onChange={e => setSelectedClass(e.target.value || null)}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 bg-white"
                required={isInstitutional}
              >
                {!isInstitutional && <option value="">Disponível para todos (Global/Público)</option>}
                {isInstitutional && <option value="">Selecione a turma</option>}
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedClass && (
              <div>
                <label htmlFor="serie" className="block text-sm font-medium mb-1">
                  Restringir para a Série (Opcional)
                </label>
                <select
                  id="serie"
                  value={selectedSerie || ''}
                  onChange={e => setSelectedSerie(e.target.value || null)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 bg-white"
                >
                  <option value="">Todas as séries da turma</option>
                  <option value="1_ano_em">1º Ano - Ensino Médio</option>
                  <option value="2_ano_em">2º Ano - Ensino Médio</option>
                  <option value="3_ano_em">3º Ano - Ensino Médio</option>
                  <option value="9_ano_ef">9º Ano - Ensino Fundamental</option>
                  <option value="8_ano_ef">8º Ano - Ensino Fundamental</option>
                  <option value="7_ano_ef">7º Ano - Ensino Fundamental</option>
                  <option value="6_ano_ef">6º Ano - Ensino Fundamental</option>
                  <option value="5_ano_ef">5º Ano - Ensino Fundamental</option>
                </select>
              </div>
            )}
          </div>
             <p className="text-xs text-text-muted mt-1">
                {isInstitutional 
                    ? "Avaliações atribuídas a uma turma são visíveis apenas para os alunos daquela turma."
                    : "Para criar um teste privado, primeiro crie uma turma no módulo Facillit Edu."
                }
            </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="collection" className="block text-sm font-medium mb-1">Coleção</label>
                <input id="collection" type="text" value={collection} onChange={e => setCollection(e.target.value)} placeholder="Ex: Simulados ENEM 2024"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
                <label htmlFor="coverImageUrl" className="block text-sm font-medium mb-1">URL da Imagem de Capa</label>
                <input id="coverImageUrl" type="text" value={coverImageUrl} onChange={e => setCoverImageUrl(e.target.value)} placeholder="https://exemplo.com/imagem.png (Opcional)"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
          </div>
          
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full py-2 border-2 border-dashed rounded-lg text-text-muted hover:border-royal-blue hover:text-royal-blue transition disabled:opacity-50">
                <i className={`fas ${isUploading ? 'fa-spinner fa-spin' : 'fa-upload'} mr-2`}></i>
                {isUploading ? 'Enviando Imagem...' : 'Ou clique para fazer Upload da Imagem de Capa'}
          </button>
          {coverImageUrl && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                <Image src={coverImageUrl} alt="Preview da Capa" width={50} height={50} className="rounded-md object-cover" />
                <p className="text-xs text-text-muted">Capa atual: {coverImageUrl.substring(0, 50)}... <button type="button" onClick={() => setCoverImageUrl('')} className="text-red-500 hover:underline ml-2">Remover</button></p>
            </div>
          )}
          
          {!isInstitutional && !selectedClass && (
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border dark:border-gray-700">
              <input id="is_public" type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-royal-blue focus:ring-royal-blue" />
              <div>
                <label htmlFor="is_public" className="font-medium text-sm text-dark-text dark:text-white">Simulado Público</label>
                <p className="text-xs text-text-muted dark:text-gray-400">Se marcado, este simulado será visível para todos os alunos na plataforma.</p>
              </div>
            </div>
          )}

          <div className="space-y-3 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
                <input id="is_knowledge_test" type="checkbox" checked={isKnowledgeTest} onChange={(e) => setIsKnowledgeTest(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-royal-blue focus:ring-royal-blue" />
                <div>
                    <label htmlFor="is_knowledge_test" className="font-medium text-sm text-dark-text dark:text-white">É um &quot;Teste de Conhecimento&quot;?</label>
                    <p className="text-xs text-text-muted dark:text-gray-400">Este tipo de teste aparece no dashboard do aluno e sugere uma redação no final.</p>
                </div>
            </div>
            {isKnowledgeTest && (
                <div className="pt-2">
                    <label htmlFor="related_prompt_id" className="block text-sm font-medium mb-1">Tema de Redação Associado</label>
                    <select id="related_prompt_id" value={selectedPrompt || ''} onChange={e => setSelectedPrompt(e.target.value)} required
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 bg-white">
                        <option value="">Selecione um tema...</option>
                        {essayPrompts.map(prompt => (
                            <option key={prompt.id} value={prompt.id}>{prompt.title}</option>
                        ))}
                    </select>
                </div>
            )}
          </div>
          
          <div className="pt-4 border-t dark:border-gray-600 space-y-4">
             <div className="flex justify-between items-center">
                <h4 className="font-bold text-md">Questões da Avaliação ({questions.length})</h4>
                <button 
                    type="button" 
                    onClick={() => jsonInputRef.current?.click()} 
                    className="text-sm font-bold text-royal-blue hover:underline"
                >
                    <i className="fas fa-file-import mr-2"></i>
                    Importar de JSON
                </button>
                <input 
                    type="file" 
                    ref={jsonInputRef} 
                    onChange={handleJsonImport} 
                    accept=".json" 
                    className="hidden" 
                />
            </div>

             {questions.map((q, index) => (
                <div key={q.id}>
                    <p className="font-semibold mb-2 text-sm">Questão {index + 1}</p>
                    <QuestionEditor question={q} onUpdate={updateQuestion} onRemove={removeQuestion} isSurvey={testType === 'pesquisa'} />
                </div>
             ))}
             <button type="button" onClick={addQuestion} className="w-full py-2 border-2 border-dashed rounded-lg text-text-muted hover:border-royal-blue hover:text-royal-blue transition">
                <i className="fas fa-plus mr-2"></i> Adicionar Questão
             </button>
          </div>
        </form>

        <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-2 mt-auto flex-shrink-0">
          <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button>
          <button type="submit" form="create-test-form" disabled={isPending || isUploading} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 disabled:bg-gray-400">
            {isPending || isUploading ? 'Salvando...' : 'Salvar Avaliação'}
          </button>
        </div>
      </div>
    </div>
  );
}