import { useCallback, useEffect, useState } from "react";
import words from "./wordList.json";
import { HangmanWord } from "./HangmanWord";
import { Keyboard } from "./Keyboard";
import { HangmanDrawing } from "./HangmanDrawing";

function getWord() {
  return words[Math.floor(Math.random() * words.length)];
}
function getRandomUnrevealedLetter(word: string, guessed: string[]): string | null {
  const unrevealed = word.split("").filter((letter) => !guessed.includes(letter));
  if (unrevealed.length === 0) return null;
  const index = Math.floor(Math.random() * unrevealed.length);
  return unrevealed[index]
}

export function App() {
  const [wordToGuess, setWordToGuess] = useState(getWord);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [hintUsed, setHintUsed] = useState(false)
  const [currentHint, setCurrentHint] = useState<string | null> (null)
  const [hintCount, setHintCount] = useState(0)


  const incorrectLetters = guessedLetters.filter(
    (letter) => !wordToGuess.includes(letter),
  );

  const isLoser = incorrectLetters.length >= 6;
  const isWinner = wordToGuess
    .split("")
    .every((letter) => guessedLetters.includes(letter));

  const addGuessedLetter = useCallback(
    (letter: string) => {
      if (guessedLetters.includes(letter) || isLoser || isWinner) return;

      setGuessedLetters((currentLetters) => [...currentLetters, letter]);
    },
    [guessedLetters, isLoser, isWinner],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key;

      if (!key.match(/^[a-z]$/)) return;

      e.preventDefault();
      addGuessedLetter(key);
    };
    document.addEventListener("keypress", handler);

    return () => {
      document.removeEventListener("keypress", handler);
    };
  }, [guessedLetters, addGuessedLetter]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key;

      if (key !== "Enter") return;
      e.preventDefault();
      setGuessedLetters([]);
      setWordToGuess(getWord());
      setHintUsed(false)
    };
    document.addEventListener("keypress", handler);

    return () => {
      document.removeEventListener("keypress", handler);
    };
  }, []);

  const MaxHint = 2;

  
  // const handleHint = () => {
  //   if (hintCount < MaxHint) {
  //     setCurrentHint(words[hintCount])
  //     setHintCount((prev) => prev +1)
  //   }
  // }
  // show hint whenever and unlimited
  const revealLetter =() => {
    if ( isWinner || isLoser) return;
    const hintLetter = getRandomUnrevealedLetter(wordToGuess, guessedLetters)

    if (hintCount < MaxHint) {
      setCurrentHint(words[hintCount])
      setHintCount((prev) => prev +1)
    }
    
    if (hintLetter){
    setGuessedLetters((current) => [...current, hintLetter]) 
    }
  }
  return (
    <div                                                                  
      style={{
        maxWidth: "800px",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        margin: "0 auto",
        fontSize: "2rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "1.5rem",
          textAlign: "center",
        }}
      >
        {isWinner && "Winner! -Refresh to try again "}
        {isLoser && "Nice Try -Refresh to try again "}
      </div>
      <HangmanDrawing numberOfGuesses={incorrectLetters.length} />
      <HangmanWord
        reveal={isLoser}
        guessedLetters={guessedLetters}
        wordToGuess={wordToGuess}
      />
      <div
        style={{
          alignSelf: "stretch",
        }}
      >
      <div style={{ margin: "20px" }}>
        <button
          onClick={revealLetter}
          disabled={ hintCount >= MaxHint || isWinner || isLoser}
        >
          💡Get Hint ({MaxHint - hintCount} left)
        </button>
      </div>
        <Keyboard
          activeLetter={guessedLetters.filter((letter) =>
            wordToGuess.includes(letter),
          )}
          inactiveLetter={incorrectLetters}
          addGuessedLetter={addGuessedLetter}
          disabled={isLoser || isWinner}
        />
      </div>
    </div>
  );
}

