import React from 'react';

const HEAD = (
  <circle cx="210" cy="90" r="30" stroke="white" strokeWidth="4" fill="none" key="head" />
);
const BODY = <line x1="210" y1="120" x2="210" y2="220" stroke="white" strokeWidth="4" key="body" />;
const RIGHT_ARM = <line x1="210" y1="150" x2="260" y2="180" stroke="white" strokeWidth="4" key="right_arm" />;
const LEFT_ARM = <line x1="210" y1="150" x2="160" y2="180" stroke="white" strokeWidth="4" key="left_arm" />;
const RIGHT_LEG = <line x1="210" y1="220" x2="260" y2="270" stroke="white" strokeWidth="4" key="right_leg" />;
const LEFT_LEG = <line x1="210" y1="220" x2="160" y2="270" stroke="white" strokeWidth="4" key="left_leg" />;

const BODY_PARTS = [HEAD, BODY, RIGHT_ARM, LEFT_ARM, RIGHT_LEG, LEFT_LEG];
export const MAX_WRONG_GUESSES = BODY_PARTS.length;

interface HangmanDrawingProps {
  numberOfGuesses: number;
  isDamaged: boolean;
}

const HangmanFigure: React.FC<HangmanDrawingProps> = ({ numberOfGuesses, isDamaged }) => {
  return (
    <div className={`relative w-full max-w-xs mx-auto ${isDamaged ? 'animate-shake-and-flash' : ''}`}>
      <svg viewBox="0 0 300 350" className="w-full h-auto">
        {/* Gallows */}
        <line x1="20" y1="330" x2="150" y2="330" stroke="white" strokeWidth="4" />
        <line x1="85" y1="330" x2="85" y2="40" stroke="white" strokeWidth="4" />
        <line x1="85" y1="40" x2="210" y2="40" stroke="white" strokeWidth="4" />
        <line x1="210" y1="40" x2="210" y2="60" stroke="white" strokeWidth="4" />
        
        {/* Man parts */}
        {BODY_PARTS.slice(0, numberOfGuesses)}
      </svg>
    </div>
  );
};

export default HangmanFigure;