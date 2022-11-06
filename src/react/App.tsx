import React, { useEffect, useState } from 'react'
import GameEndModal from './GameEndModal'

const KEY_BACKSPACE = 'Backspace'
const KEY_ENTER = 'Enter'
const KEY_ESCAPE = 'Escape'

enum Matches {
  NO_MATCH = 0,
  WRONG_POSITION = 1,
  MATCH = 2,
}

const Key: React.FC<{
  children: string
  onClick: () => void
  guessState?: Matches | null
}> = ({ children, onClick, guessState }) => {
  let bg = 'bg-slate-400'
  if (guessState === Matches.MATCH) {
    bg = 'bg-green-500'
  }
  if (guessState === Matches.WRONG_POSITION) {
    bg = 'bg-yellow-500'
  }
  if (guessState === Matches.NO_MATCH) {
    bg = 'bg-slate-700'
  }
  return (
    <button
      onClick={onClick}
      className={`uppercase p-4 ${bg} mr-2 rounded-md text-black hover:bg-slate-300 active:bg-slate-200`}
    >
      {children}
    </button>
  )
}

const Keyboard: React.FC<{
  handleKey: (char: string) => void
  guessedLetters: Map<string, Matches>
}> = ({ handleKey, guessedLetters }) => {
  const keyboard = [
    'qwertyuiop'.split(''),
    'asdfghjkl'.split(''),
    [KEY_ENTER, ...'zxcvbnm'.split(''), KEY_BACKSPACE],
  ]
  return (
    <div className="justify-center align-center flex-col">
      {keyboard.map((row, i) => {
        return (
          <div className="flex mb-2 justify-center">
            {row.map((key, i) => {
              return (
                <Key
                  key={key}
                  onClick={() => handleKey(key)}
                  guessState={guessedLetters.get(key) ?? null}
                >
                  {key}
                </Key>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

const Tile: React.FC<{ children: string; match: Matches | null }> = ({
  children,
  match,
}) => {
  let bg = 'bg-black'
  if (match === Matches.MATCH) {
    bg = 'bg-green-500'
  }
  if (match === Matches.WRONG_POSITION) {
    bg = 'bg-yellow-500'
  }

  return (
    <div
      className={`flex place-content-center w-16 h-16 ${bg} border-2 uppercase text-5xl font-bold items-center`}
    >
      <span style={{ textShadow: '2px 2px 4px black' }}>{children}</span>
    </div>
  )
}

const Row: React.FC<{ letters: string; matches: Matches[] | null }> = ({
  letters,
  matches,
}) => {
  const grid = [...letters.split(''), ' ', ' ', ' ', ' ', ' '].slice(0, 5)
  return (
    <>
      {grid.map((letter, index) => (
        <Tile key={index} match={matches?.[index] ?? null}>
          {letter}
        </Tile>
      ))}
    </>
  )
}

const getWord = () => {
  return 'OOPSY'.toLowerCase()
}

const findMatchingChars = (guess: string, word: string) => {
  const charsInWord = word.split('')
  const charsLeft = word.split('')
  const matches = new Array<Matches>(5).fill(Matches.NO_MATCH)
  charsInWord.forEach((char, i) => {
    if (guess[i] === char) {
      matches[i] = Matches.MATCH
      charsLeft[i] = '_'
    }
  })

  guess.split('').forEach((char, i) => {
    if (charsLeft.includes(char)) {
      matches[i] = Matches.WRONG_POSITION
      charsLeft[charsLeft.indexOf(char)] = '_'
    }
  })

  return matches
}

function App() {
  const word = getWord()
  const [isWinner, setIsWinner] = useState(false)
  const [gameHistory, setGameHistory] = useState({
    guessedLetters: new Map<string, Matches>(),
    guesses: new Array<{ matches: Matches[]; guess: string }>(),
  })
  const [currentGuess, setCurrentGuess] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const checkGuess = (guess: string) => {
    return findMatchingChars(guess, word)
  }

  const handleKey = (key: string) => {
    if (/^[a-z]$/i.test(key)) {
      setCurrentGuess((guess) => (guess + key).slice(0, 5))
    }

    if (KEY_BACKSPACE === key) {
      setCurrentGuess((guess) => guess.slice(0, -1))
    }

    if (KEY_ENTER === key) {
      submitGuess()
    }
  }

  const totalGuesses = gameHistory.guesses.length

  const submitGuess = () => {
    if (currentGuess.length != 5) {
      return
    }
    const result = checkGuess(currentGuess)

    setGameHistory((prevGuessHistory) => {
      return {
        guessedLetters: currentGuess.split('').reduceRight((map, char, i) => {
          if (map.get(char) !== Matches.MATCH) {
            map.set(char, result[i])
          }
          return map
        }, prevGuessHistory.guessedLetters),
        guesses: [
          ...prevGuessHistory.guesses,
          { guess: currentGuess, matches: result },
        ],
      }
    })

    // We are on the final guess
    if (totalGuesses == 5) {
      setModalOpen(true)
      setIsWinner(false)
    }
    if (result.every((r) => r === Matches.MATCH)) {
      setModalOpen(true)
      setIsWinner(true)
    }
    setCurrentGuess('')
  }

  const keyPress = (e: KeyboardEvent) => {
    if (modalOpen) {
      if (e.key === KEY_ENTER || e.key === KEY_ESCAPE) {
        return resetGame()
      }
      return
    }

    handleKey(e.key)
  }

  useEffect(() => {
    window.addEventListener('keydown', keyPress)

    return () => {
      window.removeEventListener('keydown', keyPress)
    }
  })

  const resetGame = () => {
    setModalOpen(false)
    setCurrentGuess('')
    setGameHistory({
      guessedLetters: new Map<string, Matches>(),
      guesses: new Array<{ matches: Matches[]; guess: string }>(),
    })
  }

  const rows = []
  for (let i = 0; i < 6; i++) {
    let letters = ''
    let matches = null
    if (i === totalGuesses) {
      letters = currentGuess
    }
    if (i < totalGuesses) {
      letters = gameHistory.guesses[i].guess
      matches = gameHistory.guesses[i].matches
    }
    rows.push(<Row letters={letters} matches={matches} />)
  }

  return (
    <div className="max-w-[350px]">
      <div className="grid grid-cols-5 gap-1 mb-2 justify-items-center">
        {rows}
      </div>
      <Keyboard
        guessedLetters={gameHistory.guessedLetters}
        handleKey={handleKey}
      />
      <GameEndModal
        isVisible={modalOpen}
        onClose={resetGame}
        isWinner={isWinner}
      />
    </div>
  )
}

export default App
