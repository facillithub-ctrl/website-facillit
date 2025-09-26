"use client";

import { useEffect } from 'react';

export default function Faq() {
  useEffect(() => {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        if (question && answer) {
          question.addEventListener('click', () => {
              const isExpanded = question.getAttribute('aria-expanded') === 'true';
              question.setAttribute('aria-expanded', String(!isExpanded));
              answer.style.maxHeight = isExpanded ? null : `${answer.scrollHeight}px`;
          });
        }
    });
  }, []);

  return (
    <section className="section" id="faq">
      <div className="container">
        <h2 className="section-title">Perguntas Frequentes</h2>
        <div className="faq-container">
          {/* Adapte o HTML do seu FAQ aqui */}
          <div className="faq-item">
            <button className="faq-question" aria-expanded="false"><span>O Facillit Hub é gratuito?</span><i className="fas fa-chevron-down"></i></button>
            <div className="faq-answer"><p>Oferecemos um plano gratuito com acesso a funcionalidades essenciais...</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}