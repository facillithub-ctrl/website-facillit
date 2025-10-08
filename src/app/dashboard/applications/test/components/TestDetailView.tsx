"use client";

import { useEffect, useState } from 'react';
import type { TestWithQuestions } from '../actions';

type Props = {
  test: TestWithQuestions;
  onBack: () => void;
  onStartTest: (testData: TestWithQuestions) => void; // NOVO
};

export default function TestDetailView({ test, onBack, onStartTest }: Props) {
  const [sanitizedQuestions, setSanitizedQuestions] = useState<{ id: string, statement: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sanitizeHtml = async () => {
      const DOMPurify = (await import('dompurify')).default;
      const sanitized = test.questions.map(q => ({
        id: q.id,
        statement: DOMPurify.sanitize(q.content.statement)
      }));
      setSanitizedQuestions(sanitized);
      setIsLoading(false);
    };
    sanitizeHtml();
  }, [test.questions]);


  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <button onClick={onBack} className="text-sm text-royal-blue hover:underline">
          <i className="fas fa-arrow-left mr-2"></i> Voltar para a lista
        </button>
      </div>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-dark-text dark:text-white">{test.title}</h1>
                <p className="text-text-muted mt-1">{test.description}</p>
            </div>
            {/* BOTÃO "INICIAR" ADICIONADO AQUI */}
            <button
                onClick={() => onStartTest(test)}
                className="bg-royal-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-transform hover:scale-105 flex-shrink-0 ml-4"
            >
                Iniciar Simulado
            </button>
        </div>
        <hr className="my-6 dark:border-gray-700" />
        
        <h2 className="text-xl font-bold mb-4">Questões</h2>
        <div className="space-y-6">
          {isLoading ? (
            <p className="text-text-muted">Processando questões...</p>
          ) : test.questions.length > 0 ? test.questions.map((q, index) => {
            const sanitizedQuestion = sanitizedQuestions.find(sq => sq.id === q.id);
            return (
              <div key={q.id} className="p-4 border rounded-lg dark:border-gray-700">
                <p className="font-bold mb-2">Questão {index + 1}</p>
                {sanitizedQuestion && (
                  <div 
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizedQuestion.statement }} 
                  />
                )}
                
                {q.question_type === 'multiple_choice' && (
                  <div className="mt-4 space-y-2">
                    {(q.content.options || []).map((option, optIndex) => (
                      <div 
                        key={optIndex}
                        className={`p-2 border rounded-md ${q.content.correct_option === optIndex ? 'bg-green-100 dark:bg-green-900/50 border-green-500' : 'dark:border-gray-600'}`}
                      >
                        <span className="font-mono mr-2">{String.fromCharCode(65 + optIndex)})</span>
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }) : (
            <p className="text-gray-500">Nenhuma questão foi adicionada a esta avaliação.</p>
          )}
        </div>
      </div>
    </div>
  );
}