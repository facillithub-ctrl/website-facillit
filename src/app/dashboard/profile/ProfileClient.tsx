"use client";

import { useState, useTransition } from 'react';
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
  profile: UserProfile; // O tipo UserProfile já foi atualizado para incluir birthDate e schoolName
  userEmail: string | undefined;
  statistics: {
    stats: Stats;
    streak: number;
    rankInfo: RankInfo;
  }
};

export default function ProfileClient({ profile: initialProfile, userEmail, statistics }: ProfileClientProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.fullName,
          nickname: profile.nickname,
          pronoun: profile.pronoun,
          birth_date: profile.birthDate,
          school_name: profile.schoolName,
        })
        .eq('id', profile.id);

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
    setProfile(p => ({ ...p, avatarUrl: newUrl }));
    router.refresh(); // Use router.refresh() para atualizar o layout do servidor também
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Coluna Esquerda: Avatar e Estatísticas */}
      <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
             <AvatarUploader profile={profile} onUploadSuccess={handleAvatarUpload} />
             <h2 className="text-xl font-bold mt-4 dark:text-white">{profile.fullName}</h2>
             <p className="text-sm text-text-muted dark:text-gray-400">{userEmail}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="font-bold mb-4 dark:text-white">Suas Estatísticas</h3>
              <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                      <span className="text-text-muted dark:text-gray-400">Redações Corrigidas</span>
                      {/* CORREÇÃO APLICADA AQUI */}
                      <span className="font-bold dark:text-white">{statistics?.stats?.totalCorrections ?? 0}</span>
                  </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-text-muted dark:text-gray-400">Média Geral</span>
                      {/* CORREÇÃO APLICADA AQUI */}
                      <span className="font-bold dark:text-white">{statistics?.stats?.averages.avg_final_grade.toFixed(0) ?? 'N/A'}</span>
                  </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-text-muted dark:text-gray-400">Sequência de Escrita</span>
                      <span className="font-bold dark:text-white">{statistics?.streak ?? 0} {statistics?.streak === 1 ? 'dia' : 'dias'}</span>
                  </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-text-muted dark:text-gray-400">Ranking Estadual</span>
                      <span className="font-bold dark:text-white">{statistics?.rankInfo?.rank ? `#${statistics.rankInfo.rank}` : 'N/A'}</span>
                  </div>
              </div>
          </div>
      </div>

      {/* Coluna Direita: Formulário de Edição */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <form onSubmit={handleUpdate}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Nome Completo</label>
              <input
                type="text"
                value={profile.fullName || ''}
                onChange={(e) => setProfile(p => ({ ...p, fullName: e.target.value }))}
                disabled={!isEditing}
                className="w-full p-2 border rounded-md mt-1 bg-transparent disabled:opacity-70 dark:text-white dark:border-gray-600"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Apelido</label>
                <input
                  type="text"
                  value={profile.nickname || ''}
                  onChange={(e) => setProfile(p => ({ ...p, nickname: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full p-2 border rounded-md mt-1 bg-transparent disabled:opacity-70 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Data de Nascimento</label>
                <input
                  type="date"
                  value={profile.birthDate?.split('T')[0] || ''}
                  onChange={(e) => setProfile(p => ({ ...p, birthDate: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full p-2 border rounded-md mt-1 bg-transparent disabled:opacity-70 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Pronome</label>
               <select
                value={profile.pronoun || ''}
                onChange={(e) => setProfile(p => ({ ...p, pronoun: e.target.value }))}
                disabled={!isEditing}
                className="w-full p-2 border rounded-md mt-1 bg-white disabled:opacity-70 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option>Ele/Dele</option>
                <option>Ela/Dela</option>
                <option>Elu/Delu</option>
                <option>Prefiro não informar</option>
              </select>
            </div>
             <div>
              <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Escola / Instituição</label>
              <input
                type="text"
                value={profile.schoolName || ''}
                onChange={(e) => setProfile(p => ({ ...p, schoolName: e.target.value }))}
                disabled={!isEditing}
                className="w-full p-2 border rounded-md mt-1 bg-transparent disabled:opacity-70 dark:text-white dark:border-gray-600"
              />
            </div>
          </div>
          <div className="mt-6 border-t pt-4 dark:border-gray-700 flex gap-4">
            {isEditing ? (
              <>
                <button type="submit" disabled={isPending} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 disabled:opacity-50">
                  {isPending ? 'Salvando...' : 'Salvar Alterações'}
                </button>
                <button type="button" onClick={() => { setIsEditing(false); setProfile(initialProfile); }} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">
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