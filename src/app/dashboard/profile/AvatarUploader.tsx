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

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      alert(`Erro no upload: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const newAvatarUrl = data.publicUrl;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: newAvatarUrl })
      .eq('id', profile.id);

    if (updateError) {
      alert(`Erro ao atualizar perfil: ${updateError.message}`);
    } else {
      onUploadSuccess(newAvatarUrl);
    }

    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center">
      {/* CORREÇÃO APLICADA AQUI: Tamanho fixo w-32 h-32 */}
      <div 
        className="relative w-32 h-32 rounded-full mb-4 cursor-pointer group"
        onClick={handleAvatarClick}
      >
        {profile.avatarUrl ? (
          <Image
            key={profile.avatarUrl} // Adiciona uma key para forçar o re-render
            src={profile.avatarUrl}
            alt="Avatar do usuário"
            fill
            sizes="128px"
            className="rounded-full object-cover"
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