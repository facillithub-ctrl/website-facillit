import { redirect } from 'next/navigation';
import Link from 'next/link';
import createSupabaseServerClient from '@/utils/supabase/server';
import { UserProfile } from '@/app/dashboard/types';
import DashboardClientLayout from '@/app/dashboard/DashboardClientLayout';

// Lista dos módulos de administração
const adminModules = [
    { name: 'Write', href: '/admin/write', icon: 'fa-pencil-alt' },
    { name: 'Task', href: '/admin/task', icon: 'fa-tasks' },
    { name: 'Test', href: '/admin/test', icon: 'fa-file-alt' },
    { name: 'Games', href: '/admin/games', icon: 'fa-gamepad', disabled: true },
    // Adicione outros módulos aqui conforme necessário
];

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

  // Validação de segurança: redireciona se não for administrador
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

  return (
    <DashboardClientLayout userProfile={userProfile}>
        <div className="flex">
            <aside className="w-64 bg-white dark:bg-dark-card p-4 border-r dark:border-dark-border flex-shrink-0">
                <h2 className="text-lg font-bold mb-4 px-2">Admin Módulos</h2>
                <nav>
                    <ul>
                        {adminModules.map(mod => (
                            <li key={mod.href}>
                                <Link href={mod.href} className={`flex items-center gap-3 px-3 py-2 rounded-md ${mod.disabled ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                    <i className={`fas ${mod.icon} w-5 text-center`}></i>
                                    <span>{mod.name}</span>
                                    {mod.disabled && <span className="text-xs ml-auto bg-gray-200 dark:bg-gray-600 px-2 rounded-full">Breve</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            <main className="flex-1 p-6">
                {children}
            </main>
        </div>
    </DashboardClientLayout>
  );
}