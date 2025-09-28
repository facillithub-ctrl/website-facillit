"use client";
// Este é um placeholder para a interface de correção.
// A lógica completa de salvar a correção precisaria de uma nova Server Action.

export default function CorrectionInterface({ essayId, onBack }: { essayId: string, onBack: () => void }) {

  // Futuramente, aqui você faria um fetch dos detalhes da redação com base no essayId

  return (
    <div>
        <button onClick={onBack} className="mb-4 text-sm text-royal-blue font-bold">
            <i className="fas fa-arrow-left mr-2"></i> Voltar para a fila
        </button>
        <h1 className="text-2xl font-bold mb-4">Corrigir Redação</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Coluna da Redação */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="font-bold text-xl mb-4">Título da Redação</h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    Conteúdo da redação do aluno viria aqui...
                </p>
            </div>
            {/* Coluna de Feedback */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="font-bold text-xl mb-4">Painel de Correção</h2>
                <form className="space-y-4">
                    {/* Campos para as 5 competências do ENEM */}
                    <div>
                        <label className="block font-medium">Competência 1: Domínio da norma culta</label>
                        <input type="number" max="200" min="0" className="w-full p-2 border rounded-md" />
                    </div>
                     <div>
                        <label className="block font-medium">Competência 2: Compreensão do tema</label>
                        <input type="number" max="200" min="0" className="w-full p-2 border rounded-md" />
                    </div>
                    {/* ... (repetir para C3, C4, C5) ... */}
                     <div>
                        <label className="block font-medium">Feedback Geral</label>
                        <textarea rows={5} className="w-full p-2 border rounded-md"></textarea>
                    </div>
                    <button type="submit" className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">
                        Enviar Correção
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
}