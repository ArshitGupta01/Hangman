
import React, { useState, useCallback, useEffect } from 'react';
import { Difficulty, GameStatus, HangmanData } from './types';
import { generateHangmanGame, generateMultipleHangmanGames } from './services/geminiService';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';
import Spinner from './components/Spinner';
import BossIntroScreen from './components/BossIntroScreen';

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Setup);
  const [hangmanData, setHangmanData] = useState<HangmanData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>(Difficulty.Medium);
  const [score, setScore] = useState<number>(0);
  const [roundsPlayed, setRoundsPlayed] = useState<number>(0);
  const [nextBossRoundAt, setNextBossRoundAt] = useState<number>(() => Math.floor(Math.random() * 4) + 4); // 4-7
  const [isBossRound, setIsBossRound] = useState<boolean>(false);
  const [prefetchedGames, setPrefetchedGames] = useState<HangmanData[]>([]);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [topicForPrefetch, setTopicForPrefetch] = useState<{ topic: string, difficulty: Difficulty } | null>(null);

  useEffect(() => {
    const savedScore = localStorage.getItem('hangmanScore');
    if (savedScore) {
      setScore(parseInt(savedScore, 10) || 0);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hangmanScore', score.toString());
  }, [score]);
  
  useEffect(() => {
    if (!topicForPrefetch) return;

    const prefetch = async () => {
      const targetQueueSize = 3;
      const gamesToFetch = targetQueueSize - prefetchedGames.length;
      if (gamesToFetch <= 0) return;

      const wordsToExclude = [...usedWords, ...prefetchedGames.map(g => g.word)];

      try {
        const newGames = await generateMultipleHangmanGames(
          topicForPrefetch.topic,
          topicForPrefetch.difficulty,
          wordsToExclude,
          gamesToFetch,
        );
        
        if (newGames.length > 0) {
          // Filter out any duplicates just in case the model returns them
          const uniqueNewGames = newGames.filter(newGame => 
            !prefetchedGames.some(existingGame => existingGame.word === newGame.word) &&
            !usedWords.includes(newGame.word)
          );
          setPrefetchedGames(prev => [...prev, ...uniqueNewGames]);
        }
      } catch (err) {
        console.error("Failed to prefetch games:", err);
      }
    };

    prefetch();
  }, [prefetchedGames, usedWords, topicForPrefetch]);


  const startGame = useCallback(async (topic: string, difficulty: Difficulty) => {
    setCurrentTopic(topic);
    setCurrentDifficulty(difficulty);
    setGameStatus(GameStatus.Loading);
    setError(null);
    
    // Reset game progression for the new topic
    setRoundsPlayed(0);
    setIsBossRound(false);
    setNextBossRoundAt(Math.floor(Math.random() * 4) + 4);
    setPrefetchedGames([]);
    setUsedWords([]);
    setTopicForPrefetch(null);

    try {
        const data = await generateHangmanGame(topic, difficulty, false, []);
        const newUsedWords = [data.word];
        setUsedWords(newUsedWords);
        setHangmanData(data);
        setGameStatus(GameStatus.Playing);
        setTopicForPrefetch({ topic, difficulty });
    } catch (err) {
        setError('Failed to generate a new game. Please try again.');
        setGameStatus(GameStatus.Setup);
    }
  }, []);

  const resetGame = useCallback(() => {
    setGameStatus(GameStatus.Setup);
    setHangmanData(null);
    setError(null);
    setCurrentTopic('');
    setIsBossRound(false);
    setPrefetchedGames([]);
    setUsedWords([]);
    setTopicForPrefetch(null);
  }, []);

  const playAgain = useCallback(async () => {
    if (!currentTopic || !hangmanData) {
        resetGame();
        return;
    }

    // `roundsPlayed` is the number of completed rounds. The state update for `roundsPlayed` happens *after* this check.
    // So, we check against `roundsPlayed + 2` to correctly predict the upcoming round number.
    const isNextRoundBoss = roundsPlayed + 2 >= nextBossRoundAt;

    if (isNextRoundBoss) {
        setIsBossRound(true);
        setRoundsPlayed(0); 
        setNextBossRoundAt(Math.floor(Math.random() * 4) + 4);
        setGameStatus(GameStatus.BossIntro);

        setTimeout(async () => {
            setGameStatus(GameStatus.Loading);
            try {
                const data = await generateHangmanGame(currentTopic, currentDifficulty, true, usedWords);
                const newUsedWords = Array.from(new Set([...usedWords, data.word]));
                setUsedWords(newUsedWords);
                setHangmanData(data);
                setGameStatus(GameStatus.Playing);
            } catch (err) {
                setError('Failed to generate boss round. Please try again.');
                setGameStatus(GameStatus.Setup);
            }
        }, 3000);
    } else {
        setIsBossRound(false);
        setRoundsPlayed(prev => prev + 1);
        if (prefetchedGames.length > 0) {
            const [nextGame, ...remainingGames] = prefetchedGames;
            const newUsedWords = Array.from(new Set([...usedWords, nextGame.word]));
            setUsedWords(newUsedWords);
            setHangmanData(nextGame);
            setPrefetchedGames(remainingGames);
            setGameStatus(GameStatus.Playing);
        } else {
            setGameStatus(GameStatus.Loading);
            try {
                const data = await generateHangmanGame(currentTopic, currentDifficulty, false, usedWords);
                const newUsedWords = Array.from(new Set([...usedWords, data.word]));
                setUsedWords(newUsedWords);
                setHangmanData(data);
                setGameStatus(GameStatus.Playing);
            } catch (err) {
                setError('Failed to generate a new game. Please try again.');
                setGameStatus(GameStatus.Setup);
            }
        }
    }
  }, [currentTopic, currentDifficulty, resetGame, roundsPlayed, nextBossRoundAt, prefetchedGames, usedWords, hangmanData]);

  const handleGameEnd = useCallback((isWin: boolean, wrongGuesses: number) => {
    if (!isWin) return;

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
    
    const pointsMultiplier = isBossRound ? 3 : 1;
    const pointsEarned = Math.max(0, basePoints[currentDifficulty] - (wrongGuesses * penalty[currentDifficulty])) * pointsMultiplier;
    setScore(prevScore => prevScore + pointsEarned);

  }, [currentDifficulty, isBossRound]);

  const deductPoints = useCallback((points: number) => {
    setScore(prevScore => Math.max(0, prevScore - points));
  }, []);

  const renderContent = () => {
    switch (gameStatus) {
      case GameStatus.Setup:
        return (
            <>
                {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center mb-4">{error}</p>}
                <SetupScreen onStartGame={startGame} />
            </>
        );
      case GameStatus.BossIntro:
        return <BossIntroScreen />;
      case GameStatus.Loading:
        return (
          <div className="text-center">
            <Spinner />
            <p className="text-cyan-300 mt-4 text-lg">Brewing a challenge for you...</p>
          </div>
        );
      case GameStatus.Playing:
        if (!hangmanData) {
            resetGame();
            return null;
        }
        return <GameScreen 
            key={hangmanData.word}
            gameData={hangmanData} 
            difficulty={currentDifficulty}
            onPlayAgain={playAgain} 
            onReset={resetGame} 
            onGameEnd={handleGameEnd}
            isBossRound={isBossRound}
            score={score}
            onDeductPoints={deductPoints}
        />;
      default:
        return <SetupScreen onStartGame={startGame} />;
    }
  };

  return (
    <div className="text-white min-h-screen flex flex-col justify-center items-center p-4 relative">
       <div className="absolute top-4 right-4 bg-[#2c3e50]/80 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-xl text-lg z-10 shadow-lg">
        Score: <span className="font-bold text-cyan-300">{score}</span>
      </div>
      <main className="w-full max-w-7xl mx-auto flex justify-center items-center">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
