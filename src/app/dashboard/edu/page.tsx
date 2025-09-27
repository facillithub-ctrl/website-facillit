import Link from 'next/link';
import createSupabaseServerClient from '@/utils/supabase/server'; // ATUALIZADO

export default async function EduDashboardPage() {
    const supabase = createSupabaseServerClient(); // ATUALIZADO
    
    const { data: { session } } = await supabase.auth.getSession();

    const { data: classes, error } = await supabase
        .from('school_classes')
        .select(`
            id,
            name,
            subjects ( name ),
            enrollments ( count )
        `)
        .eq('teacher_id', session?.user.id);

    if (error) {
        console.error("Erro ao buscar turmas:", error);
        return <p className="text-red-500">Ocorreu um erro ao carregar suas turmas.</p>;
    }

    return (
        // ... O resto do seu JSX continua exatamente o mesmo
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Módulo Edu</h1>
                <button className="bg-royal-blue text-white py-2 px-5 rounded-lg font-bold hover:bg-opacity-90 transition">
                    <i className="fas fa-plus mr-2"></i>Criar Nova Turma
                </button>
            </div>
            {classes && classes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map((classItem: any) => (
                        <Link key={classItem.id} href={`/dashboard/edu/turma/${classItem.id}`} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all block">
                            <h2 className="text-xl font-bold text-dark-text">{classItem.name}</h2>
                            <p className="text-text-muted mb-4">{classItem.subjects?.name || 'Disciplina não definida'}</p>
                            <div className="flex items-center text-sm text-text-muted">
                                <i className="fas fa-users mr-2"></i>
                                <span>{classItem.enrollments[0]?.count || 0} Alunos</span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <i className="fas fa-chalkboard-teacher text-5xl text-gray-300 mb-4"></i>
                    <h2 className="text-xl font-bold text-dark-text">Nenhuma turma encontrada</h2>
                    <p className="text-text-muted">Parece que você ainda não tem nenhuma turma. Que tal criar a primeira?</p>
                </div>
            )}
        </div>
    );
}