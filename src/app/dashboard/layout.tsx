import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import createSupabaseServerClient from '@/utils/supabase/server';

import Sidebar from '@/components/dashboard/Sidebar
import Topbar from '@/components/dashboard/Topbar

// Definindo um tipo para o perfil do usuário para maior clareza
export type UserProfile = {
  id: string;
  fullName: string | null;
  userCategory: string | null; // A coluna que armazena a "role"
  avatarUrl: string | null; // Supondo que você terá uma URL de avatar
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  // 1. Verificar a sessão do usuário
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // 2. Buscar o perfil do usuário logado na tabela 'profiles'
  //    (com base no seu schema e na página de registro)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`id, full_name, user_category, avatar_url`)
    .eq('id', session.user.id)
    .single();

  if (error || !profile) {
    // Se não encontrar o perfil, pode ser um erro ou um estado inconsistente.
    // Deslogar o usuário é uma opção segura.
    redirect('/login');
  }

  const userProfile: UserProfile = {
    id: profile.id,
    fullName: profile.full_name,
    userCategory: profile.user_category,
    avatarUrl: profile.avatar_url,
  };

  return (
    <div className="flex h-screen bg-background-light">
      <Sidebar userProfile={userProfile} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar userProfile={userProfile} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}