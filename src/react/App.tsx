import React, { useEffect, useState } from 'react'

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
  setGuess: (char: string) => void
  backspace: () => void
  submitGuess: () => void
  guessedLetters: Map<string, Matches>
}> = ({ setGuess, backspace, submitGuess, guessedLetters }) => {
  return (
    <div className="justify-center align-center flex-col">
      <div className="flex mb-2 justify-center">
        {'qwertyuiop'.split('').map((char) => {
          return (
            <Key
              key={char}
              onClick={() => setGuess(char)}
              guessState={guessedLetters.get(char) ?? null}
            >
              {char}
            </Key>
          )
        })}
      </div>
      <div className="flex mb-2 justify-center">
        {'asdfghjkl'.split('').map((char) => {
          return (
            <Key
              key={char}
              onClick={() => setGuess(char)}
              guessState={guessedLetters.get(char) ?? null}
            >
              {char}
            </Key>
          )
        })}
      </div>
      <div className="flex justify-center">
        <Key onClick={() => submitGuess()}>enter</Key>
        {'zxcvbnm'.split('').map((char) => {
          return (
            <Key
              key={char}
              onClick={() => setGuess(char)}
              guessState={guessedLetters.get(char) ?? null}
            >
              {char}
            </Key>
          )
        })}
        <Key onClick={() => backspace()}>⬅️</Key>
      </div>
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
      {children}
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

enum Matches {
  NO_MATCH = 0,
  WRONG_POSITION = 1,
  MATCH = 2,
}

const GameEndModal: React.FC<{
  isVisible: boolean
  isWinner: boolean
  onClose: () => void
}> = ({ isVisible, onClose }) => {
  return (
    <div
      id="popup-modal"
      tabIndex={-1}
      className={`${
        !isVisible ? 'hidden' : null
      } overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 md:inset-0 h-modal md:h-full`}
    >
      <div className="relative p-4 w-full max-w-md h-full mx-auto top-[25%]">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <button
            className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
            onClick={onClose}
          >
            <svg
              aria-hidden="true"
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span className="sr-only">Close modal</span>
          </button>
          <div className="p-6 text-center">
            <svg
              aria-hidden="true"
              className="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Game Over
            </h3>
            <button
              onClick={onClose}
              className="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const word = 'FUNKY'.toLowerCase()
  const [guessHistory, setGuessHistory] = useState<
    Array<{ matches: Matches[]; guess: string }>
  >([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [guessedLetters, setGuessedLetters] = useState(
    new Map<string, Matches>()
  )
  const [modalOpen, setModalOpen] = useState(false)

  const checkLetters = (guess: string) => {
    const guessedLetters = guess.split('')
    const hintedLetters = []
    return guess.split('').map((char, index) => {
      const position = word.indexOf(char)
      hintedLetters.push(char)
      if (position == index) {
        return Matches.MATCH
      }
      if (position >= 0) {
        const guessedCount = guessedLetters.filter((l) => l == char).length
        const wordCount = word.split('').filter((l) => l == char).length

        return guessedCount > wordCount
          ? Matches.NO_MATCH
          : Matches.WRONG_POSITION
      }
      return Matches.NO_MATCH
    })
  }

  const setGuessValidated = (char: string) => {
    console.log('sgv', currentGuess, char)
    setCurrentGuess((guess) => (guess + char).slice(0, 5))
  }

  const backspace = () => {
    setCurrentGuess((guess) => guess.slice(0, -1))
  }

  const totalGuesses = guessHistory.length

  const submitGuess = () => {
    console.log('submitGuess', currentGuess)
    if (currentGuess.length == 5) {
      const result = checkLetters(currentGuess)

      setGuessedLetters((guessedLetters) => {
        currentGuess.split('').forEach((char, i) => {
          guessedLetters.set(char, result[i])
        })
        return guessedLetters
      })
      setGuessedLetters(guessedLetters)
      setGuessHistory((guessHistory) => {
        return [...guessHistory, { guess: currentGuess, matches: result }]
      })
      // We are on the final guess
      if (totalGuesses == 5) {
        setModalOpen(true)
      }
      if (result.every((r) => r === Matches.MATCH)) {
        setModalOpen(true)
      }
      setCurrentGuess('')
    }
  }

  const keyPress = (e: KeyboardEvent) => {
    if (/^[a-z]$/i.test(e.key)) {
      return setGuessValidated(e.key.toLowerCase())
    }
    if (modalOpen) {
      if (e.key === 'Escape' || e.key === 'Enter') {
        return resetGame()
      }
    }
    if (e.key == 'Enter') {
      return submitGuess()
    }
    if (e.key === 'Backspace') {
      return backspace()
    }
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
    setGuessHistory([])
    setGuessedLetters(new Map())
  }

  const rows = []
  for (let i = 0; i < 6; i++) {
    let letters = ''
    let matches = null
    if (i === totalGuesses) {
      letters = currentGuess
    }
    if (i < totalGuesses) {
      letters = guessHistory[i].guess
      matches = guessHistory[i].matches
    }
    rows.push(<Row letters={letters} matches={matches} />)
  }

  return (
    <div className="max-w-[350px]">
      <div className="grid grid-cols-5 gap-1 mb-2 justify-items-center">
        {rows}
      </div>
      <Keyboard
        guessedLetters={guessedLetters}
        setGuess={setGuessValidated}
        submitGuess={submitGuess}
        backspace={backspace}
      />
      <GameEndModal isVisible={modalOpen} onClose={resetGame} isWinner />
    </div>
  )
}

export default App
