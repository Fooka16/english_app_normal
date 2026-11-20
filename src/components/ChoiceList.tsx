export function ChoiceList({
  choices,
  picked,
  correct,
  onPick,
}: {
  choices: string[]
  picked: string | null
  correct: string
  onPick: (choice: string) => void
}) {
  const letters = ['A', 'B', 'C']
  return (
    <div className="choices" role="listbox" aria-label="選択肢">
      {choices.map((choice, index) => {
        const isCorrect = picked !== null && choice === correct
        const isWrong = picked !== null && choice === picked && choice !== correct
        return (
          <button
            key={choice}
            type="button"
            className={`choice${isCorrect ? ' is-correct' : ''}${isWrong ? ' is-wrong' : ''}`}
            onClick={() => onPick(choice)}
            disabled={picked !== null}
            aria-pressed={picked === choice}
          >
            <span className="choice-letter">{letters[index]}</span>
            <span>{choice}</span>
          </button>
        )
      })}
    </div>
  )
}
