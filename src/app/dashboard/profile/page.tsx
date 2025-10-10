import createSupabaseServerClient from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';
import type { UserProfile } from '../types';
import { getStudentStatistics, calculateWritingStreak, getUserStateRank } from '../applications/write/actions';

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // A query com select('*') já busca todas as colunas, incluindo a que precisamos.
  const [profileResult, statsResult, streakResult, rankResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    getStudentStatistics(),
    calculateWritingStreak(),
    getUserStateRank()
  ]);

  const { data: profileData, error } = profileResult;
  
  if (error || !profileData) {
    console.error("Erro ao buscar perfil:", error);
    redirect('/login');
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
    birthDate: profileData.birth_date,
    schoolName: profileData.school_name,
    organization_id: profileData.organization_id, // <-- CORREÇÃO AQUI
    target_exam: profileData.target_exam,
    verification_badge: profileData.verification_badge,
  };

  const statistics = {
    stats: statsResult.data ?? null,
    streak: streakResult.data ?? 0,
    rankInfo: rankResult.data ?? { rank: null, state: null }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text dark:text-white">Meu Perfil</h1>
      <p className="text-text-muted dark:text-gray-400 mb-6">Veja, gerencie suas informações e acompanhe seu progresso.</p>
      
      <ProfileClient 
        profile={profile} 
        userEmail={user.email} 
        statistics={statistics}
      />
    </div>
  );
}