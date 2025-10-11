"use client";

import { useState, useEffect } from 'react';
import { getCampaignsForTeacher, getTestsForTeacher, Campaign, Test } from '../actions';
import CreateCampaignModal from './CreateCampaignModal';
import { useToast } from '@/contexts/ToastContext';

const CampaignManager = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const { data, error } = await getCampaignsForTeacher();
    if (error) {
      addToast({ title: "Erro", message: "Não foi possível carregar as campanhas.", type: "error" });
    } else {
      setCampaigns(data || []);
    }
    setIsLoading(false);
  };
  
  const fetchTests = async () => {
      const { data, error } = await getTestsForTeacher();
      if(error) {
          addToast({ title: "Erro", message: "Não foi possível carregar suas avaliações para criar campanhas.", type: "error" });
      } else {
          setTests(data || []);
      }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchTests();
  }, []);

  const getStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now < start) return { text: 'Agendada', color: 'bg-blue-100 text-blue-800' };
    if (now > end) return { text: 'Concluída', color: 'bg-gray-200 text-gray-800' };
    return { text: 'Ativa', color: 'bg-green-100 text-green-800' };
  };

  return (
    <>
    {isModalOpen && (
        <CreateCampaignModal 
            tests={tests}
            onClose={() => setIsModalOpen(false)}
            onCampaignCreated={fetchCampaigns}
        />
    )}
    <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-dark-text dark:text-white">Gerenciar Campanhas</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">
          <i className="fas fa-plus mr-2"></i> Nova Campanha
        </button>
      </div>

      {isLoading ? <p>Carregando campanhas...</p> : (
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
              <tr>
                <th scope="col" className="px-6 py-3">Nome da Campanha</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Período</th>
                <th scope="col" className="px-6 py-3">Nº de Testes</th>
                <th scope="col" className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => {
                const status = getStatus(campaign.start_date, campaign.end_date);
                return (
                  <tr key={campaign.id} className="border-b dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-dark-text dark:text-white">{campaign.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                        {new Date(campaign.start_date).toLocaleDateString('pt-BR')} - {new Date(campaign.end_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">{campaign.campaign_tests.length}</td>
                    <td className="px-6 py-4">
                      <button className="text-blue-500 hover:underline">Detalhes</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </>
  );
};

export default CampaignManager;