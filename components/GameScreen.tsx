import React, { useCallback, useState, useEffect } from 'react';
import { Difficulty, GameStatus, HangmanData } from '../types';
import HangmanFigure, { MAX_WRONG_GUESSES } from './HangmanFigure';
import Keyboard from './Keyboard';
import WordDisplay from './WordDisplay';
import Modal from './Modal';

interface GameScreenProps {
  gameData: HangmanData;
  difficulty: Difficulty;
  onPlayAgain: () => void;
  onReset: () => void;
  onGameEnd: (isWin: boolean, wrongGuesses: number) => void;
  isBossRound: boolean;
  score: number;
  onDeductPoints: (points: number) => void;
}

const BOSS_TIMER_DURATION = 60;
const BASE_HINT_COST = 25;

const GameScreen: React.FC<GameScreenProps> = ({ gameData, difficulty, onPlayAgain, onReset, onGameEnd, isBossRound, score, onDeductPoints }) => {
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Playing);
  const [isGameConcluded, setIsGameConcluded] = useState(false);
  const [roundScore, setRoundScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(BOSS_TIMER_DURATION);
  const [isDamaged, setIsDamaged] = useState(false);
  const [timerSpeedMultiplier, setTimerSpeedMultiplier] = useState(1);
  const [firstMistakeMade, setFirstMistakeMade] = useState(false);
  const [purchasedHintsCount, setPurchasedHintsCount] = useState(0);


  const incorrectLetters = guessedLetters.filter(
    letter => !gameData.word.includes(letter)
  );
  const correctLetters = guessedLetters.filter(letter =>
    gameData.word.includes(letter)
  );
  
  const isWinner = gameData.word.split('').every(letter => guessedLetters.includes(letter) || letter === ' ');
  const isLoser = incorrectLetters.length >= MAX_WRONG_GUESSES || (isBossRound && timeLeft <= 0);

  const addGuessedLetter = useCallback((letter: string) => {
    if (guessedLetters.includes(letter) || isWinner || isLoser) return;

    const isIncorrectGuess = !gameData.word.includes(letter);
    setGuessedLetters(currentLetters => [...currentLetters, letter]);

    if (isBossRound && isIncorrectGuess) {
      if (!firstMistakeMade) {
        setTimeLeft(prevTime => Math.max(0, prevTime - 4));
        setFirstMistakeMade(true);
      }
      
      setTimerSpeedMultiplier(prevMultiplier => {
        const increment = difficulty === Difficulty.Hard ? 0.5 : 0.3;
        // The first speed-up is larger
        if (prevMultiplier === 1) {
          return difficulty === Difficulty.Hard ? 2 : 1.5;
        }
        return prevMultiplier + increment;
      });

      setIsDamaged(true);
      setTimeout(() => setIsDamaged(false), 300);
    }
  }, [guessedLetters, isWinner, isLoser, isBossRound, gameData.word, difficulty, firstMistakeMade]);

  const calculateRoundScore = useCallback((difficulty: Difficulty, wrongGuesses: number, isBoss: boolean): number => {
    const basePoints: { [key in Difficulty]: number } = {
      [Difficulty.Easy]: 50,
      [Difficulty.Medium]: 100,
      [Difficulty.Hard]: 150,
    };
    const penalty: { [key in Difficulty]: number } = {
      [Difficulty.Easy]: 5,
      [Difficulty.Medium]: 10,
      [Difficulty.Hard]: 15,
    };
    const pointsMultiplier = isBoss ? 3 : 1;
    const points = (basePoints[difficulty] - (wrongGuesses * penalty[difficulty])) * pointsMultiplier;
    return Math.max(0, points);
  }, []);
  
  useEffect(() => {
    if (isGameConcluded) return;

    if (isWinner) {
      const points = calculateRoundScore(difficulty, incorrectLetters.length, isBossRound);
      setRoundScore(points);
      onGameEnd(true, incorrectLetters.length);
      setGameStatus(GameStatus.Won);
      setIsGameConcluded(true);
    } else if (isLoser) {
      setRoundScore(0);
      onGameEnd(false, incorrectLetters.length);
      setGameStatus(GameStatus.Lost);
      setIsGameConcluded(true);
    }
  }, [isWinner, isLoser, isGameConcluded, difficulty, incorrectLetters.length, onGameEnd, calculateRoundScore, isBossRound]);

  useEffect(() => {
    if (!isBossRound || gameStatus !== GameStatus.Playing) return;

    if (timeLeft <= 0) {
      return;
    }

    const intervalDuration = 1000 / timerSpeedMultiplier;

    const timerId = setInterval(() => {
      setTimeLeft(prevTime => Math.max(0, prevTime - 1));
    }, intervalDuration);

    return () => clearInterval(timerId);
  }, [isBossRound, timeLeft, gameStatus, timerSpeedMultiplier]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key.match(/^[A-Z]$/)) {
        e.preventDefault();
        addGuessedLetter(key);
      }
    };
    document.addEventListener("keypress", handler);
    return () => {
      document.removeEventListener("keypress", handler);
    };
  }, [addGuessedLetter]);

  const freeHintsCount = incorrectLetters.length;
  const visibleHintsCount = 1 + freeHintsCount + purchasedHintsCount; // Start with 1 hint visible
  const nextHintCost = BASE_HINT_COST * Math.pow(2, purchasedHintsCount);
  const hasReachedHardModeHintLimit = difficulty === Difficulty.Hard && purchasedHintsCount >= 2;

  const handleGetHint = () => {
    if (score >= nextHintCost && visibleHintsCount < gameData.hints.length && gameStatus === GameStatus.Playing && !hasReachedHardModeHintLimit) {
      onDeductPoints(nextHintCost);
      setPurchasedHintsCount(prev => prev + 1);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 w-full max-w-5xl mx-auto relative">
       <button 
        onClick={onReset}
        className="absolute top-0 right-0 md:top-4 md:right-4 bg-white/10 hover:bg-white/20 text-sm text-gray-300 font-semibold py-2 px-4 rounded-lg transition"
      >
        New Topic
      </button>

      {(gameStatus === GameStatus.Won || gameStatus === GameStatus.Lost) && (
        <Modal 
          title={gameStatus === GameStatus.Won ? "You Won!" : "Game Over"}
          message={
            (isLoser && isBossRound && timeLeft <= 0) 
            ? "Time's up!" 
            : `The word was: "${gameData.word}"`
          } 
          buttonText="Play Again" 
          onButtonClick={onPlayAgain} 
          roundScore={roundScore}
        />
      )}

      {isBossRound && (
        <div className="w-full max-w-2xl text-center">
            <h2 className="font-hangman text-5xl text-red-400 text-shadow-custom mb-2">BOSS ROUND</h2>
            <div className="w-full bg-[#1c2733] rounded-full h-6 border-2 border-red-500/50 overflow-hidden shadow-inner">
                <div 
                    className="bg-gradient-to-r from-red-500 to-orange-400 h-full rounded-full transition-all duration-500 ease-linear"
                    style={{ width: `${(timeLeft / BOSS_TIMER_DURATION) * 100}%` }}
                ></div>
            </div>
            <div className="flex justify-center items-center gap-4 mt-2">
                <p className="text-2xl font-bold text-white">{timeLeft}s</p>
                {timerSpeedMultiplier > 1 && (
                    <span className="text-sm font-semibold text-orange-300 bg-orange-900/50 px-2 py-1 rounded-md">
                        {timerSpeedMultiplier.toFixed(1)}x Speed
                    </span>
                )}
            </div>
        </div>
      )}
      
      <div className="text-lg text-left text-gray-300 clay-panel w-full max-w-2xl">
        <strong className="text-white">Hints:</strong>
        <ul className="mt-2 space-y-3">
          {gameData.hints.map((hint, index) => {
            const isVisible = index < visibleHintsCount;
            return (
              <li key={index} className={`flex items-start transition-all duration-300 ${isVisible ? 'text-gray-200' : 'text-gray-500'}`}>
                <span className={`font-bold mr-2 ${isVisible ? 'text-cyan-400' : 'text-gray-600'}`}>{index + 1}.</span>
                {isVisible ? (
                  <span className="italic animate-fade-in-up">{hint}</span>
                ) : (
                  <div className="flex items-center gap-2 italic">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Hint Locked</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="w-full max-w-2xl text-center">
        <button
          onClick={handleGetHint}
          disabled={isWinner || isLoser || visibleHintsCount >= gameData.hints.length || score < nextHintCost || hasReachedHardModeHintLimit}
          className="bg-yellow-500/20 text-yellow-300 font-semibold py-2 px-5 rounded-lg transition transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 disabled:opacity-50 shadow-lg flex items-center gap-2 mx-auto border border-yellow-500/50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a1 1 0 011 1v1a1 1 0 01-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm-1.414 8.486a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" />
          </svg>
          Get Hint (-{nextHintCost} Points)
        </button>
        {score < nextHintCost && visibleHintsCount < gameData.hints.length && !isGameConcluded && !hasReachedHardModeHintLimit && (
          <p className="text-xs text-yellow-500 mt-2">Not enough points for a hint.</p>
        )}
        {hasReachedHardModeHintLimit && !isGameConcluded && visibleHintsCount < gameData.hints.length && (
           <p className="text-xs text-yellow-500 mt-2">Hint purchase limit (2) reached for Hard mode.</p>
        )}
      </div>


      <HangmanFigure numberOfGuesses={incorrectLetters.length} isDamaged={isDamaged} />
      
      <WordDisplay word={gameData.word} guessedLetters={guessedLetters} />

      <div className="self-stretch mt-4">
        <Keyboard
          disabled={isWinner || isLoser}
          activeLetters={correctLetters}
          inactiveLetters={incorrectLetters}
          onSelectLetter={addGuessedLetter}
        />
      </div>
    </div>
  );
};

export default GameScreen;