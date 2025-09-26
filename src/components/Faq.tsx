"use client";

import { useState } from 'react';

const faqData = [
    { question: 'O Facillit Hub é gratuito?', answer: 'Oferecemos um plano gratuito com acesso a funcionalidades essenciais para organização pessoal. Também temos planos Premium com recursos avançados para estudantes, profissionais e instituições.' },
    { question: 'Como funciona a integração entre os módulos?', answer: 'A mágica do Hub está na comunicação inteligente entre os módulos. Por exemplo, uma tarefa agendada no Facillit Edu pode aparecer automaticamente no seu Facillit Day, e o sistema pode sugerir uma videoaula do Facillit Play relacionada ao tema do seu próximo simulado no Facillit Test.' },
    { question: 'É seguro armazenar meus dados na plataforma?', answer: 'A segurança dos seus dados é nossa prioridade máxima. Utilizamos criptografia de ponta e seguimos as melhores práticas de segurança de dados para garantir que suas informações estejam sempre protegidas.' },
    { question: 'Para quem o Facillit Hub é destinado?', answer: 'Pessoas: Qualquer indivíduo que busca simplificar as complexidades da vida moderna. Instituições e Empresas: Escolas podem usar o Hub para integrar a gestão pedagógica e empresas podem utilizá-lo como uma ferramenta de produtividade corporativa.' },
    { question: 'Qual a diferença entre "Acesso Pessoal" e "Acesso Institucional"', answer: 'Acesso Institucional: Destinado a alunos e professores de uma escola parceira, com conta vinculada. Acesso Pessoal (Público): Qualquer pessoa pode criar uma conta, mesmo sem vínculo com uma instituição.' },
    { question: 'É possível personalizar a experiência na plataforma?', answer: 'Sim. Cada usuário pode personalizar os módulos para adicionar ou excluir funções conforme sua necessidade. Por exemplo, um usuário sem animal de estimação pode remover o widget de "gestão de pets" do Facillit Task.' },
];

const FaqItem = ({ item, isOpen, onClick }: { item: typeof faqData[0], isOpen: boolean, onClick: () => void }) => {
    return (
        <div className="border-b border-gray-200">
            <h2>
                <button
                    type="button"
                    className="flex justify-between items-center w-full py-5 font-medium text-left text-dark-text"
                    onClick={onClick}
                    aria-expanded={isOpen}
                >
                    <span className="text-lg">{item.question}</span>
                    <i className={`fas fa-chevron-down text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-royal-blue' : ''}`}></i>
                </button>
            </h2>
            <div
                className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="overflow-hidden">
                    <div className="pb-5 pt-1">
                        <p className="text-text-muted">{item.answer}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Faq() {
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

    const handleFaqClick = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    return (
        <section className="bg-white py-20 lg:py-24" id="faq">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-16">Perguntas Frequentes</h2>
                    <div className="space-y-4">
                        {faqData.map((item, index) => (
                            <FaqItem
                                key={index}
                                item={item}
                                isOpen={openFaqIndex === index}
                                onClick={() => handleFaqClick(index)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}