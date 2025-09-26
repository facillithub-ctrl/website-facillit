"use client";

import { useState } from 'react';

export default function ContactCTA() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aqui você integraria com um serviço de e-mail ou backend.
    // Por enquanto, vamos apenas simular o envio.
    console.log("Formulário enviado!");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="py-20 bg-gray-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <i className="fas fa-check-circle text-5xl text-green-400 mb-4"></i>
            <h2 className="text-3xl font-bold mb-2">Obrigado!</h2>
            <p className="text-lg">Sua mensagem foi enviada com sucesso. Entraremos em contato em breve.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-800 text-white">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Envie sua dúvida ou fale conosco</h2>
          <p className="text-gray-300 mb-8">
            Ficou com alguma pergunta sobre este módulo? Preencha o formulário abaixo e nossa equipe responderá o mais rápido possível.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="sr-only">Seu Nome</label>
              <input type="text" name="name" id="name" required placeholder="Seu Nome" className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:ring-royal-blue focus:border-royal-blue" />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">Seu E-mail</label>
              <input type="email" name="email" id="email" required placeholder="Seu E-mail" className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:ring-royal-blue focus:border-royal-blue" />
            </div>
          </div>
          <div>
            <label htmlFor="message" className="sr-only">Sua Mensagem</label>
            <textarea name="message" id="message" rows={4} required placeholder="Sua Mensagem" className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:ring-royal-blue focus:border-royal-blue"></textarea>
          </div>
          <div className="text-center">
            <button type="submit" className="inline-block bg-royal-blue text-white py-3 px-10 rounded-full font-bold text-lg transition-transform duration-300 hover:scale-105">
              Enviar Mensagem
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}