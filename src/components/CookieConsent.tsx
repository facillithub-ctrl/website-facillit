"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleConsent = (consent: boolean) => {
        localStorage.setItem('cookie_consent', consent.toString());
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-dark-text text-white p-4 z-50 flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
            <p className="text-sm">
                Nós usamos cookies para melhorar sua experiência em nosso site. Ao continuar, você concorda com nosso uso de cookies. Saiba mais em nossa <Link href="/recursos/privacidade" className="font-bold underline">Política de Privacidade</Link>.
            </p>
            <div className="flex gap-2 flex-shrink-0">
                <button
                    onClick={() => handleConsent(false)}
                    className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-6 rounded-lg font-bold text-sm"
                >
                    Rejeitar
                </button>
                <button
                    onClick={() => handleConsent(true)}
                    className="bg-royal-blue hover:bg-opacity-90 text-white py-2 px-6 rounded-lg font-bold text-sm"
                >
                    Aceitar
                </button>
            </div>
        </div>
    );
}