import { getOrganizationsForAdmin } from '../actions';
import ManageSchools from './components/ManageSchools';
import { Suspense } from 'react';

export default async function AdminSchoolsPage() {
    const { data: organizations, error } = await getOrganizationsForAdmin();

    if (error) {
        return <div className="text-red-500 p-4">Erro ao carregar os dados das instituições: {error}</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 text-dark-text dark:text-white">Gerenciar Instituições</h1>
            <Suspense fallback={<p className="text-center p-4">A carregar escolas...</p>}>
                <ManageSchools initialOrganizations={organizations || []} />
            </Suspense>
        </div>
    );
}