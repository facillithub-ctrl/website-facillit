"use client";

import { useState } from 'react';
import Link from 'next/link';

// Dados dos módulos para facilitar a renderização
const modulesData = [
  { icon: 'fa-graduation-cap', title: 'Facillit Edu', frontText: 'Gestão pedagógica e de alunos.', backText: 'Plataforma completa para instituições de ensino, alinhada à BNCC.', link: '#' },
  { icon: 'fa-gamepad', title: 'Facillit Games', frontText: 'Aprenda de forma divertida.', backText: 'Inovação pedagógica através da gamificação. Transforme o aprendizado em uma aventura.', link: '#' },
  { icon: 'fa-pencil-alt', title: 'Facillit Write', frontText: 'Escrita com IA e tutores.', backText: 'Receba feedback instantâneo de IA e análises detalhadas de tutores.', link: '#' },
  { icon: 'fa-calendar-check', title: 'Facillit Day', frontText: 'Agenda, tarefas e hábitos.', backText: 'O assistente pessoal inteligente que centraliza sua rotina para máxima produtividade.', link: '#' },
  // Adicione os outros 8 módulos aqui...
];

// Sub-componente para o card
const ModuleCard = ({ icon, title, frontText, backText, link }: typeof modulesData[0]) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="module-card h-64 cursor-pointer [perspective:1000px]" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`module-card-inner relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        {/* Frente do Card */}
        <div className="module-card-front absolute w-full h-full bg-white border border-gray-200 rounded-2xl flex flex-col justify-center items-center p-4 text-center [backface-visibility:hidden]">
          <i className={`fas ${icon} text-4xl text-royal-blue mb-4`}></i>
          <h3 className="text-xl font-bold text-dark-text">{title}</h3>
          <p className="text-text-muted">{frontText}</p>
        </div>
        {/* Verso do Card */}
        <div className="module-card-back absolute w-full h-full bg-royal-blue text-white border border-gray-200 rounded-2xl flex flex-col justify-center items-center p-6 text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <h4 className="text-xl font-bold mb-2">{title}</h4>
          <p className="text-sm opacity-90 mb-4">{backText}</p>
          <Link href={link} className="mt-auto bg-white/20 px-4 py-2 rounded-full text-xs font-bold hover:bg-white/30" onClick={(e) => e.stopPropagation()}>
            Saber mais <i className="fas fa-arrow-right ml-1"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function Modules() {
  return (
    <section className="section bg-background-light py-20 lg:py-24" id="modules">
      <div className="container mx-auto px-6 text-center">
        <h2 className="section-title text-3xl md:text-4xl font-bold text-dark-text mb-4">Conheça Nossos Módulos</h2>
        <p className="section-subtitle max-w-2xl mx-auto text-text-muted mb-16">
          Uma solução completa para cada necessidade. Clique em um módulo para saber mais.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {modulesData.map(module => (
            <ModuleCard key={module.title} {...module} />
          ))}
        </div>
      </div>
    </section>
  );
}