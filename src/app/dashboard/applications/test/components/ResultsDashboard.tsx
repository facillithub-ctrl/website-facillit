"use client";

import { useState } from 'react';

const ResultsDashboard = () => {
  const [results, setResults] = useState([
    { id: 1, student: 'João Silva', test: 'Simulado ENEM - Humanas', score: 85, date: '2024-10-25' },
    { id: 2, student: 'Maria Oliveira', test: 'Simulado ENEM - Humanas', score: 92, date: '2024-10-25' },
    { id: 3, student: 'Carlos Souza', test: 'Simulado FUVEST - Exatas', score: 78, date: '2024-10-24' },
  ]);

  return (
    <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-dark-text dark:text-white">Resultados dos Alunos</h2>
      <div className="max-h-96 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3">Aluno</th>
              <th scope="col" className="px-6 py-3">Avaliação</th>
              <th scope="col" className="px-6 py-3">Pontuação</th>
              <th scope="col" className="px-6 py-3">Data</th>
              <th scope="col" className="px-6 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.id} className="border-b dark:border-gray-700">
                <td className="px-6 py-4 font-medium text-dark-text dark:text-white">{result.student}</td>
                <td className="px-6 py-4">{result.test}</td>
                <td className="px-6 py-4">{result.score}%</td>
                <td className="px-6 py-4">{new Date(result.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <button className="text-blue-500 hover:underline">Ver Detalhes</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsDashboard;