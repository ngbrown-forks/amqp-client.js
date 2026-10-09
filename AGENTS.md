# amqp-client.js

AMQP 0-9-1 client library for Node.js and browsers. The source is TypeScript
ESM and the package has no runtime dependencies.

## Setup

- Requires Node.js 16 or later.
- Install dependencies with `npm install`. Its `prepare` lifecycle script also
  builds the package.
- RabbitMQ integration tests use the default local credentials at
  `amqp://127.0.0.1:5672` (`guest` / `guest`, vhost `/`).
- The repository's Docker environment, when available, can be started with
  `docker compose up -d`. It provides plain AMQP on 5672, AMQPS on 5671, and
  the WebSocket relay on 15670.

## Commands

```sh
npm run build          # Build ESM, CommonJS, declarations, and browser bundles
npm run format:check   # Check Prettier formatting
npm run format         # Apply Prettier formatting
npm run lint           # Run ESLint
npm run typecheck      # Run TypeScript without emitting files
npx vitest run test/<file>.ts  # Run one Node test file
npm run test:local     # Run the non-TLS local integration suite with coverage
npm test               # Run all Node tests with coverage
```

Prefer targeted Vitest runs or `npm run test:local` during development. The
full suite includes `test/tls.ts`, which requires an AMQPS listener on port 5671. `AMQPS_URL` overrides the URL in the first TLS test, but the batch-send
test currently uses `amqps://localhost?insecure=1` directly.

Browser tests require Playwright and an AMQP WebSocket endpoint:

```sh
npx playwright install chromium
npm run test-browser
```

The default endpoint is `ws://127.0.0.1:15670/ws/amqp`; set `VITE_WS_URL` to
use another endpoint. A normal AMQP listener on port 5672 is not a WebSocket
endpoint.

## Before Committing

Run and fix failures from:

```sh
npm run format:check
npm run lint
npm run typecheck
```

For source or protocol changes, also run the relevant integration tests. Run
`npm run build` when changing public exports, build configuration, or generated
output expectations.

## Project Structure

- `src/`: TypeScript source.
- `test/test.ts`: main Node.js AMQP integration suite.
- `test/tls.ts`: AMQPS integration tests.
- `test-browser/websocket.ts`: browser WebSocket integration suite.
- `lib/`: generated JavaScript output, ignored by Git.
- `types/`: generated declarations, ignored by Git.

## Key Conventions

- Prettier formats code; ESLint enforces lint rules.
- `CodecMode` generic (`"plain" | "codec"`) threads through
  session, queue, exchange, and RPC classes.
- `AMQPMessage.body` begins as raw bytes and is replaced with the decoded value
  when codecs are configured.
- `@internal` JSDoc with `stripInternal: true` excludes internal APIs from
  generated declarations.
- Integration tests create RabbitMQ resources. Prefer server-named queues or
  clean up any named queues and exchanges introduced by new tests.
