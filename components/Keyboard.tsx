import React from 'react';

const KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface KeyboardProps {
  activeLetters: string[];
  inactiveLetters: string[];
  onSelectLetter: (letter: string) => void;
  disabled?: boolean;
}

const Keyboard: React.FC<KeyboardProps> = ({ 
    activeLetters, 
    inactiveLetters, 
    onSelectLetter, 
    disabled = false 
}) => {
  return (
    <div className="grid grid-cols-7 md:grid-cols-9 lg:grid-cols-10 gap-2 w-full max-w-4xl mx-auto">
      {KEYS.map(key => {
        const isActive = activeLetters.includes(key);
        const isInactive = inactiveLetters.includes(key);
        const isGuessed = isActive || isInactive;

        return (
          <button
            onClick={() => onSelectLetter(key)}
            className={`
              font-bold text-lg sm:text-xl p-2 sm:p-3 rounded-md aspect-square
              uppercase transition-all duration-200
              flex items-center justify-center 
              ${isActive ? 'clay-button active !bg-green-600/80 text-white' : ''}
              ${isInactive ? 'clay-button inactive text-gray-500' : ''}
              ${!isGuessed ? 'clay-button text-white' : ''}
              ${disabled && !isGuessed ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={isGuessed || disabled}
            key={key}
          >
            {key}
          </button>
        );
      })}
    </div>
  );
};

export default Keyboard;