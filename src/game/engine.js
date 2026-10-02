import { randomInt } from './random.js';

export const DEFAULT_SETTINGS = Object.freeze({ min: 1, max: 100, maxAttempts: null });

export const RANGE_OPTIONS = Object.freeze([10, 50, 100, 500, 1000]);
export const ATTEMPT_LIMIT_OPTIONS = Object.freeze([null, 5, 7, 10, 15]);

export const MESSAGES = Object.freeze({
  high: 'Too high! Try again.',
  low: 'Too low! Try again.',
  empty: 'Enter a number to make a guess.',
  notInteger: 'Whole numbers only — no letters, symbols, or decimals.',
  outOfRange: (min, max) => `Pick a number between ${min} and ${max}.`,
  duplicate: (value) => `You already guessed ${value}. Try a different number.`,
  won: (attempts) => `Correct! You found it in ${attempts} ${attempts === 1 ? 'attempt' : 'attempts'}.`,
  lost: (secret) => `Out of attempts. The number was ${secret}.`,
});

export function validateSettings({ min, max, maxAttempts }) {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min >= max) {
    throw new RangeError('Range must be two integers with min < max.');
  }
  if (maxAttempts !== null && (!Number.isSafeInteger(maxAttempts) || maxAttempts < 1)) {
    throw new RangeError('Attempt limit must be a positive integer or null.');
  }
  return { min, max, maxAttempts };
}

export function createGame(settings = DEFAULT_SETTINGS, rng = randomInt) {
  const { min, max, maxAttempts } = validateSettings({ ...DEFAULT_SETTINGS, ...settings });
  return {
    min,
    max,
    maxAttempts,
    secret: rng(min, max),
    attempts: 0,
    guesses: [],
    // Narrowest range still consistent with the hints given so far.
    low: min,
    high: max,
    status: 'playing',
  };
}

const INTEGER_PATTERN = /^[+-]?\d+$/;

// Rejected input never touches the attempt counter (SRS 3.2).
export function parseGuess(raw, game) {
  const text = String(raw ?? '').trim();
  if (text === '') return { ok: false, error: 'empty', message: MESSAGES.empty };
  if (!INTEGER_PATTERN.test(text)) {
    return { ok: false, error: 'notInteger', message: MESSAGES.notInteger };
  }
  const value = Number(text);
  if (!Number.isSafeInteger(value) || value < game.min || value > game.max) {
    return { ok: false, error: 'outOfRange', message: MESSAGES.outOfRange(game.min, game.max) };
  }
  if (game.guesses.some((g) => g.value === value)) {
    return { ok: false, error: 'duplicate', message: MESSAGES.duplicate(value) };
  }
  return { ok: true, value };
}

export function compare(value, secret) {
  if (value > secret) return 'high';
  if (value < secret) return 'low';
  return 'correct';
}

export function submitGuess(game, value) {
  if (game.status !== 'playing') throw new Error('Game is already over.');

  const result = compare(value, game.secret);
  const attempts = game.attempts + 1;
  const guesses = [...game.guesses, { value, result, attempt: attempts }];

  let { low, high } = game;
  if (result === 'high') high = Math.min(high, value - 1);
  if (result === 'low') low = Math.max(low, value + 1);

  let status = 'playing';
  let message = MESSAGES[result];
  if (result === 'correct') {
    status = 'won';
    low = high = value;
    message = MESSAGES.won(attempts);
  } else if (game.maxAttempts !== null && attempts >= game.maxAttempts) {
    status = 'lost';
    message = MESSAGES.lost(game.secret);
  }

  return { game: { ...game, attempts, guesses, low, high, status }, result, message };
}

export function attemptsLeft(game) {
  return game.maxAttempts === null ? null : game.maxAttempts - game.attempts;
}

// Guesses a perfect binary search needs in the worst case; used as a par score.
export function optimalAttempts(min, max) {
  return Math.ceil(Math.log2(max - min + 2));
}
