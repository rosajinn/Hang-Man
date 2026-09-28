import { useCallback, useEffect, useState } from "react";
import words from "./wordList.json";
import { HangmanWord } from "./HangmanWord";
import { Keyboard } from "./Keyboard";
import { HangmanDrawing } from "./HangmanDrawing";
import ReactConfetti from "react-confetti";

function getWord() {
  return words[Math.floor(Math.random() * words.length)];
}
function getRandomUnrevealedLetter(
  word: string,
  guessed: string[],
): string | null {
  const unrevealed = word
    .split("")
    .filter((letter) => !guessed.includes(letter));
  if (unrevealed.length === 0) return null;
  const index = Math.floor(Math.random() * unrevealed.length);
  return unrevealed[index];
}

const overlayStyle = {
  position: "fixed" as const,
  inset: 0,
  backgroundColor: "rgba(228, 187, 187, 0)",
  zIndex: 9998,
  height: "screen",
};

export function App() {
  const [wordToGuess, setWordToGuess] = useState(getWord);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [hintUsed, setHintUsed] = useState(false);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [hintCount, setHintCount] = useState(0);

  // Score
  const [score, setScore] = useState<number>(0);

  //  Game State
  const [over, setOver] = useState(false);
  const [win, setWin] = useState(false);

  const MaxHint = 2;
  const MaxWrongGuess = 6;

  const incorrectLetters = guessedLetters.filter(
    (letter) => !wordToGuess.includes(letter),
  );

  const isLoser = incorrectLetters.length >= MaxWrongGuess;
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
  // Keyboard input
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
      setHintUsed(false);
    };
    document.addEventListener("keypress", handler);

    return () => {
      document.removeEventListener("keypress", handler);
    };
  }, []);

  // show hint whenever and unlimited
  const revealLetter = () => {
    if (isWinner || isLoser) return;
    const hintLetter = getRandomUnrevealedLetter(wordToGuess, guessedLetters);

    if (hintCount < MaxHint) {
      setHintCount((prev) => prev + 1);
    }

    if (hintLetter) {
      setCurrentHint(hintLetter);
      setHintUsed(true);
      setGuessedLetters((current) => [...current, hintLetter]);
    }
  };

  // Check win or lose
  useEffect(() => {
    if (isWinner && !over && !win) {
      setScore((prev) => {
        const newScore = prev + 1;
        localStorage.setItem("hangmanScore", newScore.toString());
        return newScore;
      });
      setOver(true);
      setWin(true);
    } else if (isLoser) {
      setScore(0);
      setOver(true);
      setWin(false);
    }
  }, [isWinner, isLoser, over]);

  // Next Round
  const nextRound = () => {
    setWordToGuess(getWord());
    setGuessedLetters([]);
    setHintUsed(false);
    setCurrentHint(null);
    setHintCount(0);
    setOver(false);
    setWin(false);
  };
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
        backgroundColor: "black",
        padding: "30px",
      }}
    >
      {/* Confetti */}
      {win && (
        <ReactConfetti
          style={{ alignContent: "center" }}
          recycle={false}
          numberOfPieces={700}
        />
      )}
      <div
        style={{
          position: "absolute",
          color: "white",
          width: "1400px",
          top: "30px",
        }}
      >
        Score: {score}
      </div>
      {/* Winner/Loser */}

      <HangmanDrawing numberOfGuesses={incorrectLetters.length} />
      <HangmanWord
        reveal={isLoser}
        guessedLetters={guessedLetters}
        wordToGuess={wordToGuess}
      />

      {/* Hint and Keyboard Button */}
      <div
        style={{
          alignSelf: "stretch",
        }}
      >
        <div style={{ margin: "20px" }}>
          <button
            onClick={revealLetter}
            disabled={hintCount >= MaxHint || isWinner || isLoser}
          >
            💡Get Hint ({MaxHint - hintCount} left)
          </button>
          {hintUsed && <span> Hint used this round</span>}
          {currentHint && <p>Revealed letter: {currentHint}</p>}
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

      {/* Win */}
      {over && win && (
        <div style={overlayStyle}>
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "ligtblue",
              padding: "30px",
              borderRadius: "10px",
              boxShadow: "0 0 15px rgba (0,0,0,0.3)",
              textAlign: "center",
              zIndex: 9999,
            }}
          >
            <p
              style={{ color: "green", fontSize: "1.5rem", fontWeight: "bold" }}
            >
              ✅ You guessed the word!
            </p>
            <button
              onClick={nextRound}
              style={{
                padding: "10px 20px",
                fontSize: "1rem",
                background: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "poiter",
                marginTop: "10px",
              }}
            >
              Next Round
            </button>
          </div>
        </div>
      )}
      {/* Lose */}
      {over && !win && (
        <div style={overlayStyle}>
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "none",
              padding: "30px",
              borderRadius: "10px",
              boxShadow: "0 0 15px rgba (0,0,0,0.3)",
              textAlign: "center",
              zIndex: 9999,
            }}
          >
            <p
              style={{
                color: "lightyellow",
                fontSize: "1.5rem",
                fontWeight: "bold",
              }}
            >
              You Lose!
            </p>
            <button
              onClick={nextRound}
              style={{
                padding: "10px 20px",
                fontSize: "1rem",
                background: "#d83114",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "poiter",
                marginTop: "10px",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
