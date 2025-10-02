"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import createClient from '@/utils/supabase/client';
import { upsertPrompt, deletePrompt } from '../../actions';
import { EssayPrompt } from '../../actions';
import Image from 'next/image'; // Importado

type Props = {
    prompts: EssayPrompt[];
};

const categories = [
    'Ciência e Tecnologia', 'Sociedade', 'Meio Ambiente', 'Cultura', 'Educação', 'Saúde', 'Economia', 'Política'
];

export default function ManagePrompts({ prompts }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPrompt, setCurrentPrompt] = useState<Partial<EssayPrompt> | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleOpenModal = (prompt: Partial<EssayPrompt> | null) => {
        // Garante que as datas sejam formatadas corretamente para os inputs
        const promptData = prompt ? {
            ...prompt,
            publication_date: prompt.publication_date ? prompt.publication_date.split('T')[0] : '',
            deadline: prompt.deadline ? prompt.deadline.slice(0, 16) : '',
        } : {};
        setCurrentPrompt(promptData);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentPrompt(null);
    };
    
    const handleDelete = async (promptId: string) => {
        if (confirm('Tem certeza que deseja excluir este tema?')) {
            startTransition(async () => {
                const result = await deletePrompt(promptId);
                if (result.error) {
                    alert(`Erro ao excluir: ${result.error}`);
                } else {
                    router.refresh();
                }
            });
        }
    };

    const handleFileUpload = async (file: File): Promise<string | null> => {
        setIsUploading(true);
        const filePath = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;

        const { error: uploadError } = await supabase.storage
            .from('essay_prompts')
            .upload(filePath, file);
        
        if (uploadError) {
            alert(`Erro no upload: ${uploadError.message}`);
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
            setCurrentPrompt(prev => ({ ...prev, image_url: publicUrl }));
        }
    };

    const handleMotivationalImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const publicUrl = await handleFileUpload(file);
        if (publicUrl) {
            setCurrentPrompt(prev => ({ ...prev, motivational_text_3_image_url: publicUrl }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!currentPrompt) return;

        startTransition(async () => {
            const result = await upsertPrompt(currentPrompt);
            if (result.error) {
                alert(`Erro ao salvar: ${result.error}`);
            } else {
                handleCloseModal();
                router.refresh();
            }
        });
    };

    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
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
                                <button onClick={() => handleDelete(prompt.id)} disabled={isPending} className="text-red-500 hover:underline disabled:opacity-50">Excluir</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                            <h3 className="text-lg font-bold">{currentPrompt?.id ? 'Editar Tema' : 'Novo Tema'}</h3>
                            <button onClick={handleCloseModal} className="text-gray-500">&times;</button>
                        </div>
                        <form id="prompt-form" onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            {/* CAMPOS REINTEGRADOS */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Título</label>
                                <input type="text" value={currentPrompt?.title || ''} onChange={e => setCurrentPrompt(p => ({ ...p, title: e.target.value }))} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Texto da Proposta (Descrição)</label>
                                <textarea rows={4} value={currentPrompt?.description || ''} onChange={e => setCurrentPrompt(p => ({ ...p, description: e.target.value }))} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            </div>

                             {/* SEÇÃO DE TEXTOS MOTIVADORES ATUALIZADA */}
                            <div className="space-y-4 rounded-md border dark:border-gray-600 p-4">
                                <h4 className="font-bold text-md mb-2">Textos Motivadores</h4>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Texto Motivador I</label>
                                    <textarea rows={3} value={currentPrompt?.motivational_text_1 || ''} onChange={e => setCurrentPrompt(p => ({ ...p, motivational_text_1: e.target.value }))} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Texto Motivador II</label>
                                    <textarea rows={3} value={currentPrompt?.motivational_text_2 || ''} onChange={e => setCurrentPrompt(p => ({ ...p, motivational_text_2: e.target.value }))} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <label className="block text-sm font-medium mb-2">Texto Motivador III (Imagem)</label>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium mb-1">Upload da Imagem</label>
                                            <input type="file" onChange={handleMotivationalImageChange} accept="image/*" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-royal-blue hover:file:bg-blue-100" />
                                            {currentPrompt?.motivational_text_3_image_url && <Image src={currentPrompt.motivational_text_3_image_url} alt="Preview" width={200} height={100} className="mt-2 h-20 w-auto rounded" />}
                                        </div>
                                         <div>
                                            <label className="block text-xs font-medium mb-1">Descrição da Imagem</label>
                                            <textarea rows={2} value={currentPrompt?.motivational_text_3_description || ''} onChange={e => setCurrentPrompt(p => ({ ...p, motivational_text_3_description: e.target.value }))} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                        </div>
                                         <div>
                                            <label className="block text-xs font-medium mb-1">Fonte da Imagem</label>
                                            <input type="text" value={currentPrompt?.motivational_text_3_image_source || ''} onChange={e => setCurrentPrompt(p => ({ ...p, motivational_text_3_image_source: e.target.value }))} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* CAMPOS REINTEGRADOS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Fonte do Tema (Ex: ENEM 2023)</label>
                                    <input type="text" value={currentPrompt?.source || ''} onChange={e => setCurrentPrompt(p => ({ ...p, source: e.target.value }))} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Categoria</label>
                                    <select value={currentPrompt?.category || ''} onChange={e => setCurrentPrompt(p => ({ ...p, category: e.target.value }))} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 bg-white dark:bg-gray-700">
                                        <option value="">Selecione uma categoria</option>
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Data de Publicação</label>
                                    <input type="date" value={currentPrompt?.publication_date || ''} onChange={e => setCurrentPrompt(p => ({ ...p, publication_date: e.target.value }))} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Prazo Final (Opcional)</label>
                                    <input type="datetime-local" value={currentPrompt?.deadline || ''} onChange={e => setCurrentPrompt(p => ({ ...p, deadline: e.target.value }))} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">Imagem de Capa</label>
                                <input type="file" onChange={handleCoverImageChange} accept="image/*" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-royal-blue hover:file:bg-blue-100" />
                                {(isUploading && <p className="text-sm text-blue-500 mt-2">Enviando...</p>)}
                                {currentPrompt?.image_url && <Image src={currentPrompt.image_url} alt="Preview da capa" width={200} height={100} className="mt-2 h-24 w-auto rounded" />}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Fonte da Imagem de Capa (Opcional)</label>
                                <input type="text" value={currentPrompt?.cover_image_source || ''} onChange={e => setCurrentPrompt(p => ({ ...p, cover_image_source: e.target.value }))} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
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