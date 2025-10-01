"use client";

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import createClient from '@/utils/supabase/client';
import type { UserProfile } from '../types';
import AvatarUploader from './AvatarUploader';

// Tipos para as estatísticas
type Stats = {
    totalCorrections: number;
    averages: { avg_final_grade: number; };
} | null;
type RankInfo = { rank: number | null; state: string | null; } | null;

type ProfileClientProps = {
  profile: UserProfile;
  userEmail: string | undefined;
  statistics: {
    stats: Stats;
    streak: number;
    rankInfo: RankInfo;
  }
};

export default function ProfileClient({ profile: initialProfile, userEmail, statistics }: ProfileClientProps) {
  const [formData, setFormData] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  // NOVO ESTADO: para rastrear se houve mudanças no formulário
  const [hasChanges, setHasChanges] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setFormData(initialProfile);
  }, [initialProfile]);

  // NOVO useEffect: Compara os dados iniciais com os dados do formulário
  // e atualiza o estado 'hasChanges'
  useEffect(() => {
    // Compara a versão em string dos objetos para ver se há diferença
    if (JSON.stringify(formData) !== JSON.stringify(initialProfile)) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [formData, initialProfile]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          nickname: formData.nickname,
          pronoun: formData.pronoun,
          birth_date: formData.birthDate,
          school_name: formData.schoolName,
          target_exam: formData.target_exam,
        })
        .eq('id', formData.id);

      if (!error) {
        alert('Perfil atualizado com sucesso!');
        setIsEditing(false);
        router.refresh(); 
      } else {
        alert(`Erro ao atualizar: ${error.message}`);
      }
    });
  };
  
  const handleAvatarUpload = (newUrl: string) => {
    setFormData(p => ({ ...p, avatarUrl: newUrl }));
    router.refresh(); 
  };
  
  const userStats = statistics?.stats;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Coluna Esquerda: Avatar e Estatísticas */}
      <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
             <AvatarUploader profile={formData} onUploadSuccess={handleAvatarUpload} />
             <h2 className="text-xl font-bold mt-4 dark:text-white">{formData.fullName}</h2>
             <p className="text-sm text-text-muted dark:text-gray-400">{userEmail}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="font-bold mb-4 dark:text-white">Suas Estatísticas</h3>
              <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                      <span className="text-text-muted dark:text-gray-400">Redações Corrigidas</span>
                      <span className="font-bold dark:text-white">{userStats?.totalCorrections ?? 0}</span>
                  </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-text-muted dark:text-gray-400">Média Geral</span>
                      <span className="font-bold dark:text-white">{userStats ? userStats.averages.avg_final_grade.toFixed(0) : 'N/A'}</span>
                  </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-text-muted dark:text-gray-400">Sequência de Escrita</span>
                      <span className="font-bold dark:text-white">{statistics.streak} {statistics.streak === 1 ? 'dia' : 'dias'}</span>
                  </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-text-muted dark:text-gray-400">Ranking Estadual</span>
                      <span className="font-bold dark:text-white">{statistics.rankInfo?.rank ? `#${statistics.rankInfo.rank}` : 'N/A'}</span>
                  </div>
              </div>
          </div>
      </div>

      {/* Coluna Direita: Formulário de Edição */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <form onSubmit={handleUpdate}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="text-sm font-bold text-gray-600 dark:text-gray-400">Nome Completo</label>
              <input
                id="fullName" name="fullName" type="text"
                value={formData.fullName || ''}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full p-2 border rounded-md mt-1 bg-gray-50 disabled:bg-gray-100 dark:bg-gray-700 dark:disabled:bg-gray-800 dark:text-white dark:border-gray-600"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nickname" className="text-sm font-bold text-gray-600 dark:text-gray-400">Apelido</label>
                <input
                  id="nickname" name="nickname" type="text"
                  value={formData.nickname || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full p-2 border rounded-md mt-1 bg-gray-50 disabled:bg-gray-100 dark:bg-gray-700 dark:disabled:bg-gray-800 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label htmlFor="birthDate" className="text-sm font-bold text-gray-600 dark:text-gray-400">Data de Nascimento</label>
                <input
                  id="birthDate" name="birthDate" type="date"
                  value={formData.birthDate?.split('T')[0] || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full p-2 border rounded-md mt-1 bg-gray-50 disabled:bg-gray-100 dark:bg-gray-700 dark:disabled:bg-gray-800 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>
            <div>
              <label htmlFor="pronoun" className="text-sm font-bold text-gray-600 dark:text-gray-400">Pronome</label>
               <select
                id="pronoun" name="pronoun"
                value={formData.pronoun || ''}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full p-2 border rounded-md mt-1 bg-gray-50 disabled:bg-gray-100 dark:bg-gray-700 dark:disabled:bg-gray-800 dark:text-white dark:border-gray-600"
              >
                <option>Ele/Dele</option>
                <option>Ela/Dela</option>
                <option>Elu/Delu</option>
                <option>Prefiro não informar</option>
              </select>
            </div>
             <div>
              <label htmlFor="schoolName" className="text-sm font-bold text-gray-600 dark:text-gray-400">Escola / Instituição</label>
              <input
                id="schoolName" name="schoolName" type="text"
                value={formData.schoolName || ''}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full p-2 border rounded-md mt-1 bg-gray-50 disabled:bg-gray-100 dark:bg-gray-700 dark:disabled:bg-gray-800 dark:text-white dark:border-gray-600"
              />
            </div>
            <div>
              <label htmlFor="target_exam" className="text-sm font-bold text-gray-600 dark:text-gray-400">Meu foco é o vestibular:</label>
              <select
                id="target_exam" name="target_exam"
                value={formData.target_exam || ''}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full p-2 border rounded-md mt-1 bg-gray-50 disabled:bg-gray-100 dark:bg-gray-700 dark:disabled:bg-gray-800 dark:text-white dark:border-gray-600"
              >
                <option value="">Nenhum</option>
                <option value="ENEM">ENEM</option>
                <option value="FUVEST">FUVEST</option>
                <option value="UNICAMP">UNICAMP</option>
                <option value="UNESP">UNESP</option>
              </select>
            </div>
          </div>
          <div className="mt-6 border-t pt-4 dark:border-gray-700 flex gap-4">
            {isEditing ? (
              <>
                {/* BOTÃO SALVAR ATUALIZADO */}
                <button
                  type="submit"
                  disabled={isPending || !hasChanges}
                  className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                >
                  {isPending ? 'Salvando...' : 'Salvar Alterações'}
                </button>
                <button type="button" onClick={() => { setIsEditing(false); setFormData(initialProfile); }} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">
                  Cancelar
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setIsEditing(true)} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">
                Editar Perfil
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}