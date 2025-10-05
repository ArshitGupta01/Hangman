import React from 'react';

interface WordDisplayProps {
    word: string;
    guessedLetters: string[];
}

const WordDisplay: React.FC<WordDisplayProps> = ({ word, guessedLetters }) => {
    return (
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center text-3xl sm:text-5xl font-bold tracking-widest text-white">
            {word.split("").map((letter, index) => {
                if (letter === ' ') {
                    return <div key={index} className="w-4 sm:w-8"></div>; // A gap for spaces
                }
                return (
                    <div key={index} className="bg-[#253241] rounded-lg w-12 h-16 sm:w-14 sm:h-20 flex items-center justify-center shadow-[inset_4px_4px_8px_#1f2a36,inset_-4px_-4px_8px_#2b3a4c]">
                        <span
                            className={`transition-opacity duration-500 ${guessedLetters.includes(letter) ? 'opacity-100' : 'opacity-0'}`}
                        >
                            {letter}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default WordDisplay;