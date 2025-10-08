// src/app/dashboard/applications/library/LibraryClientPage.tsx
'use client';

import { useState } from 'react';
import { LibraryItem, Collection, UserRole } from '@/app/dashboard/types';
import { Button } from '@/components/ui/button';
import { deleteItem } from './actions';
import { useToast } from '@/contexts/ToastContext';
import { ManageItemModal } from './components/ManageItemModal';
import { ManageCollections } from './components/ManageCollections';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LibraryClientPageProps {
  userRole: UserRole;
  initialItems: LibraryItem[];
  initialCollections: Collection[];
}

export function LibraryClientPage({
  userRole,
  initialItems,
  initialCollections,
}: LibraryClientPageProps) {
  const [items, setItems] = useState(initialItems);
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<LibraryItem | null>(null);

  const isTeacherOrAdmin = userRole === 'teacher' || userRole === 'admin';

  const handleAddNewItem = () => {
    setCurrentItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: LibraryItem) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    if (confirm('Tem a certeza que quer apagar este item?')) {
      const result = await deleteItem(itemId);
      if (result.success) {
        setItems(items.filter((item) => item.id !== itemId));
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    }
  };

  return (
    <>
      {isTeacherOrAdmin && (
        <ManageItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          item={currentItem}
          collections={initialCollections}
          userRole={userRole} // <-- ADICIONAR ESTA LINHA
        />
      )}

      <Tabs defaultValue="items" className="w-full">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="items">Itens</TabsTrigger>
            {isTeacherOrAdmin && (
              <TabsTrigger value="collections">Coleções</TabsTrigger>
            )}
          </TabsList>
          {isTeacherOrAdmin && (
            <Button onClick={handleAddNewItem}>Adicionar Novo Item</Button>
          )}
        </div>

        <TabsContent value="items">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-card/60 dark:bg-card/40 backdrop-blur-lg border border-border/20 shadow-lg rounded-lg p-4 flex flex-col"
              >
                <img
                  src={item.cover_url || '/assets/images/marcas/library.png'}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <div className="flex-grow">
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.author}</p>
                </div>
                {isTeacherOrAdmin && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditItem(item)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      Apagar
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {items.length === 0 && <p>Ainda não há itens na biblioteca.</p>}
          </div>
        </TabsContent>

        {isTeacherOrAdmin && (
          <TabsContent value="collections">
            <div className="mt-6">
              <ManageCollections collections={initialCollections} />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </>
  );
// src/app/dashboard/applications/library/LibraryClientPage.tsx
'use client';

import { useState, useMemo } from 'react';
import { LibraryItem, Collection, UserRole } from '@/app/dashboard/types';
import { Button } from '@/components/ui/button';
import { deleteItem } from './actions';
import { useToast } from '@/contexts/ToastContext';
import { ManageItemModal } from './components/ManageItemModal';
import { ManageCollections } from './components/ManageCollections';
import { ItemsGrid } from './components/ItemsGrid'; // Importar o novo componente de grelha
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LibraryClientPageProps {
  userRole: UserRole;
  userId: string; // Recebe o ID do utilizador
  initialItems: LibraryItem[];
  initialCollections: Collection[];
}

export function LibraryClientPage({
  userRole,
  userId,
  initialItems,
  initialCollections,
}: LibraryClientPageProps) {
  const [items, setItems] = useState(initialItems);
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<LibraryItem | null>(null);

  const isTeacherOrAdmin = userRole === 'teacher' || userRole === 'admin';

  // Lógica de filtragem para cada aba
  const academicItems = useMemo(() => items.filter(item => item.category === 'academic'), [items]);
  const recreationalItems = useMemo(() => items.filter(item => item.category === 'recreational'), [items]);
  const myTexts = useMemo(() => items.filter(item => item.uploader_id === userId), [items, userId]);

  const handleAddNewItem = () => {
    setCurrentItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: LibraryItem) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    if (confirm('Tem a certeza que quer apagar este item?')) {
      const result = await deleteItem(itemId);
      if (result.success) {
        setItems(currentItems => currentItems.filter((item) => item.id !== itemId));
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    }
  };

  return (
    <>
      {isTeacherOrAdmin && (
        <ManageItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          item={currentItem}
          collections={initialCollections}
          userRole={userRole}
        />
      )}

      <Tabs defaultValue="study" className="w-full">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="study">Para estudar</TabsTrigger>
            <TabsTrigger value="fun">Diversão</TabsTrigger>
            <TabsTrigger value="my-texts">Meus textos</TabsTrigger>
            {isTeacherOrAdmin && (
              <TabsTrigger value="collections">Coleções</TabsTrigger>
            )}
          </TabsList>
          {isTeacherOrAdmin && (
            <Button onClick={handleAddNewItem}>Adicionar Novo Item</Button>
          )}
        </div>

        {/* Conteúdo da Aba "Para estudar" */}
        <TabsContent value="study">
          <ItemsGrid 
            items={academicItems}
            userRole={userRole}
            onEdit={handleEditItem}
            onDelete={handleDelete}
            emptyStateMessage="Ainda não há itens de estudo disponíveis."
          />
        </TabsContent>

        {/* Conteúdo da Aba "Diversão" */}
        <TabsContent value="fun">
          <ItemsGrid 
            items={recreationalItems}
            userRole={userRole}
            onEdit={handleEditItem}
            onDelete={handleDelete}
            emptyStateMessage="Ainda não há itens de diversão disponíveis."
          />
        </TabsContent>

        {/* Conteúdo da Aba "Meus textos" */}
        <TabsContent value="my-texts">
          <ItemsGrid 
            items={myTexts}
            userRole={userRole}
            onEdit={handleEditItem}
            onDelete={handleDelete}
            emptyStateMessage="Você ainda não adicionou nenhum texto."
          />
        </TabsContent>

        {/* Conteúdo da Aba de Coleções */}
        {isTeacherOrAdmin && (
          <TabsContent value="collections">
            <div className="mt-6">
              <ManageCollections collections={initialCollections} />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </>
  );
}}