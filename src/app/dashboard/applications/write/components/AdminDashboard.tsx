"use client";

import { useState, useTransition } from 'react';
import { updateProfessorVerification } from '../actions';

// CORREÇÃO: Tipos atualizados sem a propriedade 'email'
type Student = { id: string; full_name: string | null; user_category: string | null; created_at: string | null; };
type Professor = { id: string; full_name: string | null; is_verified: boolean | null; created_at: string | null; };
type Prompt = { id: string; title: string; description: string; };
type CurrentEvent = { id: string; title: string; summary: string; };
type ExamDate = { id: string; name: string; exam_date: string; };

type AdminDashboardProps = {
  initialData: {
    students: Student[] | null;
    professors: Professor[] | null;
    prompts: Prompt[] | null;
    currentEvents: CurrentEvent[] | null;
    examDates: ExamDate[] | null;
  };
};

export default function AdminDashboard({ initialData }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('students');
  const [isPending, startTransition] = useTransition();
  
  const [professors, setProfessors] = useState(initialData.professors || []);

  const handleToggleVerify = (professorId: string, currentStatus: boolean) => {
    startTransition(async () => {
      setProfessors(profs => profs.map(p => p.id === professorId ? { ...p, is_verified: !currentStatus } : p));
      
      const result = await updateProfessorVerification(professorId, !currentStatus);

      if (result.error) {
        setProfessors(profs => profs.map(p => p.id === professorId ? { ...p, is_verified: currentStatus } : p));
        alert(`Erro ao atualizar professor: ${result.error}`);
      }
    });
  };

  const renderStudents = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gerenciar Alunos</h2>
      <p className="text-sm text-gray-500 mb-4">Total de Alunos e Vestibulandos: {initialData.students?.length ?? 0}</p>
      <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow max-h-96 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            {/* CORREÇÃO: Removida a coluna 'Email' */}
            <tr><th scope="col" className="px-6 py-3">Nome</th><th scope="col" className="px-6 py-3">Tipo</th><th scope="col" className="px-6 py-3">Data de Criação</th></tr>
          </thead>
          <tbody>
            {initialData.students?.map(s => (
              <tr key={s.id} className="bg-white border-b dark:bg-dark-card dark:border-gray-700">
                <td className="px-6 py-4 font-medium">{s.full_name}</td>
                <td className="px-6 py-4 capitalize">{s.user_category}</td>
                {/* CORREÇÃO: Removida a célula do email e adicionada data */}
                <td className="px-6 py-4">{s.created_at ? new Date(s.created_at).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProfessors = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gerenciar Professores</h2>
      <p className="text-sm text-gray-500 mb-4">Total de Professores: {professors.length}</p>
      <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow max-h-96 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
             {/* CORREÇÃO: Removida a coluna 'Email' */}
            <tr><th scope="col" className="px-6 py-3">Nome</th><th scope="col" className="px-6 py-3">Status</th><th scope="col" className="px-6 py-3">Ação</th></tr>
          </thead>
          <tbody>
            {professors.map(p => (
              <tr key={p.id} className="bg-white border-b dark:bg-dark-card dark:border-gray-700">
                <td className="px-6 py-4 font-medium">{p.full_name}</td>
                {/* CORREÇÃO: Removida a célula do email */}
                <td className="px-6 py-4">{p.is_verified ? <span className="text-green-500 font-bold">Verificado</span> : 'Não Verificado'}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleToggleVerify(p.id, !!p.is_verified)} disabled={isPending} className="font-medium text-blue-600 dark:text-blue-500 hover:underline disabled:opacity-50">
                    {p.is_verified ? 'Remover Verificação' : 'Verificar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  const renderPrompts = () => (
    <div>
        <h2 className="text-2xl font-bold mb-4">Gerenciar Temas de Redação</h2>
        <p className="text-sm text-gray-500 mb-4">Aqui você poderá criar, editar e excluir os temas disponíveis para os alunos.</p>
        <div className="p-8 text-center border-2 border-dashed rounded-lg">
            <p>Interface de gerenciamento de temas em desenvolvimento.</p>
        </div>
    </div>
  );

  const renderNews = () => (
    <div>
        <h2 className="text-2xl font-bold mb-4">Gerenciar Notícias Relevantes</h2>
        <p className="text-sm text-gray-500 mb-4">Adicione ou remova notícias que aparecem no dashboard dos alunos.</p>
         <div className="p-8 text-center border-2 border-dashed rounded-lg">
            <p>Interface de gerenciamento de notícias em desenvolvimento.</p>
        </div>
    </div>
  );

  const renderExams = () => (
    <div>
        <h2 className="text-2xl font-bold mb-4">Gerenciar Datas de Vestibulares</h2>
        <p className="text-sm text-gray-500 mb-4">Atualize as datas dos principais vestibulares que aparecem na contagem regressiva.</p>
         <div className="p-8 text-center border-2 border-dashed rounded-lg">
            <p>Interface de gerenciamento de vestibulares em desenvolvimento.</p>
        </div>
    </div>
  );

  const tabs = [
    { key: 'students', label: 'Alunos' },
    { key: 'professors', label: 'Professores' },
    { key: 'prompts', label: 'Temas' },
    { key: 'news', label: 'Notícias' },
    { key: 'exams', label: 'Vestibulares' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'students': return renderStudents();
      case 'professors': return renderProfessors();
      case 'prompts': return renderPrompts();
      case 'news': return renderNews();
      case 'exams': return renderExams();
      default: return renderStudents();
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text dark:text-white mb-6">Painel do Administrador</h1>
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4 -mb-px" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`${activeTab === tab.key ? 'border-royal-blue text-royal-blue' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div>
        {renderContent()}
      </div>
    </div>
  );
}