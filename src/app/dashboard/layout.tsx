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

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }
  
  // ✅ CORREÇÃO APLICADA AQUI: Adicionado 'organization_id' à consulta
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, user_category, avatar_url, pronoun, nickname, birth_date, school_name, has_completed_onboarding, active_modules, target_exam, verification_badge, organization_id')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    console.error("Erro ao buscar perfil ou perfil não encontrado:", error); 
    await supabase.auth.signOut();
    redirect('/login');
  }

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
    target_exam: profile.target_exam,
    verification_badge: profile.verification_badge,
    organization_id: profile.organization_id, // ✅ CORREÇÃO APLICADA AQUI: Adicionada a propriedade ao objeto
  };

  return (
    <DashboardClientLayout userProfile={userProfile}>
      {children}
    </DashboardClientLayout>
  );
}