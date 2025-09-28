import { redirect } from 'next/navigation';
// A importação volta a ser 'default' (sem as chaves {})
import createSupabaseServerClient from '@/utils/supabase/server';
import type { UserProfile } from './types';
import DashboardClientLayout from './DashboardClientLayout';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // A chamada precisa ter 'await'
  const supabase = await createSupabaseServerClient();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, user_category, avatar_url, pronoun, has_completed_onboarding, active_modules')
    .eq('id', session.user.id)
    .single();

  if (error || !profile) {
    await supabase.auth.signOut();
    redirect('/login');
  }

  const userProfile: UserProfile = {
    id: profile.id,
    fullName: profile.full_name,
    userCategory: profile.user_category,
    avatarUrl: profile.avatar_url,
    pronoun: profile.pronoun,
    has_completed_onboarding: profile.has_completed_onboarding,
    active_modules: profile.active_modules,
  };

  return (
    <DashboardClientLayout userProfile={userProfile}>
      {children}
    </DashboardClientLayout>
  );
}