# Research Search Workspace

A small React interface for searching the Europe PMC life-sciences literature
catalogue. Enter a query, browse the matching articles and open one on Europe
PMC.

## Features

- Keyword and field search against the live Europe PMC REST API.
- Result cards with title, authors, journal and publication year.
- Cursor-based pagination with Previous and Next controls.
- Explicit idle, loading, empty, success and error states.
- Keyboard-friendly controls, visible focus styles and screen-reader status
  messages.

## Tech stack

- React 19
- Vite 8
- JavaScript and JSX
- CSS Modules with design tokens
- ESLint
- Vitest and Testing Library

## Requirements

- Node.js `^20.19.0` or `>=22.12.0` (Vite 8 requirement)
- npm
- An internet connection for the Europe PMC API

Check the installed version with:

```bash
node -v
```

## Install and run

From the project folder:

```bash
npm install
npm run dev
```

## Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build production assets into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint over the repository |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Rerun tests when files change |

## Testing

The functional tests use Vitest, Testing Library and jsdom. They run offline:
`fetch` is stubbed, so no request reaches Europe PMC during a test run.

```bash
npm test
```

Use `npm run test:watch` while changing code.

### What the tests cover

- API module: request parameters, response mapping, article link choice, cursor
  handling, empty payloads and HTTP errors.
- Search interface: idle prompt, empty query validation, successful results,
  empty results, API errors, Next and Previous paging.

Tests sit next to the code they cover:

- `src/modules/research/api/europePmc.test.js`
- `src/modules/research/ResearchSearchWorkspace.test.jsx`

The shared setup is `src/test/setup.js`. Tests import Vitest functions
explicitly rather than relying on globals. Mocking happens at the `fetch`
boundary, not by replacing the API module, so URL building and response mapping
stay under test.

### Manual check

Run `npm run dev`, then walk through these cases:

1. Search for `cancer AND immunotherapy` and confirm result cards appear.
2. Submit an empty search and confirm the validation message.
3. Search for a nonsense term and confirm the empty state.
4. Use Next and Previous and confirm the page indicator and results change.
5. Set the browser network to offline and search, then confirm the error alert.

## Search examples

Europe PMC accepts boolean operators. Try:

```cancer AND immunotherapy NOT melanoma```

See the [Europe PMC REST API](https://europepmc.org/RestfulWebService) for the
full query syntax and response format.

## Project structure

```text
.
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
├── public/
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── App.css
    ├── test/
    │   └── setup.js
    ├── layout/
    │   ├── Header.jsx
    │   └── Footer.jsx
    └── modules/
        └── research/
            ├── ResearchSearchWorkspace.jsx
            ├── ResearchSearchWorkspace.test.jsx
            ├── api/
            │   ├── europePmc.js
            │   └── europePmc.test.js
            ├── hooks/
            │   └── useSearch.js
            └── components/
                ├── SearchForm.jsx
                ├── SearchResults.jsx
                ├── ResultCard.jsx
                └── Spinner.jsx
```

The app is a modular monolith. Each feature lives under `src/modules/` and
exposes a single workspace component; `App.jsx` composes those entries. Inside a
module, `api/` handles network access and response mapping, `hooks/` owns state
and `components/` stays presentational. Styling uses one CSS module per
component.

The full contribution rules for agents and developers are in
[`AGENTS.md`](./AGENTS.md).