# AGENTS.md

Working rules for agents in this repository. Read this before planning or
changing code. Where this file and the existing code disagree, stop and ask
rather than silently picking one.

## Project

Small React interface for searching the Europe PMC literature catalogue.

- React 19, Vite 8, JavaScript and JSX (no TypeScript).
- React Compiler is enabled through a Babel preset in `vite.config.js`.
- ESLint 10 flat config in `eslint.config.js`.
- Styling is CSS Modules plus design tokens in `src/index.css`.
- No SonarQube configuration and no CI yet. See the deferred section below
  before assuming otherwise.

## Commands

| Command | Use |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the Vite dev server on http://localhost:5173 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built output |
| `npm run lint` | ESLint over the repo |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Rerun tests on change |

## Architecture: modular monolith

One deployable application, split into feature modules with explicit
boundaries. Do not split into separate packages or services.

```
src/
  main.jsx                       React entry point
  App.jsx                        Composition root
  App.css                        App shell layout only
  index.css                      Tokens, reset, global utilities
  layout/                        Header and footer shell components
  modules/
    <feature>/                   One folder per feature
      <Feature>Workspace.jsx     Public entry point for the module
      <Feature>Workspace.module.css
      api/                       Network and response mapping, no React
      hooks/                     State and orchestration
      components/                Presentational components
      lib/                       Pure helpers, only when needed
```

The current feature is `src/modules/research`. Treat it as the reference
implementation.

### Boundaries

- `App.jsx` is the only composition root. It imports layout components and
  each module's public entry, nothing deeper.
- A module's public entry is its `<Feature>Workspace.jsx` file. You may add a
  barrel later only when a second consumer actually needs one; do not add
  speculative `index.js` files.
- Code outside a module must not import from that module's `api/`, `hooks/`,
  `components/` or `lib/` directly.
- A module must not import another module's internals. Cross-module imports go
  through the other module's public entry, and need a real reason.
- `layout/` must not import feature modules. Feature modules must not import
  `layout/`.
- No circular dependencies. Do not climb out of a module with `../../..`; use
  module-internal relative paths only.
- There is no `src/shared/` yet. Duplicate a small helper before abstracting
  it. Create `shared/` only when at least two modules need the same thing.
- No global state library, router or service layer until a real requirement
  arrives. Local state and hooks are the default.

### Data flow

- `api/` is the only place that calls `fetch` or knows the remote response
  shape. It returns the small objects the UI needs.
- Hooks own asynchronous state: status (`idle`, `loading`, `success`,
  `error`), error text, results and pagination.
- Components stay presentational. They receive props, do not fetch, and do not
  own domain rules. Small display-only derivation inside a component is fine.
- Keep the status values and page behaviour consistent with `useSearch.js`
  unless the feature genuinely requires a different model.

### Adding a feature module

1. Create `src/modules/<feature>/` with a `<Feature>Workspace.jsx` entry and
   its CSS module.
2. Add `api/` only if the feature calls a network service; add `hooks/` only if
   it has non-trivial state.
3. Put reusable presentational pieces in `components/`, each with its own CSS
   module.
4. Wire the entry into `App.jsx` inside `<main>`.
5. Cover idle, loading, success, empty and error states.
6. Run `npm run lint` and `npm run build`.

## CSS rules

- Every component gets a co-located `Component.module.css`. Import it as
  `styles` and reference `styles.className`.
- Use camelCase class names. Do not mix naming schemes.
- Global CSS is limited to:
  - `src/index.css`: design tokens, reset, typography and the `.sr-only`
    utility.
  - `src/App.css`: app shell layout such as `#main` and `.ticks`.
  Do not add component selectors to either file.
- Use the existing custom properties for colour, type, border, shadow and
  spacing. Never hard-code a colour that already has a token.
- When you add a token, add it to both the light `:root` block and the
  `prefers-color-scheme: dark` block in `src/index.css`.
- Prefer class selectors. `#root` and `#main` are shell exceptions, not a
  pattern for new styles.
- Inline `style` is allowed only for computed, per-render values. Static
  styling belongs in the CSS module.
- CSS nesting is used in this repo and is allowed. Keep the existing
  mobile-down breakpoints at 1024px and 640px unless the design demands
  otherwise.
- Preserve `:focus-visible` outlines and `prefers-reduced-motion` handling.
- Do not add Tailwind, Sass, styled-components, CSS-in-JS or another styling
  system without explicit approval.

## Accessibility floor

- Keep semantic landmarks and a sensible heading order.
- Every input needs a label. Use `sr-only` when the design hides it.
- Async status text goes in a `role="status"` / `aria-live="polite"` region.
  Errors use `role="alert"`.
- Loading lists set `aria-busy`; disabled controls must still be readable.
- Links that open a new tab say so for screen readers.
- Keep the skip link working and keep keyboard focus visible.
- Do not communicate meaning by colour alone.

## Code style

Match the existing files:

- No semicolons, single quotes, two-space indentation.
- Function components use `export default function Name({ props })`.
- Hooks and API functions use named exports.
- File names: PascalCase for components, camelCase for hooks and modules.
- Props are destructured in the signature unless the list is large.
- Comments explain non-obvious rationale only, as in `useSearch.js` and
  `europePmc.js`. Do not narrate code that is already clear.
- Keep the React Compiler rules: components and hooks must stay pure, no
  mutation during render, no conditional hook calls, no side effects in
  render.

## Quality gates

Before handing work back:

1. `npm test` passes.
2. `npm run lint` passes with no new warnings or disabled rules.
3. `npm run build` passes.
4. No unused imports, variables, files or dead exports.
5. `dist/` is generated output. Never edit it by hand; rebuild instead.

Do not add inline `eslint-disable` comments without explaining why in the
response.

## SonarQube: deferred

Status: **not configured**. Do not claim a SonarQube run or quality gate
result. Do not add a project key, scanner configuration or token.

When this work is picked up, the intended setup is:

- A `sonar-project.properties` file with the project key supplied by the team.
- Coverage exported as `lcov.info` from the test runner.
- Quality gate: 80% coverage on new code, zero new bugs and vulnerabilities,
  A ratings on maintainability, reliability and security.
- `eslint-plugin-sonarjs` added to the ESLint flat config.

Until then, ESLint and the build are the gate. Follow common Sonar rules
anyway: `===` and `!==`, `??` over `||` for defaults, no nested ternaries, no
`await` inside loops, no unused code, no dead branches, no implied `eval`, no
duplicated blocks.

## Tests

Vitest with Testing Library and jsdom. Run `npm test` once, or
`npm run test:watch` while working.

- Tests are co-located with the code: `*.test.js` for plain modules and
  `*.test.jsx` for components.
- Stub `fetch`; never call the live Europe PMC API from a test.
- Do not mock the API module when testing the UI. Keep URL building and
  response mapping in the tested path.
- Keep tests deterministic: no sleeps, no ambient time, locale or environment
  state, and no order dependence.
- Structure tests with Arrange, Act and Assert sections.
- One behaviour per test. Split the test when "and" appears in its name.
- Keep to two or three assertions per test. If it needs more, split it.
- Parameterise boundary variants with `it.each` instead of copying a test body.
- Every bug fix gets a regression test that fails before the fix.
- Import `describe`, `it`, `expect` and `vi` from `vitest`. Globals are off.
- Shared setup lives in `src/test/setup.js`. Do not add a second test runner.

## Out of scope without asking

- New runtime dependencies or a different styling system.
- Migrating to TypeScript.
- Renaming or restructuring existing modules.
- Adding routing, global state, authentication or a backend.
- Editing `package-lock.json` by hand.
