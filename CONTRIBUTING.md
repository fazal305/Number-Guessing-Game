# Contributing

Thanks for taking an interest. Bug reports, small fixes, and accessibility improvements are especially welcome.

## Getting started

1. Fork the repository and create a branch from `main`.
2. Install dependencies with `npm install` (Node.js 20 or newer).
3. Run `npm run dev` and open the URL it prints.

## Before you open a pull request

Run the same checks CI runs:

```bash
npm run lint
npm test
npm run build
```

- Keep changes focused. One fix or feature per pull request.
- Game rules live in `src/game/engine.js` and are shared by the web app and the terminal version. Add or update tests in `src/game/engine.test.js` when you change them.
- Check new UI at a 375px-wide viewport and with keyboard-only navigation.
- Write plain, descriptive commit messages (for example, "Fix counter not resetting after replay").

## Reporting bugs

Open an issue using the bug report template. Include steps to reproduce, what you expected, and your browser or terminal. For security problems, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.

By contributing you agree that your work is released under the [MIT License](LICENSE) and that you will follow the [Code of Conduct](CODE_OF_CONDUCT.md).
