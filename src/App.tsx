import { useCallback, useEffect, useState } from "react";
import words from "./wordList.json";
import { HangmanWord } from "./HangmanWord";
import { Keyboard } from "./Keyboard";
import { HangmanDrawing } from "./HangmanDrawing";

 function getWord() {
     return words[Math.floor(Math.random() * words.length)];
  }

export function App() {
  const [wordToGuess, setWordToGuess] = useState(getWord) 
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);

  const incorrectLetters = guessedLetters.filter(
    (letter) => !wordToGuess.includes(letter),
  );

  const isLoser = incorrectLetters.length >= 6
  const isWinner = wordToGuess
  .split("")
  .every(letter => guessedLetters.includes(letter))


  const addGuessedLetter = useCallback((letter: string) => {
    if (guessedLetters.includes(letter) || isLoser || isWinner) return;

    setGuessedLetters((currentLetters) => [...currentLetters, letter]);
  }, [guessedLetters, isLoser, isWinner])


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
  }, [guessedLetters]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key;

      if (key !== "Enter") return;
      e.preventDefault()
      setGuessedLetters([])
      setWordToGuess(getWord())
    }
    document.addEventListener("keypress", handler);

    return () => {
      document.removeEventListener("keypress", handler);
    };
  }, [guessedLetters]);

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
      <HangmanWord reveal={isLoser} guessedLetters={guessedLetters} wordToGuess={wordToGuess} />
      <div
        style={{
          alignSelf: "stretch",
        }}
      >
        <Keyboard activeLetter = {guessedLetters.filter(letter => 
          wordToGuess.includes(letter)
        )}
        inactiveLetter = {incorrectLetters}
        addGuessedLetter = {addGuessedLetter}
        disabled = {isLoser || isWinner}  />
      </div>
    </div>
  );
}
