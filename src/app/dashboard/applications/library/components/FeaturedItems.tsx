// src/app/dashboard/applications/library/components/FeaturedItems.tsx

// GARANTA QUE A LINHA "use client"; NÃO ESTÁ AQUI EM CIMA

import { getFeaturedItems } from '../actions';
import Link from 'next/link';

// Este é um Server Component e pode ser assíncrono
export async function FeaturedItems() {
  const featuredItems = await getFeaturedItems();

  if (!featuredItems || featuredItems.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Obras em Destaque</h2>
      <div className="grid grid-flow-col auto-cols-[260px] gap-6 overflow-x-auto pb-4">
        {featuredItems.map((item) => (
          <Link href={`/dashboard/applications/library/${item.id}`} key={item.id}>
            <div className="group relative w-full h-full rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105">
              <img
                src={item.cover_url || '/assets/images/marcas/library.png'}
                alt={`Capa de ${item.title}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="font-bold text-white text-lg">{item.title}</h3>
                <p className="text-sm text-white/80">{item.author}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}