import React from 'react';

interface ModalProps {
  title: string;
  message: string;
  buttonText: string;
  onButtonClick: () => void;
  roundScore: number;
}

const Modal: React.FC<ModalProps> = ({ title, message, buttonText, onButtonClick, roundScore }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-[#2c3e50] rounded-xl p-8 max-w-sm w-full text-center shadow-2xl border border-white/10 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
        <p className="text-gray-300 mb-2 text-lg">{message}</p>
        {title === "You Won!" && (
          <p className="text-cyan-300 font-semibold text-xl mb-6">+{roundScore} Points!</p>
        )}
        <button
          onClick={onButtonClick}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default Modal;