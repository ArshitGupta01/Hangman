import React, { useState } from 'react';
import { Difficulty } from '../types';

interface SetupScreenProps {
  onStartGame: (topic: string, difficulty: Difficulty) => void;
}

const SUGGESTIONS = [
    "90s Bollywood Movies, hints are famous dialogues.",
    "Indian Street Food, hints are main ingredients.",
    "Characters from the Mahabharata, hints are their key traits.",
    "Famous Indian Cricketers, hints are their nicknames.",
    "Tourist destinations in India, hints are their famous landmarks."
]

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartGame }) => {
  const [topic, setTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Medium);

  const handleStart = () => {
    if (topic.trim()) {
      onStartGame(topic, difficulty);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setTopic(suggestion);
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 p-4">
      <h1 className="font-hangman text-7xl md:text-9xl text-white tracking-wide text-shadow-custom">
        HANGMAN
      </h1>

      <div className="w-full clay-panel">
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic or choose a suggestion..."
          className="w-full h-28 p-4 bg-transparent border-none rounded-2xl text-white placeholder-gray-400 focus:outline-none text-lg"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {(Object.values(Difficulty)).map((level) => (
          <button
            key={level}
            onClick={() => setDifficulty(level)}
            className={`px-6 py-2 rounded-full font-semibold text-lg transition-all duration-300 clay-button ${
              difficulty === level
                ? 'active text-cyan-300'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            {level}
          </button>
        ))}
      </div>
      
      <button
        onClick={handleStart}
        disabled={!topic.trim()}
        className="w-full max-w-xs bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-4 rounded-full text-2xl transition-transform transform hover:scale-105 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:scale-100 disabled:opacity-70 shadow-lg shadow-cyan-500/30"
      >
        Play
      </button>

      <div className="w-full mt-4 clay-panel">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            Suggestions
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
            </svg>
        </h2>
        <ul className="space-y-3">
            {SUGGESTIONS.map((s, i) => (
                <li key={i} className="text-gray-300 border-t border-white/10 pt-3 first:border-t-0 first:pt-0 flex justify-between items-center group">
                    <span className="pr-2">{s}</span>
                    <button onClick={() => handleSuggestionClick(s)} className="p-2 rounded-full bg-white/10 group-hover:bg-cyan-500 transition text-gray-400 group-hover:text-white flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default SetupScreen;