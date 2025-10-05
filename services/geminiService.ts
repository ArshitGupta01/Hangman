
import { GoogleGenAI, Type } from '@google/genai';
import { Difficulty, HangmanData } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set. Please set it to run the application.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateHangmanGame = async (
  topic: string,
  difficulty: Difficulty,
  isBossRound: boolean = false,
  usedWords: string[] = []
): Promise<HangmanData> => {
  const exclusionRule = usedWords.length > 0 
    ? `\n5. IMPORTANT RULE: Do NOT generate any of the following words or phrases as they have already been used in this session: ${usedWords.join(', ')}.` 
    : '';

  let prompt = '';
  const isBollywoodTopic = topic.toLowerCase().includes('bollywood');

  if (isBollywoodTopic) {
    const bollywoodRegularPrompt = `
      You are an expert on Indian cinema, specifically Bollywood films. Your knowledge is precise and verified. Your task is to generate an accurate and verifiable hangman puzzle.

      Topic: "${topic}"
      Difficulty: "${difficulty}"

      RULES:
      1.  The 'word' must be a well-known Bollywood movie title, character name, actor/actress name, or a very famous dialogue.
      2.  **ACCURACY IS CRITICAL.** The word and all hints must be factually correct. For example, if the word is a movie, the hints must be about its plot, actors, or songs from that specific movie.
      3.  The 'word' must only contain alphabetic characters (A-Z) and spaces, and be in all uppercase letters.
      4.  The 'word' should be appropriate for the selected difficulty. 'Easy' should be iconic films like 'Sholay'. 'Hard' could be a less mainstream but critically acclaimed film.
      5.  Provide exactly 4 'hints' as an array of strings. The hints must be short, clever clues, ordered from most cryptic (first hint) to most obvious (last hint).
      6.  Return the result in JSON format with the keys "word" (a string) and "hints" (an array of 4 strings).
      ${exclusionRule.replace('5.', '7.')}
    `;

    const bollywoodBossPrompt = `
      You are an expert on Indian cinema, specifically Bollywood films. Your knowledge is precise and verified. Your task is to generate an extremely difficult, boss-level hangman puzzle for a Bollywood expert.

      Topic: "${topic}"

      RULES:
      1.  The 'word' must be a challenging Bollywood-related term. This could be a specific character's full name from a classic film, a critically acclaimed but non-mainstream movie title, or a specific, nuanced movie-related term.
      2.  **ACCURACY IS CRITICAL.** The word and all hints must be factually correct and verifiable by a Bollywood aficionado.
      3.  The 'word' must only contain alphabetic characters (A-Z) and spaces, and be in all uppercase letters.
      4.  Provide exactly 4 'hints'. The hints must be very cryptic and require deep knowledge of Bollywood cinema. They should be ordered from most cryptic to slightly less cryptic.
      5.  Return the result in JSON format with the keys "word" (a string) and "hints" (an array of 4 strings).
      6.  The puzzle must be unique and not trivial.
      ${exclusionRule.replace('5.', '7.')}
    `;
    prompt = isBossRound ? bollywoodBossPrompt : bollywoodRegularPrompt;

  } else {
    const regularPrompt = `
      Generate a hangman game word or short phrase and a corresponding list of hints based on the following topic and difficulty.

      Topic: "${topic}"
      Difficulty: "${difficulty}"

      RULES:
      1.  The 'word' must only contain alphabetic characters (A-Z) and spaces. No numbers, punctuation, or special characters.
      2.  The 'word' should be appropriate for the selected difficulty. For 'Easy', use a very common and well-known term. For 'Hard', use a more obscure or specific term related to the topic.
      3.  Provide exactly 4 'hints' as an array of strings. The hints must be short, clever clues. They should be ordered from most cryptic (first hint) to most obvious (last hint).
      4.  Return the result in JSON format with the keys "word" (a string) and "hints" (an array of 4 strings). The word should be in all uppercase letters.
      ${exclusionRule}
      `;

      const bossPrompt = `
      Generate a very difficult, boss-level hangman puzzle for an expert player.
      The puzzle should be related to the topic: "${topic}".
      The 'word' or phrase must be significantly more challenging than a standard 'Hard' level.
      
      RULES:
      1. The 'word' must only contain alphabetic characters (A-Z) and spaces.
      2. The 'word' must be in all uppercase letters.
      3. Provide exactly 4 'hints' as an array of strings. The hints must be very cryptic and require deep thinking. They should be ordered from most cryptic (first hint) to slightly less cryptic (last hint).
      4. Return the result in JSON format with the keys "word" (a string) and "hints" (an array of 4 strings).
      5. The puzzle must be unique and not trivial.
      ${exclusionRule}
    `;
    prompt = isBossRound ? bossPrompt : regularPrompt;
  }
  

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: {
              type: Type.STRING,
              description: 'The hangman word or phrase, in uppercase. Only letters and spaces.',
            },
            hints: {
              type: Type.ARRAY,
              description: 'An array of exactly 4 short, clever hints for the word, ordered from most cryptic to most obvious.',
              items: {
                type: Type.STRING,
              },
            },
          },
          required: ['word', 'hints'],
        },
        temperature: 0.9,
      },
    });

    const jsonString = response.text.trim();
    const parsedData = JSON.parse(jsonString) as HangmanData;
    
    if (!parsedData.word || !parsedData.hints || !Array.isArray(parsedData.hints) || parsedData.hints.length === 0 || /[^A-Z\s]/.test(parsedData.word.toUpperCase())) {
        console.error("Invalid data format received from AI:", parsedData);
        throw new Error("Invalid data format from AI.");
    }
    
    parsedData.word = parsedData.word.toUpperCase();

    return parsedData;
  } catch (error) {
    console.error('Error generating hangman game from Gemini:', error);
    return {
      word: 'DEVELOPER',
      hints: [
        'I build things, but not with my hands.',
        'My language is not spoken, but it creates worlds.',
        'I argue with inanimate objects.',
        'Someone who turns coffee into code.'
      ],
    };
  }
};

export const generateMultipleHangmanGames = async (
  topic: string,
  difficulty: Difficulty,
  usedWords: string[] = [],
  count: number = 3
): Promise<HangmanData[]> => {
  const exclusionRule = usedWords.length > 0 
    ? `\n5. IMPORTANT RULE: Do NOT generate any of the following words or phrases as they have already been used in this session: ${usedWords.join(', ')}.` 
    : '';

  let prompt = '';
  const isBollywoodTopic = topic.toLowerCase().includes('bollywood');

  if (isBollywoodTopic) {
      prompt = `
      You are an expert on Indian cinema, specifically Bollywood films. Your knowledge is precise and verified. Your task is to generate ${count} accurate and verifiable hangman puzzles.

      Topic: "${topic}"
      Difficulty: "${difficulty}"

      RULES:
      1.  Each 'word' must be a well-known Bollywood movie title, character name, actor/actress name, or a very famous dialogue.
      2.  **ACCURACY IS CRITICAL.** Each word and all its hints must be factually correct.
      3.  Each 'word' must only contain alphabetic characters (A-Z) and spaces, and be in all uppercase letters.
      4.  The words should be appropriate for the selected difficulty.
      5.  For each game, provide exactly 4 'hints' as an array of strings. The hints must be short, clever clues, ordered from most cryptic to most obvious.
      6.  Return the result as a JSON array of ${count} objects, where each object has "word" and "hints" keys.
      ${exclusionRule.replace('5.', '7.')}
      8. Ensure all ${count} generated games are unique from each other.
    `;
  } else {
    prompt = `
    Generate a list of ${count} hangman game words or short phrases and their corresponding hints based on the following topic and difficulty.

    Topic: "${topic}"
    Difficulty: "${difficulty}"

    RULES:
    1.  Each 'word' must only contain alphabetic characters (A-Z) and spaces. No numbers, punctuation, or special characters.
    2.  Each 'word' should be appropriate for the selected difficulty.
    3.  For each game, provide exactly 4 'hints' as an array of strings. They should be ordered from most cryptic (first hint) to most obvious (last hint).
    4.  Return the result as a JSON array of ${count} objects, where each object has the keys "word" (a string in all uppercase) and "hints" (an array of 4 strings).
    ${exclusionRule}
    6. Ensure all ${count} generated games are unique from each other.
    `;
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: {
                type: Type.STRING,
                description: 'The hangman word or phrase, in uppercase. Only letters and spaces.',
              },
              hints: {
                type: Type.ARRAY,
                description: 'An array of exactly 4 short, clever hints for the word, ordered from most cryptic to most obvious.',
                items: {
                  type: Type.STRING,
                },
              },
            },
            required: ['word', 'hints'],
          }
        },
        temperature: 0.9,
      },
    });

    const jsonString = response.text.trim();
    const parsedData = JSON.parse(jsonString) as HangmanData[];
    
    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      console.error("Invalid data format received from AI (not an array):", parsedData);
      throw new Error("Invalid data format from AI.");
    }

    const validatedData = parsedData.map(game => {
        if (!game.word || !game.hints || !Array.isArray(game.hints) || game.hints.length === 0 || /[^A-Z\s]/.test(game.word.toUpperCase())) {
            console.error("Invalid game data format within array from AI:", game);
            return null;
        }
        return {
            ...game,
            word: game.word.toUpperCase(),
        };
    }).filter((g): g is HangmanData => g !== null);

    if(validatedData.length === 0) {
        throw new Error("AI returned an array of invalid games.");
    }

    return validatedData;

  } catch (error) {
    console.error('Error generating multiple hangman games from Gemini:', error);
    return []; 
  }
};
