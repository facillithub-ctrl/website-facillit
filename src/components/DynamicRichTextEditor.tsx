// src/components/DynamicRichTextEditor.tsx
"use client";

import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

// Interface para definir as propriedades do nosso componente
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

export default function DynamicRichTextEditor({ value, onChange, placeholder, height = 300 }: RichTextEditorProps) {
  // ✅ CORREÇÃO: A chave de API agora é lida corretamente das variáveis de ambiente PÚBLICAS do Next.js
  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY;

  if (!apiKey) {
    console.error("A chave de API do TinyMCE (NEXT_PUBLIC_TINYMCE_API_KEY) não foi encontrada. Verifique seu arquivo .env.local");
    return <div className="p-4 border rounded-md bg-red-100 text-red-800">Erro: Chave de API do Editor não configurada. Certifique-se de que a variável NEXT_PUBLIC_TINYMCE_API_KEY está definida no seu .env.local</div>;
  }

  return (
    <Editor
      apiKey={apiKey}
      value={value}
      onEditorChange={(content) => onChange(content)}
      init={{
        height: height,
        menubar: false,
        plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
        toolbar: 'undo redo | blocks fontfamily fontsize | ' +
                 'bold italic underline strikethrough | ' +
                 'link image media table | ' +
                 'align lineheight | numlist bullist indent outdent | ' +
                 'emoticons charmap | removeformat',
        content_style: 'body { font-family:Inter,sans-serif; font-size:14px }',
        placeholder: placeholder,
        // Adicionado para garantir que o editor funcione mesmo com CSP mais restrito (opcional, teste sem isso primeiro)
        // external_plugins: { tiny_mce_wiris: 'https://www.wiris.net/demo/plugins/tiny_mce/plugin.js' },
        // allow_script_urls: true
      }}
    />
  );
}