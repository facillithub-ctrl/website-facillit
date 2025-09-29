"use client";

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import createClient from '@/utils/supabase/client';
import type { UserProfile } from '../types';

type AvatarUploaderProps = {
  profile: UserProfile;
  onUploadSuccess: (newUrl: string) => void;
};

export default function AvatarUploader({ profile, onUploadSuccess }: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const filePath = `${profile.id}/${Date.now()}`;

    // Faz o upload para o Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      alert(`Erro no upload: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    // Obtém a URL pública da nova imagem
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const newAvatarUrl = data.publicUrl;

    // Atualiza a URL no perfil do usuário
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: newAvatarUrl })
      .eq('id', profile.id);

    if (updateError) {
      alert(`Erro ao atualizar perfil: ${updateError.message}`);
    } else {
      onUploadSuccess(newAvatarUrl); // Notifica o componente pai sobre a nova URL
    }

    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative w-32 h-32 rounded-full mb-4 cursor-pointer group"
        onClick={handleAvatarClick}
      >
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt="Avatar do usuário"
            layout="fill"
            objectFit="cover"
            className="rounded-full"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center font-bold text-4xl text-royal-blue dark:bg-gray-600">
            {profile.fullName?.charAt(0)}
          </div>
        )}
        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <i className="fas fa-camera text-white text-2xl"></i>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={uploading}
        accept="image/png, image/jpeg"
        className="hidden"
      />
      {uploading && <p className="text-sm text-text-muted">Enviando...</p>}
    </div>
  );
}