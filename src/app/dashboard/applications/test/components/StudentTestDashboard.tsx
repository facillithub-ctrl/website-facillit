"use client";

import { useState } from 'react';
import type { Test } from '../actions';

// Ajustamos o tipo para incluir o nome do professor que vem da query
type TestListItem = Test & {
  profiles: { full_name: string | null; } | null;
};

type Props = {
  initialTests: TestListItem[];
};

export default function StudentTestDashboard({ initialTests }: Props) {
  const [tests] = useState(initialTests);
  const [selectedTest, setSelectedTest] = useState<TestListItem | null>(null);

  // Esta é uma view de detalhe SIMPLIFICADA.
  // O ideal seria criar uma view completa para o aluno RESPONDER o teste.
  if (selectedTest) {
    return (
        <div>
            <button onClick={() => setSelectedTest(null)} className="text-sm text-royal-blue font-bold mb-4">
                <i className="fas fa-arrow-left mr-2"></i> Voltar para a lista
            </button>
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold">{selectedTest.title}</h2>
                <p className="text-text-muted mt-1">{selectedTest.description}</p>
                <p className="text-xs text-gray-500 mt-4">
                  Criado por: {selectedTest.profiles?.full_name ?? 'Professor desconhecido'}
                </p>
                 <button className="mt-6 bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">
                    Começar Simulado (Função em breve)
                </button>
            </div>
        </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text dark:text-white">Simulados e Provas</h1>
      <p className="text-text-muted dark:text-gray-400 mb-6">Teste seus conhecimentos e acompanhe seu desempenho.</p>
      
      <div className="bg-white dark:bg-dark-card rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4 px-2 text-dark-text dark:text-white">Simulados Disponíveis</h2>
        <ul className="divide-y dark:divide-gray-700">
          {tests.length > 0 ? tests.map(test => (
            <li 
              key={test.id}
              onClick={() => setSelectedTest(test)}
              className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              <div>
                <p className="font-bold text-dark-text dark:text-white">{test.title}</p>
                <p className="text-sm text-gray-500">
                  Criado por {test.profiles?.full_name ?? 'Professor desconhecido'} em {new Date(test.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <i className="fas fa-chevron-right text-gray-400"></i>
            </li>
          )) : (
            <div className="p-8 text-center border-2 border-dashed rounded-lg">
                <h2 className="text-xl font-bold mb-2">Nenhum simulado público</h2>
                <p className="text-sm text-gray-500">
                    Ainda não há simulados disponíveis para você. Volte mais tarde!
                </p>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}