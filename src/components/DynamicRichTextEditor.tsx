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
  // A chave de API é lida das variáveis de ambiente
  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY;

  if (!apiKey) {
    console.error("A chave de API do TinyMCE não foi encontrada. Verifique seu arquivo .env.local");
    return <div className="p-4 border rounded-md bg-red-100 text-red-800">Erro: Chave de API do Editor não configurada.</div>;
  }

  return (
    <Editor
      apiKey={apiKey}
      value={value}
      onEditorChange={(content, editor) => onChange(content)}
      init={{
        height: height,
        menubar: false,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help',
        content_style: 'body { font-family:Inter,sans-serif; font-size:14px }',
        placeholder: placeholder
      }}
    />
  );
}