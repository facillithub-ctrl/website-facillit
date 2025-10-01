import { redirect } from 'next/navigation';
import createSupabaseServerClient from '@/utils/supabase/server';
import { UserProfile } from '@/app/dashboard/types';
import DashboardClientLayout from '@/app/dashboard/DashboardClientLayout';
import AdminSidebar from './AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Proteção: Redireciona para o dashboard se o usuário não for um administrador
  if (!profile || profile.user_category !== 'administrator') {
    redirect('/dashboard');
  }
  
  const userProfile: UserProfile = {
    id: profile.id,
    fullName: profile.full_name,
    userCategory: profile.user_category,
    avatarUrl: profile.avatar_url,
    pronoun: profile.pronoun,
    nickname: profile.nickname,
    has_completed_onboarding: profile.has_completed_onboarding,
    active_modules: profile.active_modules,
  };

  // Este layout envolve toda a seção /admin
  return (
    <DashboardClientLayout userProfile={userProfile}>
        <div className="flex h-full">
            {/* O menu lateral específico do admin */}
            <AdminSidebar />
            {/* O conteúdo da página (ex: /admin/write) será renderizado aqui */}
            <main className="flex-1 p-6 overflow-y-auto">
                {children}
            </main>
        </div>
    </DashboardClientLayout>
  );
}