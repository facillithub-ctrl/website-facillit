"use client";

import { useState, useEffect } from 'react';

export default function DevelopmentWarningPopup() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasSeenPopup = sessionStorage.getItem('hasSeenDevelopmentPopup');
        if (!hasSeenPopup) {
            setIsVisible(true);
        }
    }, []);

    const handleClose = () => {
        sessionStorage.setItem('hasSeenDevelopmentPopup', 'true');
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-xl max-w-md w-full mx-4 text-center">
                <div className="text-yellow-500 text-4xl mb-4">
                    <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h2 className="text-xl font-bold text-dark-text dark:text-white-text mb-2">Atenção</h2>
                <p className="text-text-muted dark:text-dark-text-muted mb-6">
                    Esta plataforma está em desenvolvimento. Alguns bugs ou erros podem acontecer. Se encontrar algum, por favor, envie um feedback.
                </p>
                <button
                    onClick={handleClose}
                    className="bg-royal-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90"
                >
                    Entendi
                </button>
            </div>
        </div>
    );
}