"use client";

// Removido 'Fragment' pois não estava sendo usado.
// import { Fragment } from 'react';

type ConfirmationModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
};

// A linha mais importante é esta: "export default function..."
export default function ConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onClose,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}: ConfirmationModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-royal-blue text-4xl mb-4">
          <i className="fas fa-question-circle"></i>
        </div>
        <h2 className="text-xl font-bold text-dark-text dark:text-white-text mb-2">
          {title}
        </h2>
        <p className="text-text-muted dark:text-dark-text-muted mb-6">
          {message}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="bg-royal-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}