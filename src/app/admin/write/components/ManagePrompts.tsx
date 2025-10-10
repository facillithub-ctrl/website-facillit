"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import createClient from '@/utils/supabase/client';
import { upsertPrompt, deletePrompt } from '../../actions';
// ✅ CORREÇÃO APLICADA AQUI: O tipo agora é importado do local correto.
import type { EssayPrompt } from '@/app/dashboard/types';
import Image from 'next/image';
import { useToast } from '@/contexts/ToastContext';
import ConfirmationModal from '@/components/ConfirmationModal';
import RichTextEditor from '@/components/DynamicRichTextEditor';

type Props = {
    prompts: EssayPrompt[];
};

type PromptFormData = Omit<Partial<EssayPrompt>, 'tags'> & {
    tags: string;
};

const categories = [
    'Ciência e Tecnologia', 'Sociedade', 'Meio Ambiente', 'Cultura', 'Educação', 'Saúde', 'Economia', 'Política'
];

const DifficultySelector = ({ value, onChange }: { value: number, onChange: (value: number) => void }) => {
    const difficulties = [
        { level: 1, label: 'Muito Fácil' },
        { level: 2, label: 'Fácil' },
        { level: 3, label: 'Médio' },
        { level: 4, label: 'Difícil' },
        { level: 5, label: 'Muito Difícil' }
    ];
    return (
        <div>
            <label className="block text-sm font-medium mb-2">Dificuldade</label>
            <div className="flex space-x-2">
                {difficulties.map(({ level, label }) => (
                    <button
                        key={level}
                        type="button"
                        onClick={() => onChange(level)}
                        className={`w-full text-center px-2 py-1.5 border rounded-md text-xs font-semibold transition-colors ${
                            value === level
                                ? 'bg-royal-blue text-white border-royal-blue'
                                : 'bg-transparent hover:border-royal-blue'
                        }`}
                        title={label}
                    >
                        {level}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default function ManagePrompts({ prompts }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPrompt, setCurrentPrompt] = useState<PromptFormData | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const { addToast } = useToast();
    const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [promptToDelete, setPromptToDelete] = useState<string | null>(null);

    const handleOpenModal = (prompt: EssayPrompt | null) => {
        const promptData: PromptFormData = prompt ? {
            ...prompt,
            publication_date: prompt.publication_date ? prompt.publication_date.split('T')[0] : '',
            deadline: prompt.deadline ? prompt.deadline.slice(0, 16) : '',
            tags: Array.isArray(prompt.tags) ? prompt.tags.join(', ') : '',
        } : { difficulty: 3, tags: '' };
        setCurrentPrompt(promptData);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentPrompt(null);
    };
    
    const handleDeleteClick = (promptId: string) => {
        setPromptToDelete(promptId);
        setConfirmDeleteOpen(true);
    };

    const executeDelete = () => {
        if (!promptToDelete) return;

        startTransition(async () => {
            const result = await deletePrompt(promptToDelete);
            if (result.error) {
                addToast({ title: "Erro ao Excluir", message: result.error, type: 'error' });
            } else {
                addToast({ title: "Sucesso", message: "Tema excluído com sucesso.", type: 'success' });
                router.refresh();
            }
            setConfirmDeleteOpen(false);
            setPromptToDelete(null);
        });
    };

    const handleFileUpload = async (file: File): Promise<string | null> => {
        setIsUploading(true);
        const filePath = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;

        const { error: uploadError } = await supabase.storage
            .from('essay_prompts')
            .upload(filePath, file);
        
        if (uploadError) {
            addToast({ title: "Erro no Upload", message: uploadError.message, type: 'error' });
            setIsUploading(false);
            return null;
        }

        const { data } = supabase.storage.from('essay_prompts').getPublicUrl(filePath);
        setIsUploading(false);
        return data.publicUrl;
    };

    const handleCoverImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const publicUrl = await handleFileUpload(file);
        if (publicUrl) {
            setCurrentPrompt(prev => prev ? ({ ...prev, image_url: publicUrl }) : null);
        }
    };

    const handleMotivationalImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const publicUrl = await handleFileUpload(file);
        if (publicUrl) {
            setCurrentPrompt(prev => prev ? ({ ...prev, motivational_text_3_image_url: publicUrl }) : null);
        }
    };
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!currentPrompt) return;

        startTransition(async () => {
            const submissionData = {
                ...currentPrompt,
                tags: currentPrompt.tags.split(',').map(tag => tag.trim()).filter(Boolean)
            };
            const result = await upsertPrompt(submissionData);
            if (result.error) {
                addToast({ title: "Erro ao Salvar", message: result.error, type: 'error' });
            } else {
                addToast({ title: "Sucesso!", message: "O tema foi salvo com sucesso.", type: 'success' });
                handleCloseModal();
                router.refresh();
            }
        });
    };

    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
            <ConfirmationModal
                isOpen={isConfirmDeleteOpen}
                title="Confirmar Exclusão"
                message="Tem certeza que deseja excluir este tema? Esta ação não pode ser desfeita."
                onConfirm={executeDelete}
                onClose={() => setConfirmDeleteOpen(false)}
                confirmText="Sim, Excluir"
            />
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-dark-text dark:text-white">Gerenciar Temas</h2>
                <button onClick={() => handleOpenModal(null)} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">
                    <i className="fas fa-plus mr-2"></i> Novo Tema
                </button>
            </div>
            <div className="max-h-96 overflow-auto">
                <ul className="divide-y dark:divide-gray-700">
                    {prompts.map(prompt => (
                        <li key={prompt.id} className="py-3 flex justify-between items-center">
                            <span className="font-medium text-dark-text dark:text-white">{prompt.title}</span>
                            <div className="space-x-2">
                                <button onClick={() => handleOpenModal(prompt)} className="text-blue-500 hover:underline">Editar</button>
                                <button onClick={() => handleDeleteClick(prompt.id)} disabled={isPending} className="text-red-500 hover:underline disabled:opacity-50">Excluir</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {isModalOpen && currentPrompt && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                            <h3 className="text-lg font-bold">{currentPrompt.id ? 'Editar Tema' : 'Novo Tema'}</h3>
                            <button onClick={handleCloseModal} className="text-gray-500">&times;</button>
                        </div>
                        <form id="prompt-form" onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium mb-1">Título</label>
                                <input type="text" value={currentPrompt.title || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, title: e.target.value }) : null)} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Texto da Proposta (Descrição)</label>
                                <textarea rows={4} value={currentPrompt.description || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, description: e.target.value }) : null)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            </div>

                             <div className="space-y-4 rounded-md border dark:border-gray-600 p-4">
                                <h4 className="font-bold text-md mb-2">Textos Motivadores</h4>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Texto Motivador I</label>
                                    <textarea rows={3} value={currentPrompt.motivational_text_1 || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, motivational_text_1: e.target.value }) : null)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Texto Motivador II</label>
                                    <textarea rows={3} value={currentPrompt.motivational_text_2 || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, motivational_text_2: e.target.value }) : null)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <label className="block text-sm font-medium mb-2">Texto Motivador III (Imagem)</label>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium mb-1">Upload da Imagem</label>
                                            <input type="file" onChange={handleMotivationalImageChange} accept="image/*" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-royal-blue hover:file:bg-blue-100" />
                                            {currentPrompt.motivational_text_3_image_url && <Image src={currentPrompt.motivational_text_3_image_url} alt="Preview" width={200} height={100} className="mt-2 h-20 w-auto rounded" />}
                                        </div>
                                         <div>
                                            <label className="block text-xs font-medium mb-1">Descrição da Imagem</label>
                                            <textarea rows={2} value={currentPrompt.motivational_text_3_description || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, motivational_text_3_description: e.target.value }) : null)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                        </div>
                                         <div>
                                            <label className="block text-xs font-medium mb-1">Fonte da Imagem</label>
                                            <input type="text" value={currentPrompt.motivational_text_3_image_source || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, motivational_text_3_image_source: e.target.value }) : null)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Fonte do Tema (Ex: ENEM 2023)</label>
                                    <input type="text" value={currentPrompt.source || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, source: e.target.value }) : null)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Categoria</label>
                                    <select value={currentPrompt.category || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, category: e.target.value }) : null)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 bg-white">
                                        <option value="">Selecione uma categoria</option>
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <DifficultySelector 
                                    value={currentPrompt.difficulty || 3}
                                    onChange={value => setCurrentPrompt(p => p ? ({...p, difficulty: value}) : null)}
                                />
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tags (separadas por vírgula)</label>
                                    <input type="text" value={currentPrompt.tags} onChange={e => setCurrentPrompt(p => p ? ({ ...p, tags: e.target.value }) : null)} placeholder="Ex: Atualidades, Filosofia" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Data de Publicação</label>
                                    <input type="date" value={currentPrompt.publication_date || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, publication_date: e.target.value }) : null)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Prazo Final (Opcional)</label>
                                    <input type="datetime-local" value={currentPrompt.deadline || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, deadline: e.target.value }) : null)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                            </div>
                            
                             <div>
                                <label className="block text-sm font-medium mb-1">Imagem de Capa</label>
                                <input type="file" onChange={handleCoverImageChange} accept="image/*" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-royal-blue hover:file:bg-blue-100" />
                                {(isUploading && <p className="text-sm text-blue-500 mt-2">Enviando...</p>)}
                                {currentPrompt.image_url && <Image src={currentPrompt.image_url} alt="Preview da capa" width={200} height={100} className="mt-2 h-24 w-auto rounded" />}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Fonte da Imagem de Capa (Opcional)</label>
                                <input type="text" value={currentPrompt.cover_image_source || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, cover_image_source: e.target.value }) : null)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            </div>

                        </form>
                        <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-2 mt-auto flex-shrink-0">
                            <button type="button" onClick={handleCloseModal} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button>
                            <button type="submit" form="prompt-form" disabled={isPending || isUploading} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 disabled:bg-gray-400">
                                {isPending ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}