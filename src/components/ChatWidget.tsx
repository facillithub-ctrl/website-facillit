"use client";

import { useState } from 'react';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Botão Flutuante */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-royal-blue text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-3xl transition-transform hover:scale-110"
                    aria-label="Abrir chat de suporte"
                >
                    <i className={`fas ${isOpen ? 'fa-times' : 'fa-comments'}`}></i>
                </button>
            </div>

            {/* Janela do Chat */}
            <div
                className={`fixed bottom-24 right-6 z-50 w-80 bg-white rounded-lg shadow-2xl transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
            >
                {/* Header do Chat */}
                <div className="bg-royal-blue text-white p-4 rounded-t-lg">
                    <h3 className="font-bold text-lg">Suporte Facillit Hub</h3>
                    <p className="text-sm opacity-80">Como podemos ajudar?</p>
                </div>

                {/* Corpo do Chat (Placeholder) */}
                <div className="p-4 h-64 overflow-y-auto">
                    <div className="flex mb-4">
                        <div className="bg-gray-200 p-3 rounded-lg max-w-[80%]">
                            <p className="text-sm">Olá! Bem-vindo(a) ao nosso suporte. Digite sua dúvida abaixo.</p>
                        </div>
                    </div>
                </div>

                {/* Input do Chat */}
                <div className="p-4 border-t border-gray-200">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Digite sua mensagem..."
                            className="w-full p-2 pr-10 border rounded-full"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-royal-blue text-xl">
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}