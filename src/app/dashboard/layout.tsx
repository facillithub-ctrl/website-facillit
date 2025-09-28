import { redirect } from 'next/navigation';
import createSupabaseServerClient from '@/utils/supabase/server';
import type { UserProfile } from './types';
import DashboardClientLayout from './DashboardClientLayout';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient(); // <-- CORREÇÃO: Adicionado 'await'

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`id, full_name, user_category, avatar_url, pronoun`)
    .eq('id', session.user.id)
    .single();

  if (error || !profile) {
    redirect('/login');
  }

  const userProfile: UserProfile = {
    id: profile.id,
    fullName: profile.full_name,
    userCategory: profile.user_category,
    avatarUrl: profile.avatar_url,
    pronoun: profile.pronoun,
  };

  return (
    <DashboardClientLayout userProfile={userProfile}>
      {children}
    </DashboardClientLayout>
  );
}