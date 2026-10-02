const RESULT_LABEL = { high: 'Too high', low: 'Too low', correct: 'Correct' };

export default function GuessHistory({ guesses }) {
  return (
    <section className="card history" aria-labelledby="history-title">
      <h2 id="history-title" className="history__title">
        Guess log
      </h2>
      {guesses.length === 0 ? (
        <p className="history__empty">Your guesses and hints will appear here.</p>
      ) : (
        <ol className="history__list" reversed>
          {[...guesses].reverse().map((g) => (
            <li key={g.attempt} className={`history__item history__item--${g.result}`}>
              <span className="history__attempt">#{g.attempt}</span>
              <span className="history__value num">{g.value}</span>
              <span className="history__result">{RESULT_LABEL[g.result]}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
