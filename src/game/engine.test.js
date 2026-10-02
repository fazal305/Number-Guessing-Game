import { describe, expect, it } from 'vitest';
import {
  MESSAGES,
  attemptsLeft,
  createGame,
  optimalAttempts,
  parseGuess,
  submitGuess,
} from './engine.js';
import { randomInt } from './random.js';

const fixed = (secret) => () => secret;

describe('createGame', () => {
  it('defaults to 1–100 with no limit and zero attempts', () => {
    const game = createGame(undefined, fixed(42));
    expect(game).toMatchObject({ min: 1, max: 100, maxAttempts: null, attempts: 0, status: 'playing', secret: 42 });
    expect(game.guesses).toEqual([]);
  });

  it('rejects invalid settings', () => {
    expect(() => createGame({ min: 10, max: 10 })).toThrow(RangeError);
    expect(() => createGame({ maxAttempts: 0 })).toThrow(RangeError);
  });

  it('produces different secrets across games', () => {
    const secrets = new Set(Array.from({ length: 50 }, () => createGame().secret));
    expect(secrets.size).toBeGreaterThan(1);
  });
});

describe('randomInt', () => {
  it('stays within bounds, including both ends', () => {
    const seen = new Set();
    for (let i = 0; i < 2000; i++) {
      const n = randomInt(1, 5);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(5);
      seen.add(n);
    }
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('rejects values in the biased tail', () => {
    const values = [0xffffffff, 7];
    const n = randomInt(1, 10, (buf) => { buf[0] = values.shift(); });
    expect(n).toBe(8);
    expect(values).toHaveLength(0);
  });
});

describe('parseGuess', () => {
  const game = createGame({ min: 1, max: 100 }, fixed(50));

  it.each(['abc', '12a', '4.5', '1e3', '0x10', '#', '--3', '1 2', '½'])('rejects %j as not an integer', (raw) => {
    expect(parseGuess(raw, game)).toMatchObject({ ok: false, error: 'notInteger' });
  });

  it('rejects empty input', () => {
    expect(parseGuess('   ', game)).toMatchObject({ ok: false, error: 'empty' });
  });

  it.each(['0', '101', '-5', '99999999999999999999'])('rejects %j as out of range', (raw) => {
    expect(parseGuess(raw, game)).toMatchObject({ ok: false, error: 'outOfRange' });
  });

  it('accepts trimmed integers', () => {
    expect(parseGuess(' 42 ', game)).toEqual({ ok: true, value: 42 });
    expect(parseGuess('+7', game)).toEqual({ ok: true, value: 7 });
  });

  it('rejects a number already guessed', () => {
    const { game: next } = submitGuess(game, 30);
    expect(parseGuess('30', next)).toMatchObject({ ok: false, error: 'duplicate' });
  });
});

describe('submitGuess', () => {
  it('gives high/low hints, counts attempts and narrows the range', () => {
    let game = createGame({ min: 1, max: 100 }, fixed(37));
    let step = submitGuess(game, 50);
    expect(step).toMatchObject({ result: 'high', message: MESSAGES.high });
    game = step.game;
    step = submitGuess(game, 20);
    expect(step).toMatchObject({ result: 'low', message: MESSAGES.low });
    expect(step.game).toMatchObject({ attempts: 2, low: 21, high: 49, status: 'playing' });
  });

  it('wins on the correct guess and reports the attempt count', () => {
    let game = createGame({ min: 1, max: 100 }, fixed(37));
    game = submitGuess(game, 50).game;
    const step = submitGuess(game, 37);
    expect(step.result).toBe('correct');
    expect(step.game.status).toBe('won');
    expect(step.message).toBe('Correct! You found it in 2 attempts.');
    expect(() => submitGuess(step.game, 1)).toThrow();
  });

  it('loses when the attempt limit is reached and reveals the secret', () => {
    let game = createGame({ min: 1, max: 100, maxAttempts: 2 }, fixed(37));
    game = submitGuess(game, 10).game;
    expect(attemptsLeft(game)).toBe(1);
    const step = submitGuess(game, 90);
    expect(step.game.status).toBe('lost');
    expect(step.message).toBe(MESSAGES.lost(37));
  });

  it('a correct guess on the final allowed attempt is a win', () => {
    let game = createGame({ min: 1, max: 100, maxAttempts: 2 }, fixed(37));
    game = submitGuess(game, 10).game;
    expect(submitGuess(game, 37).game.status).toBe('won');
  });

  it('does not mutate the previous state', () => {
    const game = createGame(undefined, fixed(5));
    submitGuess(game, 9);
    expect(game.attempts).toBe(0);
    expect(game.guesses).toEqual([]);
  });

  it('responds well under 50 ms', () => {
    const game = createGame(undefined, fixed(5));
    const start = performance.now();
    for (let i = 0; i < 1000; i++) submitGuess(game, parseGuess('77', game).value);
    expect((performance.now() - start) / 1000).toBeLessThan(50);
  });
});

describe('optimalAttempts', () => {
  it('matches binary search worst case', () => {
    expect(optimalAttempts(1, 100)).toBe(7);
    expect(optimalAttempts(1, 1000)).toBe(10);
    expect(optimalAttempts(1, 10)).toBe(4);
  });
});
