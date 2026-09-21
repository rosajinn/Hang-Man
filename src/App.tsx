import { useState } from "react"
import word from "./wordList.json"

export function App () { 

  const [ wordToGuess, setWordToGuess ] = useState(() => {
    return word[Math.floor(Math.random() * word.length)]
  })
  const [guessedLetters, setGuessedLetters] = useState<string[]>([])

  console.log(wordToGuess)


  return(
  <div style = {{
    maxWidth: "800px",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    margin: "0 auto",
    fontSize: "2rem",
    textAlign: "center" 
  }}>
      <div style = {{
        fontSize: "1.5rem",
        textAlign: "center"
      }}>
        Lose
        Win 
      </div>
  </div>
  )
}