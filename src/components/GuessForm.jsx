import { useState } from 'react';
import { parseGuess } from '../game/engine.js';

export default function GuessForm({ game, error, onGuess, onInput, inputRef }) {
  const [value, setValue] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const parsed = parseGuess(value, game);
    onGuess(value);
    if (parsed.ok) setValue('');
    else inputRef.current?.select();
    inputRef.current?.focus();
  }

  return (
    <form className="guess" onSubmit={handleSubmit} noValidate>
      <label htmlFor="guess-input" className="guess__label">
        Your guess
      </label>
      <div className="guess__row">
        <input
          ref={inputRef}
          id="guess-input"
          className="guess__input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          enterKeyHint="go"
          placeholder={`${game.min}–${game.max}`}
          value={value}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'guess-error' : 'guess-hint'}
          onChange={(e) => {
            setValue(e.target.value);
            onInput();
          }}
        />
        <button type="submit" className="btn btn--primary guess__submit">
          Guess
        </button>
      </div>
      {error ? (
        <p id="guess-error" className="guess__error" role="alert">
          {error}
        </p>
      ) : (
        <p id="guess-hint" className="guess__hint">
          Whole numbers from {game.min} to {game.max}. Invalid entries don&rsquo;t cost an attempt.
        </p>
      )}
    </form>
  );
}
