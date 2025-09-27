import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import createSupabaseServerClient from '@/utils/supabase/server'; // ATUALIZADO

type UserProfile = {
  fullName: string | null;
  role: string | null;
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient(); // ATUALIZADO

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // Esta verificação agora funcionará corretamente
    redirect('/login'); 
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', session.user.id)
    .single();

  const { data: orgMemberData } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', session.user.id)
    .single();

  const userProfile: UserProfile = {
    fullName: profileData?.full_name || 'Usuário',
    role: orgMemberData?.role || 'Visitante',
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar userProfile={userProfile} />
      <main className="flex-1 p-8 bg-background-light">
        {children}
      </main>
    </div>
  );
}