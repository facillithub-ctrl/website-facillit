// src/app/dashboard/applications/library/components/ManageItemModal.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { LibraryItem, Collection, UserRole } from '@/app/dashboard/types';
import { useToast } from '@/contexts/ToastContext';
import { upsertItem, uploadFile } from '../actions';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ManageItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: LibraryItem | null;
  collections: Collection[];
  userRole: UserRole; // Recebe a função do utilizador
}

export function ManageItemModal({
  isOpen,
  onClose,
  item,
  collections,
  userRole,
}: ManageItemModalProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [coverUrlPreview, setCoverUrlPreview] = useState(item?.cover_url || '');

  useEffect(() => {
    setCoverUrlPreview(item?.cover_url || '');
  }, [item]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCoverFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = async (formData: FormData) => {
    startTransition(async () => {
      if (coverFile) {
        const coverFormData = new FormData();
        coverFormData.append('file', coverFile);
        const uploadResult = await uploadFile(coverFormData);
        if (uploadResult.success && uploadResult.url) {
          formData.set('cover_url', uploadResult.url);
        } else {
          showToast(uploadResult.message || 'Falha no upload da capa.', 'error');
          return;
        }
      }

      const result = await upsertItem(formData);
      if (result.success) {
        showToast(result.message, 'success');
        onClose();
      } else {
        showToast(result.message, 'error');
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar Item' : 'Adicionar Novo Item'}</DialogTitle>
        </DialogHeader>
        <form action={handleFormSubmit} className="space-y-4">
          {item && <input type="hidden" name="id" value={item.id} />}
          <input type="hidden" name="cover_url" value={coverUrlPreview} />

          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" defaultValue={item?.title} required />
          </div>
          <div>
            <Label htmlFor="author">Autor</Label>
            <Input id="author" name="author" defaultValue={item?.author} />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" name="description" defaultValue={item?.description}/>
          </div>
          <div>
            <Label htmlFor="cover">Imagem da Capa</Label>
            <Input id="cover" type="file" onChange={handleFileChange} accept="image/*" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Select name="type" defaultValue={item?.type || 'book'}>
              <SelectTrigger><SelectValue placeholder="Tipo de item" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="book">Livro</SelectItem>
                <SelectItem value="article">Artigo</SelectItem>
                <SelectItem value="video">Vídeo</SelectItem>
                <SelectItem value="podcast">Podcast</SelectItem>
              </SelectContent>
            </Select>
            <Select name="collection_id" defaultValue={item?.collection_id || ''}>
              <SelectTrigger><SelectValue placeholder="Coleção" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma</SelectItem>
                {collections.map((col) => (
                  <SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* --- NOVOS CAMPOS ADICIONADOS --- */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Categoria</Label>
                <Select name="category" defaultValue={item?.category || 'recreational'}>
                    <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="academic">Para estudar</SelectItem>
                        <SelectItem value="recreational">Diversão</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="published" name="published" defaultChecked={item?.published} />
            <Label htmlFor="published">Publicar item</Label>
          </div>
          
          {/* Só mostra a opção de destaque para Admins */}
          {userRole === 'admin' && (
              <div className="flex items-center space-x-2">
                  <Switch id="is_featured" name="is_featured" defaultChecked={item?.is_featured} />
                  <Label htmlFor="is_featured">Marcar como Destaque</Label>
              </div>
          )}
          {/* --- FIM DOS NOVOS CAMPOS --- */}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'A guardar...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}   