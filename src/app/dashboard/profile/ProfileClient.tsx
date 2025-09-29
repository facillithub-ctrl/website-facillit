"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import createClient from '@/utils/supabase/client';
import type { UserProfile } from '../types';

type ProfileClientProps = {
  profile: UserProfile;
  userEmail: string | undefined;
};

export default function ProfileClient({ profile: initialProfile, userEmail }: ProfileClientProps) {
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
        })
        .eq('id', profile.id);

      if (!error) {
        alert('Perfil atualizado com sucesso!');
        setIsEditing(false);
        router.refresh(); // Revalida os dados no servidor
      } else {
        alert(`Erro ao atualizar: ${error.message}`);
      }
    });
  };

  return (
    <div className="max-w-2xl bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <form onSubmit={handleUpdate}>
        <div className="space-y-4">
           <div>
            <label className="text-sm font-bold text-gray-600 dark:text-gray-400">E-mail</label>
            <p className="text-dark-text dark:text-white mt-1">{userEmail}</p>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Nome Completo</label>
            <input
              type="text"
              name="fullName"
              value={profile.fullName || ''}
              onChange={(e) => setProfile(p => ({ ...p!, fullName: e.target.value }))}
              disabled={!isEditing}
              className="w-full p-2 border rounded-md mt-1 bg-transparent disabled:opacity-70 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Apelido</label>
            <input
              type="text"
              name="nickname"
              value={profile.nickname || ''}
              onChange={(e) => setProfile(p => ({ ...p!, nickname: e.target.value }))}
              disabled={!isEditing}
              className="w-full p-2 border rounded-md mt-1 bg-transparent disabled:opacity-70 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Pronome</label>
             <select
              name="pronoun"
              value={profile.pronoun || ''}
              onChange={(e) => setProfile(p => ({ ...p!, pronoun: e.target.value }))}
              disabled={!isEditing}
              className="w-full p-2 border rounded-md mt-1 bg-white disabled:opacity-70 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option>Ele/Dele</option>
              <option>Ela/Dela</option>
              <option>Elu/Delu</option>
              <option>Prefiro não informar</option>
            </select>
          </div>
        </div>
        <div className="mt-6 border-t pt-4 dark:border-gray-700 flex gap-4">
          {isEditing ? (
            <>
              <button type="submit" disabled={isPending} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 disabled:opacity-50">
                {isPending ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">
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
  );
}