import React, { ReactNode } from 'react';
import { CloseIcon } from '../icons/CloseIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white"
        onClick={e => e.stopPropagation()} // Prevent content click from closing modal
      >
        <div className="flex justify-between items-center pb-3 border-b">
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon />
          </button>
        </div>
        <div className="mt-4">
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
