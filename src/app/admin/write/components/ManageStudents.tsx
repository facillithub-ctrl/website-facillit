type Student = { id: string; full_name: string | null; user_category: string | null; created_at: string | null; };

export default function ManageStudents({ students }: { students: Student[] }) {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Gerenciar Alunos</h2>
            <p className="text-sm text-gray-500 mb-4">Total de Alunos e Vestibulandos: {students.length}</p>
            <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow max-h-96 overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nome</th>
                            <th scope="col" className="px-6 py-3">Tipo</th>
                            <th scope="col" className="px-6 py-3">Data de Criação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(s => (
                            <tr key={s.id} className="bg-white border-b dark:bg-dark-card dark:border-gray-700">
                                <td className="px-6 py-4 font-medium">{s.full_name}</td>
                                <td className="px-6 py-4 capitalize">{s.user_category}</td>
                                <td className="px-6 py-4">{s.created_at ? new Date(s.created_at).toLocaleDateString() : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}