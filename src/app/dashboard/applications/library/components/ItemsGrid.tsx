// src/app/dashboard/applications/library/components/ItemsGrid.tsx
'use client';

import { LibraryItem, UserRole } from '@/app/dashboard/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ItemsGridProps {
  items: LibraryItem[];
  userRole: UserRole;
  onEdit: (item: LibraryItem) => void;
  onDelete: (itemId: string) => void;
  emptyStateMessage: string;
}

export function ItemsGrid({ items, userRole, onEdit, onDelete, emptyStateMessage }: ItemsGridProps) {
  const isTeacherOrAdmin = userRole === 'teacher' || userRole === 'admin';

  if (items.length === 0) {
    return <p className="mt-6">{emptyStateMessage}</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-card/60 dark:bg-card/40 backdrop-blur-lg border border-border/20 shadow-lg rounded-lg p-4 flex flex-col group"
        >
          <Link href={`/dashboard/applications/library/${item.id}`} className="flex-grow">
            <img
              src={item.cover_url || '/assets/images/marcas/library.png'}
              alt={item.title}
              className="w-full h-48 object-cover rounded-md mb-4 transform transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex-grow">
              <h3 className="font-bold text-lg">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.author}</p>
            </div>
          </Link>
          {isTeacherOrAdmin && (
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(item)}
              >
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(item.id)}
              >
                Apagar
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}