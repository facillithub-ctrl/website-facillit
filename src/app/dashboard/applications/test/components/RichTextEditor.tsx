"use client";

import { useRef } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  // NOVO: A função de upload agora é uma propriedade obrigatória
  onImageUpload: (file: File) => Promise<string | null>;
  placeholder?: string;
};

// Componente da barra de ferramentas (permanece o mesmo)
const Toolbar = ({ editorRef, onImageUpload }: { editorRef: React.RefObject<HTMLDivElement>, onImageUpload: (file: File) => Promise<string | null> }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyFormat = (command: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false);
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Executa a função de upload recebida por props
    const imageUrl = await onImageUpload(file);
    if (imageUrl) {
      editorRef.current?.focus();
      document.execCommand('insertHTML', false, `<img src="${imageUrl}" alt="Imagem da questão" class="max-w-full rounded-md my-2" />`);
    }
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex items-center gap-2 p-2 border-b dark:border-gray-600 mb-2">
      <button type="button" onClick={() => applyFormat('bold')} className="w-8 h-8 rounded hover:bg-gray-200 dark:hover:bg-gray-800"><i className="fas fa-bold"></i></button>
      <button type="button" onClick={() => applyFormat('italic')} className="w-8 h-8 rounded hover:bg-gray-200 dark:hover:bg-gray-800"><i className="fas fa-italic"></i></button>
      <button type="button" onClick={() => applyFormat('underline')} className="w-8 h-8 rounded hover:bg-gray-200 dark:hover:bg-gray-800"><i className="fas fa-underline"></i></button>
      <button type="button" onClick={handleImageButtonClick} className="w-8 h-8 rounded hover:bg-gray-200 dark:hover:bg-gray-800"><i className="fas fa-image"></i></button>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
    </div>
  );
};


// Componente principal do Editor
export default function RichTextEditor({ value, onChange, onImageUpload, placeholder }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border rounded-md dark:border-gray-600">
      {/* Passa a função de upload diretamente para a Toolbar */}
      <Toolbar editorRef={editorRef} onImageUpload={onImageUpload} />
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        className="w-full min-h-[100px] p-2 focus:outline-none"
        data-placeholder={placeholder}
      />
    </div>
  );
}