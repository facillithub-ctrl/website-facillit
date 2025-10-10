import createSupabaseServerClient from "@/utils/supabase/server";
import { redirect } from 'next/navigation';
import ManageSchools from "./components/ManageSchools";
import { getOrganizationData, getUnassignedUsers } from "../actions";
import { UserProfile } from "@/app/dashboard/types";

export default async function ManageSchoolsPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, user_category')
        .eq('id', user.id)
        .single();

    // Redireciona se o utilizador não for um diretor.
    if (profile?.user_category !== 'diretor') {
        return redirect('/dashboard');
    }

    // Mostra uma mensagem se o diretor não estiver ligado a nenhuma escola.
    if (!profile.organization_id) {
        return (
            <div className="p-4 md:p-8">
                <h1 className="text-2xl font-bold mb-4">Nenhuma Instituição Encontrada</h1>
                <p>Para aceder a esta página, o seu perfil de gestor precisa de estar associado a uma instituição.</p>
            </div>
        );
    }
    
    // Busca os dados completos da organização (escola, turmas, membros).
    const organizationData = await getOrganizationData(profile.organization_id);
    
    // Busca os utilizadores da organização que ainda não pertencem a nenhuma turma.
    const unassignedUsers: UserProfile[] = await getUnassignedUsers(profile.organization_id);

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Gestão da Instituição</h1>
            {organizationData ? (
                <ManageSchools 
                    organization={organizationData.organization}
                    classes={organizationData.classes}
                    members={organizationData.members}
                    unassignedUsers={unassignedUsers}
                />
            ) : (
                <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow">
                    <p>Não foi possível carregar os dados da instituição.</p>
                </div>
            )}
        </div>
    );
}