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
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, user_category, avatar_url, pronoun, nickname, birth_date, school_name, has_completed_onboarding, active_modules, target_exam, verification_badge, organization_id')
    .eq('id', user.id)
    .single();

  // ✅ CORREÇÃO APLICADA AQUI
  // Verificamos se o erro é REALMENTE um problema de banco de dados,
  // ignorando o erro 'PGRST116', que significa apenas "nenhuma linha encontrada".
  // Se o perfil for nulo, mas não houver outro erro, a aplicação continua,
  // pois a tela de Onboarding cuidará da criação do perfil.
  if (error && error.code !== 'PGRST116') {
    console.error("Erro ao buscar perfil:", error); 
    await supabase.auth.signOut();
    redirect('/login');
  }

  // Se o perfil for nulo (novo usuário), criamos um objeto 'UserProfile' parcial
  // para que o layout do cliente possa renderizar a tela de Onboarding.
  const userProfile: UserProfile = profile ? {
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
    organization_id: profile.organization_id,
  } : {
    // Objeto padrão para um novo usuário sem perfil
    id: user.id,
    fullName: null,
    userCategory: null,
    avatarUrl: null,
    pronoun: null,
    nickname: null,
    birthDate: null,
    schoolName: null,
    has_completed_onboarding: false,
    active_modules: [],
    target_exam: null,
    verification_badge: null,
    organization_id: null,
  };

  return (
    <DashboardClientLayout userProfile={userProfile}>
      {children}
    </DashboardClientLayout>
  );
}