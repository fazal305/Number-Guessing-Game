import { useCallback, useReducer } from 'react';
import { DEFAULT_SETTINGS, createGame, parseGuess, submitGuess } from './engine.js';

const fresh = (game, round) => ({ game, feedback: null, error: null, round });

function reducer(state, action) {
  switch (action.type) {
    case 'guess': {
      if (state.game.status !== 'playing') return state;
      const parsed = parseGuess(action.raw, state.game);
      if (!parsed.ok) return { ...state, error: parsed.message };
      const step = submitGuess(state.game, parsed.value);
      return {
        ...state,
        game: step.game,
        error: null,
        feedback: { value: parsed.value, result: step.result, message: step.message, attempt: step.game.attempts },
      };
    }
    case 'clearError':
      return state.error ? { ...state, error: null } : state;
    case 'newGame':
      return fresh(action.game, state.round + 1);
    default:
      return state;
  }
}

// The secret is drawn outside the reducer so the reducer stays pure.
export function useGame(initialSettings = DEFAULT_SETTINGS) {
  const [state, dispatch] = useReducer(reducer, initialSettings, (s) => fresh(createGame(s), 1));
  const { min, max, maxAttempts } = state.game;
  return {
    ...state,
    settings: { min, max, maxAttempts },
    guess: useCallback((raw) => dispatch({ type: 'guess', raw }), []),
    clearError: useCallback(() => dispatch({ type: 'clearError' }), []),
    newGame: useCallback((settings) => dispatch({ type: 'newGame', game: createGame(settings) }), []),
  };
}
