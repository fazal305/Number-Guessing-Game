export default function RangeMeter({ game }) {
  const { min, max, guesses, status } = game;
  // Once the game ends, the window collapses onto the secret.
  const [low, high] = status === 'playing' ? [game.low, game.high] : [game.secret, game.secret];
  const span = max - min + 1;
  const pct = (n) => ((n - min) / span) * 100;
  const remaining = high - low + 1;
  const label = status === 'playing' ? `Still possible: ${low} to ${high}` : `The number was ${game.secret}`;

  return (
    <div className="meter">
      <div className="meter__head">
        <p className="meter__label">{label}</p>
        {status === 'playing' && (
          <p className="meter__count">
            {remaining} {remaining === 1 ? 'number' : 'numbers'} left
          </p>
        )}
      </div>
      <div className="meter__track" aria-hidden="true">
        <div
          className={`meter__window meter__window--${status}`}
          style={{ left: `${pct(low)}%`, width: `${(remaining / span) * 100}%` }}
        />
        {guesses.map((g) => (
          <span
            key={g.value}
            className={`meter__tick meter__tick--${g.result}`}
            style={{ left: `${pct(g.value) + 50 / span}%` }}
          />
        ))}
      </div>
      <div className="meter__scale" aria-hidden="true">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
