
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center animate-fade-in" onClick={onClose}>
      <div 
        className="bg-brand-surface rounded-lg shadow-xl w-full max-w-md border border-brand-border m-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-brand-border">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-white">&times;</button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
