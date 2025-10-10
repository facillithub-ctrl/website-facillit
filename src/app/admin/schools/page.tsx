import { redirect } from 'next/navigation';
import createSupabaseServerClient from '@/utils/supabase/server';
import { getAllOrganizations } from '../actions';
// ✅ CORREÇÃO: A importação deve ser padrão e apontar para o local correto.
import ManageOrganizations from './components/ManageOrganizations';

export default async function AdminManageSchoolsPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('user_category')
        .eq('id', user.id)
        .single();

    if (profile?.user_category !== 'administrator') {
        return redirect('/dashboard');
    }

    const { data: organizations, error } = await getAllOrganizations();

    if (error) {
        return <div className="p-8 text-red-500">Erro ao carregar instituições: {error}</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 text-dark-text dark:text-white">Gerenciar Instituições</h1>
            <ManageOrganizations initialOrganizations={organizations || []} />
        </div>
    );
}