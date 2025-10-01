"use client";

import { useState } from 'react';
import CorrectionInterface from './CorrectionInterface';

// O tipo foi ajustado para refletir que 'profiles' é um objeto, não um array.
type PendingEssay = {
  id: string;
  title: string | null;
  submitted_at: string | null;
  profiles: { full_name: string | null; } | null;
};

export default function TeacherDashboard({ pendingEssays }: { pendingEssays: PendingEssay[] }) {
  const [selectedEssayId, setSelectedEssayId] = useState<string | null>(null);

  if (selectedEssayId) {
    return <CorrectionInterface essayId={selectedEssayId} onBack={() => setSelectedEssayId(null)} />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text dark:text-white-text mb-6">Fila de Correção</h1>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md border dark:border-dark-border p-4">
        <ul className="divide-y dark:divide-dark-border">
          {pendingEssays.length > 0 ? pendingEssays.map(essay => (
            <li key={essay.id} onClick={() => setSelectedEssayId(essay.id)} className="p-4 hover:bg-gray-50 dark:hover:bg-dark-card/50 cursor-pointer">
              <p className="font-bold text-dark-text dark:text-white-text">{essay.title || "Redação sem título"}</p>
              <p className="text-sm text-gray-500 dark:text-dark-text-muted">
                Enviada por {essay.profiles?.full_name || 'Aluno desconhecido'} em {new Date(essay.submitted_at!).toLocaleDateString()}
              </p>
            </li>
          )) : (
            <p className="p-4 text-center text-gray-500 dark:text-dark-text-muted">Nenhuma redação aguardando correção no momento.</p>
          )}
        </ul>
      </div>
    </div>
  );
}