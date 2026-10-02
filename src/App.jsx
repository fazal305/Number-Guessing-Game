import { useEffect, useRef, useState } from 'react';
import { useGame } from './game/useGame.js';
import { attemptsLeft } from './game/engine.js';
import RangeMeter from './components/RangeMeter.jsx';
import GuessForm from './components/GuessForm.jsx';
import Feedback from './components/Feedback.jsx';
import AttemptCounter from './components/AttemptCounter.jsx';
import ResultPanel from './components/ResultPanel.jsx';
import GuessHistory from './components/GuessHistory.jsx';
import SettingsDialog from './components/SettingsDialog.jsx';

export default function App() {
  const { game, feedback, error, round, settings, guess, clearError, newGame } = useGame();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsButton = useRef(null);
  const guessInput = useRef(null);
  const isOver = game.status !== 'playing';
  const announcement = feedback ? `Guess ${feedback.attempt}: ${feedback.value}. ${feedback.message}` : '';

  // Focus the guess field when a new round starts, and on first load only for
  // pointer devices so phones don't open the keyboard unprompted.
  useEffect(() => {
    if (round > 1 || window.matchMedia('(pointer: fine)').matches) guessInput.current?.focus();
  }, [round]);

  return (
    <>
      <a className="skip-link" href="#play">Skip to game</a>
      <header className="site-header">
        <div className="wrap site-header__inner">
          <p className="wordmark">
            <span className="wordmark__mark" aria-hidden="true">?</span>
            Guess the Number
          </p>
          <button
            ref={settingsButton}
            type="button"
            className="btn btn--ghost"
            onClick={() => setSettingsOpen(true)}
            aria-haspopup="dialog"
          >
            Settings
          </button>
        </div>
      </header>

      <main id="play" className="wrap layout">
        <section className="card play" aria-labelledby="play-title">
          <div className="play__intro">
            <h1 id="play-title" className="play__title">
              I&rsquo;m thinking of a number between{' '}
              <span className="num">{game.min}</span> and <span className="num">{game.max}</span>.
            </h1>
            <p className="play__rules">
              {game.maxAttempts === null
                ? 'Guess it in as few attempts as you can. Each hint tells you whether to go higher or lower.'
                : `You have ${game.maxAttempts} attempts. Each hint tells you whether to go higher or lower.`}
            </p>
          </div>

          <RangeMeter game={game} />

          {isOver ? (
            <ResultPanel key={round} game={game} onReplay={() => newGame(settings)} />
          ) : (
            <>
              <GuessForm key={round} inputRef={guessInput} game={game} error={error} onGuess={guess} onInput={clearError} />
              <Feedback feedback={feedback} />
            </>
          )}

          <div className="play__footer">
            <AttemptCounter attempts={game.attempts} maxAttempts={game.maxAttempts} left={attemptsLeft(game)} />
            {!isOver && game.attempts > 0 && (
              <button type="button" className="btn btn--link" onClick={() => newGame(settings)}>
                Restart with a new number
              </button>
            )}
          </div>
        </section>

        <GuessHistory guesses={game.guesses} />
      </main>

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>

      <footer className="site-footer">
        <div className="wrap site-footer__inner">
          <p>Runs entirely in your browser. No accounts, cookies, or tracking.</p>
          <p>
            Prefer the terminal? Run <code>npm run cli</code> from the{' '}
            <a href="https://github.com/fazal305/Number-Guessing-Game">source code</a>.
          </p>
        </div>
      </footer>

      <SettingsDialog
        open={settingsOpen}
        settings={settings}
        inProgress={!isOver && game.attempts > 0}
        onClose={(applied) => {
          setSettingsOpen(false);
          if (applied) requestAnimationFrame(() => guessInput.current?.focus());
          else settingsButton.current?.focus();
        }}
        onApply={newGame}
      />
    </>
  );
}
