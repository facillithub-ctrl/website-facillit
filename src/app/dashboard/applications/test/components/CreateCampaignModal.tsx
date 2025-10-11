"use client";

import { useState, useTransition } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { createCampaign } from '../actions';
import type { Test } from '../actions';

type Props = {
  tests: Test[];
  onClose: () => void;
  onCampaignCreated: () => void;
};

export default function CreateCampaignModal({ tests, onClose, onCampaignCreated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

  const handleTestSelection = (testId: string) => {
    setSelectedTests(prev =>
      prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(startDate) >= new Date(endDate)) {
      addToast({ title: "Datas Inválidas", message: "A data de término deve ser posterior à data de início.", type: "error" });
      return;
    }

    startTransition(async () => {
      const result = await createCampaign({
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        test_ids: selectedTests,
      });

      if (result.error) {
        addToast({ title: "Erro ao Criar", message: result.error, type: "error" });
      } else {
        addToast({ title: "Sucesso!", message: "Campanha criada com sucesso.", type: "success" });
        onCampaignCreated();
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-4 border-b dark:border-gray-700">
            <h3 className="text-lg font-bold">Nova Campanha de Simulados</h3>
          </div>
          <div className="p-6 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium mb-1">Nome da Campanha</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Data de Início</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data de Término</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Selecione os Simulados</h4>
              <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-2 dark:border-gray-600">
                {tests.map(test => (
                  <label key={test.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedTests.includes(test.id)}
                      onChange={() => handleTestSelection(test.id)}
                      className="h-4 w-4 rounded border-gray-300 text-royal-blue focus:ring-royal-blue"
                    />
                    <span>{test.title}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-2 mt-auto">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
            <button type="submit" disabled={isPending} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400">
              {isPending ? 'Criando...' : 'Criar Campanha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}