"use client";

// Placeholder para a futura dashboard do professor/instituição no módulo Test

export default function TeacherTestDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text dark:text-white">Gerenciador de Avaliações</h1>
      <p className="text-text-muted dark:text-gray-400 mb-6">Crie, atribua e analise o desempenho de suas turmas.</p>
      
      <div className="p-8 text-center border-2 border-dashed rounded-lg bg-white dark:bg-dark-card">
          <h2 className="text-xl font-bold mb-2">Em Breve: Criação e Gestão de Provas</h2>
          <p className="text-sm text-gray-500">
              Esta área está em desenvolvimento. Logo você poderá criar atividades, definir pontuações, gerenciar gabaritos e analisar os dados de desempenho de seus alunos.
          </p>
      </div>
    </div>
  );
}