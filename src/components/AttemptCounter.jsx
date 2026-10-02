export default function AttemptCounter({ attempts, maxAttempts, left }) {
  return (
    <div className="counter">
      <p className="counter__text">
        <span className="counter__label">Attempts</span>{' '}
        <span className="counter__value num">{attempts}</span>
        {maxAttempts !== null && <span className="counter__of"> of {maxAttempts}</span>}
      </p>
      {maxAttempts !== null && (
        <>
          <ol className="counter__pips" aria-hidden="true">
            {Array.from({ length: maxAttempts }, (_, i) => (
              <li key={i} className={i < attempts ? 'is-used' : undefined} />
            ))}
          </ol>
          <p className={`counter__left${left <= 2 && left > 0 ? ' is-low' : ''}`}>
            {left} {left === 1 ? 'attempt' : 'attempts'} left
          </p>
        </>
      )}
    </div>
  );
}
