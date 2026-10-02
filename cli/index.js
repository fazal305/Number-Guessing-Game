#!/usr/bin/env node
import { createInterface } from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
import { parseArgs } from 'node:util';
import { attemptsLeft, createGame, parseGuess, submitGuess } from '../src/game/engine.js';

const HELP = `Number Guessing Game

Usage: npm run cli -- [--max <n>] [--limit <n>]

  --max <n>     Highest possible number (default 100, range starts at 1)
  --limit <n>   Maximum attempts before you lose (default: unlimited)
  --help        Show this message

Type "q" at any prompt to quit.`;

function readSettings() {
  const { values } = parseArgs({
    options: {
      max: { type: 'string', default: '100' },
      limit: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  if (values.help) {
    console.log(HELP);
    process.exit(0);
  }
  const max = Number(values.max);
  const maxAttempts = values.limit === undefined ? null : Number(values.limit);
  if (!Number.isSafeInteger(max) || max < 2) throw new Error('--max must be a whole number of at least 2.');
  if (maxAttempts !== null && (!Number.isSafeInteger(maxAttempts) || maxAttempts < 1)) {
    throw new Error('--limit must be a whole number of at least 1.');
  }
  return { min: 1, max, maxAttempts };
}

async function main() {
  let settings;
  try {
    settings = readSettings();
  } catch (err) {
    console.error(`Error: ${err.message}\n\n${HELP}`);
    process.exit(1);
  }

  const rl = createInterface({ input, output, terminal: input.isTTY });
  // The async iterator buffers lines, so piped input isn't dropped between prompts.
  const lines = rl[Symbol.asyncIterator]();
  const quit = () => {
    console.log('\nBye!');
    process.exit(0);
  };
  const ask = async (prompt) => {
    output.write(prompt);
    const { value, done } = await lines.next();
    if (done) quit();
    const answer = value.trim();
    if (!input.isTTY) output.write(`${answer}\n`);
    if (answer.toLowerCase() === 'q') quit();
    return answer;
  };

  for (;;) {
    let game = createGame(settings);
    const limitText = game.maxAttempts === null ? '' : ` You have ${game.maxAttempts} attempts.`;
    console.log(`\nI'm thinking of a number between ${game.min} and ${game.max}.${limitText}`);

    while (game.status === 'playing') {
      const left = attemptsLeft(game);
      const prefix = left === null ? `#${game.attempts + 1}` : `#${game.attempts + 1} (${left} left)`;
      const parsed = parseGuess(await ask(`${prefix} Your guess: `), game);
      if (!parsed.ok) {
        console.log(`  ${parsed.message}`);
        continue;
      }
      const step = submitGuess(game, parsed.value);
      game = step.game;
      console.log(`  ${step.message}`);
    }

    const again = await ask('\nPlay again? (y/n): ');
    if (!/^y(es)?$/i.test(again)) break;
  }
  quit();
}

main();
