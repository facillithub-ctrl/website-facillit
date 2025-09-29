import createSupabaseServerClient from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';
import type { UserProfile } from '../types';

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profileData) {
    return <div>Perfil não encontrado.</div>;
  }

  const profile: UserProfile = {
    id: profileData.id,
    fullName: profileData.full_name,
    userCategory: profileData.user_category,
    avatarUrl: profileData.avatar_url,
    pronoun: profileData.pronoun,
    nickname: profileData.nickname,
    has_completed_onboarding: profileData.has_completed_onboarding,
    active_modules: profileData.active_modules,
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text dark:text-white">Meu Perfil</h1>
      <p className="text-text-muted dark:text-gray-400 mb-6">Veja e gerencie suas informações pessoais.</p>
      
      <ProfileClient profile={profile} userEmail={user.email} />
    </div>
  );
}