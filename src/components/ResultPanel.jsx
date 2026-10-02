import { MESSAGES, optimalAttempts } from '../game/engine.js';

function strategyNote({ status, attempts, maxAttempts, min, max }) {
  const par = optimalAttempts(min, max);
  if (status === 'won') {
    return attempts <= par
      ? `Halving the range every time needs at most ${par} guesses here. You matched it.`
      : `Halving the range every time needs at most ${par} guesses here.`;
  }
  return maxAttempts >= par
    ? `With ${maxAttempts} attempts, halving the remaining range every guess always finds it.`
    : `This range needs up to ${par} guesses even with perfect halving, so ${maxAttempts} takes some luck.`;
}

export default function ResultPanel({ game, onReplay }) {
  const won = game.status === 'won';
  return (
    <div className={`result result--${game.status}`}>
      <p className="result__eyebrow">{won ? 'You got it' : 'Game over'}</p>
      <p className="result__secret num" aria-hidden="true">
        {game.secret}
      </p>
      <h2 id="result-title" className="result__title">
        {won ? MESSAGES.won(game.attempts) : MESSAGES.lost(game.secret)}
      </h2>
      <p id="result-note" className="result__note">
        {strategyNote(game)}
      </p>
      <button type="button" className="btn btn--primary" onClick={onReplay} autoFocus aria-describedby="result-title result-note">
        Play again
      </button>
    </div>
  );
}
