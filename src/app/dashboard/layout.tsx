import { redirect } from 'next/navigation';
import createSupabaseServerClient from '@/utils/supabase/server';
import type { UserProfile } from './types';
import DashboardClientLayout from './DashboardClientLayout';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }
  
  // CORREÇÃO: Adicionados 'nickname', 'birth_date', e 'school_name' à query
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, user_category, avatar_url, pronoun, nickname, birth_date, school_name, has_completed_onboarding, active_modules')
    .eq('id', session.user.id)
    .single();

  if (error || !profile) {
    // Apenas para depuração, você pode remover isso depois
    console.error("Erro ao buscar perfil ou perfil não encontrado:", error); 
    await supabase.auth.signOut();
    redirect('/login');
  }

  // CORREÇÃO: Adicionados os campos que faltavam para corresponder ao tipo UserProfile
  const userProfile: UserProfile = {
    id: profile.id,
    fullName: profile.full_name,
    userCategory: profile.user_category,
    avatarUrl: profile.avatar_url,
    pronoun: profile.pronoun,
    nickname: profile.nickname,
    birthDate: profile.birth_date,
    schoolName: profile.school_name,
    has_completed_onboarding: profile.has_completed_onboarding,
    active_modules: profile.active_modules,
  };

  return (
    <DashboardClientLayout userProfile={userProfile}>
      {children}
    </DashboardClientLayout>
  );
}