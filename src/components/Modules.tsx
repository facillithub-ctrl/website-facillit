"use client";

import { useState } from 'react';
import Link from 'next/link';

// Dados completos dos 12 módulos
const modulesData = [
  { icon: 'fa-graduation-cap', title: 'Facillit Edu', frontText: 'Gestão pedagógica e de alunos.', backText: 'Plataforma completa para instituições de ensino, alinhada à BNCC.' },
  { icon: 'fa-gamepad', title: 'Facillit Games', frontText: 'Aprenda de forma divertida.', backText: 'Inovação pedagógica através da gamificação adaptativa.' },
  { icon: 'fa-pencil-alt', title: 'Facillit Write', frontText: 'Escrita com IA e tutores.', backText: 'Produção textual com correção híbrida de IA e tutores humanos.' },
  { icon: 'fa-calendar-check', title: 'Facillit Day', frontText: 'Agenda, tarefas e hábitos.', backText: 'Assistente pessoal inteligente que centraliza sua rotina para máxima produtividade.' },
  { icon: 'fa-play-circle', title: 'Facillit Play', frontText: 'Streaming educacional.', backText: 'Serviço de streaming focado em educação, com videoaulas, documentários e eventos.' },
  { icon: 'fa-book-open', title: 'Facillit Library', frontText: 'Biblioteca e portfólios.', backText: 'Biblioteca digital e plataforma para escrita criativa e portfólios digitais.' },
  { icon: 'fa-users', title: 'Facillit Connect', frontText: 'Rede social de estudos.', backText: 'Rede social para criar comunidades de estudo e conectar alunos e professores.' },
  { icon: 'fa-bullseye', title: 'Facillit Coach & Career', frontText: 'Soft skills e carreira.', backText: 'Desenvolvimento de soft skills e orientação vocacional para conectar a oportunidades.' },
  { icon: 'fa-flask', title: 'Facillit Lab', frontText: 'Laboratório virtual.', backText: 'Simulações e ambientes 3D para o aprendizado prático de STEM.' },
  { icon: 'fa-file-alt', title: 'Facillit Test', frontText: 'Simulados, quizzes e provas.', backText: 'Crie e realize simulados com análises de desempenho detalhadas.' },
  { icon: 'fa-tasks', title: 'Facillit Task', frontText: 'Gestão de tarefas gerais.', backText: 'Plataforma de gestão de tarefas que vai além dos estudos, incluindo treino e pets.' },
  { icon: 'fa-lightbulb', title: 'Facillit Create', frontText: 'Mapas mentais e gráficos.', backText: 'Ferramentas para criação de materiais visuais como infográficos e mapas mentais.' },
];

const ModuleCard = ({ icon, title, frontText, backText }: typeof modulesData[0]) => {
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
          <Link href="#" className="mt-auto bg-white/20 px-4 py-2 rounded-full text-xs font-bold hover:bg-white/30" onClick={(e) => e.stopPropagation()}>
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
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {modulesData.map(module => (
            <ModuleCard key={module.title} {...module} />
          ))}
        </div>
      </div>
    </section>
  );
}