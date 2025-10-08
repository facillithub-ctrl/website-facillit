"use client";

import type { Test } from '../actions';

type Props = {
  initialTests: Test[];
};

export default function StudentTestDashboard({ initialTests }: Props) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text dark:text-white">Simulados e Provas</h1>
      <p className="text-text-muted dark:text-gray-400 mb-6">Teste seus conhecimentos e acompanhe seu desempenho.</p>
      
      <div className="p-8 text-center border-2 border-dashed rounded-lg bg-white dark:bg-dark-card">
          <h2 className="text-xl font-bold mb-2">Em Breve: Biblioteca de Avaliações</h2>
          <p className="text-sm text-gray-500">
              Esta área está em desenvolvimento. Logo você poderá realizar simulados, quizzes e provas diretamente por aqui e receber análises detalhadas do seu desempenho.
          </p>
      </div>
    </div>
  );
}