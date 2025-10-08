"use client";

import { useState } from 'react';
import CreateTestModal from './CreateTestModal'; // Importa o novo modal

export default function TeacherTestDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      {/* O modal será exibido quando isModalOpen for true */}
      {isModalOpen && <CreateTestModal onClose={() => setIsModalOpen(false)} />}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dark-text dark:text-white">Gerenciador de Avaliações</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90"
        >
          <i className="fas fa-plus mr-2"></i> Nova Avaliação
        </button>
      </div>
      
      <p className="text-text-muted dark:text-gray-400 mb-6">Crie, atribua e analise o desempenho de suas turmas.</p>
      
      <div className="p-8 text-center border-2 border-dashed rounded-lg bg-white dark:bg-dark-card">
          <h2 className="text-xl font-bold mb-2">Minhas Avaliações</h2>
          <p className="text-sm text-gray-500">
              Esta área está em desenvolvimento. As avaliações que você criar aparecerão listadas aqui.
          </p>
      </div>
    </div>
  );
}