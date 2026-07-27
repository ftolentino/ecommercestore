# CLAUDE.md — E-Commerce Storefront

## 1. Project overview

A small e-commerce storefront. Users can browse featured products on the home page, work through a product listing filtered by category, open a product detail view, and manage a cart.

All product data comes from the [DummyJSON API](https://dummyjson.com/). This is an individual build — each developer has their own repository and their own Vercel URL. This repo is `github.com/ftolentino/ecommercestore`.

**Features are built one at a time, in separate sessions.** See [§12 Feature phases](#12-feature-phases). Do not build ahead of the current phase.

---

## 2. Technical requirements

| Layer                  | Choice        | Constraint notes                                                   |
| ---------------------- | ------------- | ------------------------------------------------------------------ |
| Front end              | React + Vite  | Use JavaScript, not TypeScript                                     |
| State management       | Zustand       | Use Zustand, not Redux, and name it clearly                        |
| Components and styling | Ply CSS       | No other UI libraries — https://www.plycss.com/                    |
| Data source            | DummyJSON API | This is the only product data source; no custom product database   |
| Database               | Firestore     | Only for cart persistence if you reach the Cart phase              |
| Auth                   | Firebase Auth | Stretch only; skip it unless you have already covered it           |
| Deployment             | Vercel        | Auto-deploy from GitHub; production tracks the `production` branch |

### Approved additions to the table above

These are **not** in the original stack spec. They were added deliberately; do not add anything else without asking.

| Package                            | Why                                                                                                                                                                                                                                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react-router-dom`                 | The category-filtered listing and product detail views need real URLs (`/products?category=laptops`, `/products/:id`) so links are shareable and the back button works. It is a router, not a UI or styling library, so it does not conflict with the "no other UI libraries" rule. |
| `eslint`, `prettier` + plugins     | Editor and CI code quality. See [§8](#8-code-style-and-linting).                                                                                                                                                                                                                    |
| `vitest`                           | Logic-only unit tests. See [§8](#8-code-style-and-linting).                                                                                                                                                                                                                         |
| `@types/react`, `@types/react-dom` | Editor IntelliSense only. These are type _definitions_ consumed by VS Code — there is no `tsconfig.json`, no compilation step, and no `.ts`/`.tsx` source. The "JavaScript only" rule is unaffected.                                                                                |

### Dependencies added per phase, not up front

`zustand` (Phase 5) and `firebase` (Phase 6) are **not installed yet**. "Do not build ahead of the current phase" applies to dependencies too — each arrives in the phase that first uses it, so the lockfile stays honest about what the app actually needs.

---

## 3. Hard constraints

Each of these is checkable. Before finishing a phase, verify you did not break any.

- **JavaScript only.** No TypeScript. No `.ts` or `.tsx` files anywhere.
- **Zustand for shared state.** No Redux, no Redux Toolkit, no React Context used as a state manager. Context is acceptable only for genuinely static values.
- **Ply CSS is the only styling framework.** No Tailwind, Bootstrap, MUI, Chakra, styled-components, or Emotion.
- **DummyJSON is the only product data source.** No product database, no seeded or mocked product JSON committed to the repo, no other product API.
- **Firestore is for cart persistence only**, and only from Phase 6 onward. It never stores products.
- **Firebase Auth is a stretch goal.** Do not start it unprompted.

---

## 4. Ply CSS usage rules

### Install and import

```bash
npm install ply-css
```

The npm package is **`ply-css`**. Ply's own `llms.txt` refers to a package named `plycss` — **that package does not exist on npm.** Do not use it.

Import the prebuilt CSS once, in `src/main.jsx`:

```js
import 'ply-css/dist/css/ply.css';
```

No Sass toolchain is needed. Ply's `main` field points at prebuilt CSS. (A `@use 'ply-css/src/scss/ply' as *;` path exists, but only take it if a phase genuinely needs to override Sass variables, and add `sass` as a dev dependency at that point.)

### Theming

Set `data-theme` on `<html>` in `index.html`: `"light"` forces light, `"dark"` forces dark, and omitting the attribute follows the OS preference. Default to omitting it.

### Read Ply's own reference before writing CSS

Ply ships a machine-readable reference. **Read these before writing any custom CSS or guessing at a class name:**

- `node_modules/ply-css/PLY.md` — full reference, ~8.7k tokens, fits in one context window
- `node_modules/ply-css/ply-classes.json` — all 458 classes, 120+ custom properties, 13 auto-styled elements

### Hard rules

- **`unit-*` classes must be direct children of `units-row`.** A `unit-50` outside a `units-row` does nothing. Use `units-container` to center at 1200px.
- **Wrap forms in `.form`** or inputs get only minimal styling.
- **Use `<button>` for buttons, never `<a>`.** Buttons use `btn` plus a variant (`btn-primary`, `btn-secondary`, `btn-ghost`, `btn-primary-outline`, sizes `btn-sm`/`btn-xs`). `btn-icon` requires an `aria-label`.
- **Never hard-code colors.** Use `var(--ply-*)` custom properties, or dark mode breaks. Surfaces follow `--ply-{color}-surface` / `-border` / `-1` / `-2` / `-3` across blue, red, green, yellow, indigo, purple, pink, orange, teal, cyan.
- **Never invent utility classes.** `.color-gray-60` does not exist. Text colors are `text-primary`, `text-secondary`, `text-tertiary`.
- **Responsive variants are not top-level keys in `ply-classes.json`.** `tablet-unit-100` is real, but you will not find it as a key — each base class carries a `responsive` array listing its valid prefixes (`tablet-`, `phone-`, `container-tablet-`, …). Not finding a prefixed name in the JSON does not mean it is invalid; check the base class's `responsive` array, or grep `dist/css/ply.css`.
- **Navigation is `<nav class="navbar"> > <ul> > <li> > <a>`,** and the `active` class goes on the `<li>`, not the `<a>`. React Router's `NavLink` puts its class on the anchor, so use `useLocation()` to mark the `<li>` instead.
- **Start with semantic HTML.** Ply auto-styles `<table>`, `<nav>`, `<dialog>`, `<details>`, `<blockquote>`, `<code>`, headings, and form controls with no classes at all. Reach for the native element before adding a `<div>` wrapper.
- Cards are a utility combination, not a component: a surface background, a border, and padding.

---

## 5. DummyJSON API reference

Base URL: `https://dummyjson.com`. No API key. 194 products across 24 categories.

| Need                                  | Endpoint                       |
| ------------------------------------- | ------------------------------ |
| Featured products (home)              | `/products?limit=8`            |
| Category-filtered listing             | `/products/category/{slug}`    |
| Category options                      | `/products/categories`         |
| Product details                       | `/products/{id}`               |
| Paginated listing                     | `/products?limit={n}&skip={n}` |
| Search (only if a phase calls for it) | `/products/search?q={query}`   |

### Response shapes — these differ, and it matters

- **List endpoints** return an envelope: `{ products: [...], total, skip, limit }`. Use `total` for pagination.
- **A single product** (`/products/{id}`) is returned **bare** — no envelope, no `.product` key.
- **`/products/categories`** returns an array of **objects**: `{ slug, name, url }`. Use `slug` for URLs and API calls, `name` for display labels.
- **`/products/category-list`** returns an array of bare slug strings. Prefer `/products/categories` so you get display names for free.

### Fields the UI uses

`id`, `title`, `description`, `price`, `discountPercentage`, `rating`, `stock`, `brand`, `category`, `thumbnail`, `images`.

A product also carries `tags`, `sku`, `weight`, `dimensions`, `warrantyInformation`, `shippingInformation`, `availabilityStatus`, `returnPolicy`, `minimumOrderQuantity`, `reviews`, and `meta`. Use them only if a phase asks.

Note: `brand` is missing on some products — always guard before rendering it.

**Writes are simulated.** `POST /products/add`, `PUT`, and `DELETE` return a plausible response but persist nothing. Never rely on them for real state.

---

## 6. Project structure

```
src/
  api/
    dummyjson.js        Every fetch call lives here. Nowhere else.
  stores/
    useCartStore.js
    useProductStore.js
  components/
    Layout.jsx
    ProductCard.jsx
    CategoryFilter.jsx
    CartItem.jsx
  pages/
    HomePage.jsx
    ProductListPage.jsx
    ProductDetailPage.jsx
    CartPage.jsx
    NotFoundPage.jsx    Catch-all. The SPA rewrite sends every unknown URL
                        to the router, so without this they render blank.
  lib/
    cart.js             Pure cart math. Unit-tested.
  App.jsx               Routes.
  main.jsx              Entry. Imports Ply CSS.
```

Add files within this layout. Do not introduce new top-level folders under `src/` without asking.

---

## 7. Conventions

- **Stores** are named `useCartStore`, `useProductStore` — the `useXStore` pattern — and exported as named hooks. One store per domain concern.
- **Components** are function declarations with named exports. One component per file, filename matches the component.
- **No `fetch` outside `src/api/dummyjson.js`.** Components and stores call exported functions from that module. This keeps the "DummyJSON is the only data source" rule verifiable by grepping for `fetch`.
- **Every data-fetching view handles three states:** loading, error, and success. No view may render a blank screen while a request is in flight, and no error may be swallowed.
- **Cart math lives in `src/lib/cart.js`** as pure functions (subtotal, discounted price, line totals, item count). Stores call it; it never imports from stores. This is what the tests cover.
- **Config** is read via `import.meta.env.VITE_*`. Real values go in `.env.local` (gitignored) and Vercel env vars. Never commit a secret. Any variable exposed to the browser must be treated as public — Firebase web config is fine, service account keys are not.

---

## 8. Code style and linting

### ESLint

ESLint 10 **flat config** in `eslint.config.js`. It is hand-written, **not** inherited from the Vite React template — as of `create-vite@9` that template ships [oxlint](https://oxc.rs/) and no `eslint.config.js` at all. Oxlint is deliberately removed; ESLint is the linter here.

- `@eslint/js` recommended
- `eslint-plugin-react-hooks` — exposes its flat config as `configs['recommended-latest']`
- `eslint-plugin-react-refresh` — exposes `configs.vite`
- `globals` for browser globals
- `eslint-config-prettier` **last in the array**, so it can turn off rules that conflict with Prettier

ESLint 10 requires Node `^20.19.0 || ^22.13.0 || >=24`.

### Prettier

Prettier runs **separately from ESLint**. Do **not** install `eslint-plugin-prettier` and do not run formatting through ESLint — it makes lint slow and error output noisy. `eslint-config-prettier` is only there to stop the two from disagreeing.

`.prettierrc.json`:

```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "printWidth": 100,
  "trailingComma": "es5"
}
```

### Tests

Vitest, **logic only** — `src/lib/cart.js` math and any API response-mapping helpers. No component tests, no React Testing Library, no jsdom environment needed unless a later phase justifies it. Test files are `src/**/*.test.js`, scoped by the `test.include` block in `vite.config.js`.

The `test` script runs `vitest run --passWithNoTests`. The flag matters: no test files exist until Phase 5, and Vitest treats an empty run as a failure, which would fail CI from day one.

### VS Code

- `.vscode/settings.json` — `editor.formatOnSave: true`, `editor.defaultFormatter: "esbenp.prettier-vscode"`, and `editor.codeActionsOnSave: { "source.fixAll.eslint": "explicit" }`
- `.vscode/extensions.json` — recommends `esbenp.prettier-vscode` and `dbaeumer.vscode-eslint`

Both files are committed so the editor setup travels with the repo.

---

## 9. Git and deployment workflow

### Branch model

```
feature/<phase>-<slug>   →  PR  →  [human review]  →  main         (Vercel Preview)
main                     →  PR  →  [human review]  →  production   (Vercel Production)
```

Two gates: features merge into `main`, and `main` is promoted to `production` deliberately. `main` gets a Vercel Preview URL; `production` is the live site.

### Rules

- **Never commit directly to `main` or `production`.** Every change arrives by PR.
- **Branch naming:** `feature/<phase>-<slug>`, e.g. `feature/03-category-listing`.
- **Subagents use git worktrees.** Run them with `isolation: "worktree"` so parallel agents work on isolated copies and cannot collide on the same files. Each worktree branch opens its own PR for human review.
- **Human review is required before every merge.** Claude opens PRs; it does not merge them.
- **Branch protection** on both `main` and `production`: require a PR, and require the CI check to pass.

### Vercel setup

- **Set Project Settings → Git → Production Branch to `production`.** It defaults to the repo default branch (`main`). Without this change the two-branch model silently does nothing — every merge to `main` would go straight to production.
- The `production` branch is created from `main` during Phase 1. It does not exist yet.
- **`vercel.json` must include the SPA rewrite**, or React Router deep links 404 when refreshed:

  ```json
  {
    "$schema": "https://openapi.vercel.sh/vercel.json",
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

- **Env var scopes:** Vercel's **Preview** scope applies to `main` and feature branches; the **Production** scope applies to `production`. Set them in the Vercel dashboard, never in the repo.

### Vercel MCP is for verification, not for the pipeline

The Vercel MCP server is agent-facing and authenticated to the developer's account in the Claude Code session. **GitHub Actions runners cannot reach it, so it is not a CI/CD component.** Its job is session-time verification: after a deploy, use `list_deployments`, `get_deployment`, `get_deployment_build_logs`, and `get_runtime_errors` to confirm the deploy succeeded and read failures. Deployment itself is handled by Vercel's GitHub integration.

### Local CLI state

Neither `gh` nor `vercel` is installed on this machine. Node is v22, npm is v11. Install a CLI only when a phase actually needs it:

```bash
npm i -g vercel
```

---

## 10. CI/CD

### `.github/workflows/ci.yml` — active, and the merge gate

Triggers on `pull_request` and on `push` to `main` and `production`. Runs on Node 22 with npm caching:

```
npm ci
npm run lint
npm run format:check
npm test
npm run build
```

`npm run build` is in CI because a broken import or bad env reference often passes lint and tests but fails the real Vercel build.

### `.github/workflows/claude.yml.disabled` — inert until you opt in

Claude-in-CI needs an `ANTHROPIC_API_KEY` repo secret, which is undecided. The workflow file ships with a `.disabled` suffix so **GitHub ignores it entirely** — the Actions runner only reads `.yml` and `.yaml`.

It contains the on-demand setup: `anthropics/claude-code-action@v1`, triggered by `issue_comment` and `pull_request_review_comment` events guarded with `contains(github.event.comment.body, '@claude')`, passing `anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}` and `claude_args: --max-turns 10`.

**To enable it:**

1. Add `ANTHROPIC_API_KEY` to repo secrets (Settings → Secrets and variables → Actions)
2. Install the Claude GitHub App at https://github.com/apps/claude
3. Rename `claude.yml.disabled` → `claude.yml`

By design there is **no automatic review on every PR** — Claude runs only when you mention `@claude`, so invocations stay deliberate and predictable.

### Two things to know about how this actually behaves

- **Vercel deploys in parallel with CI, not after it.** The Git integration starts building the moment you push, so a failing test does _not_ prevent a preview deployment from appearing. The real gate is branch protection requiring the CI check before merge.
- **Claude-in-CI costs are separate.** `claude-code-action` bills Claude API credits from console.anthropic.com — not the Claude Code subscription — and consumes GitHub Actions minutes.

---

## 11. Commands

```bash
npm run dev            # Vite dev server
npm run build          # production build
npm run preview        # serve the build locally
npm run lint           # ESLint
npm run lint:fix       # ESLint with --fix
npm run format         # Prettier, writes
npm run format:check   # Prettier, check only (used by CI)
npm test               # Vitest
```

---

## 12. Feature phases

Build one phase at a time. **Do not build ahead of the current phase.**

| #   | Phase            | Scope                                                                                                                                                                       |
| --- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Scaffold         | Vite + React (JS), Ply CSS, React Router shell, ESLint/Prettier, `.vscode/`, `vercel.json`, `ci.yml`, `production` branch, Vercel project linked with Production Branch set |
| 2   | Home             | Featured products from `/products?limit=8`                                                                                                                                  |
| 3   | Listing          | Category-filtered product list                                                                                                                                              |
| 4   | Detail           | Single product view                                                                                                                                                         |
| 5   | Cart             | Zustand + `persist` middleware to localStorage                                                                                                                              |
| 6   | Cart persistence | Move cart to Firestore                                                                                                                                                      |
| 7   | Stretch          | Firebase Auth — only if everything above is done                                                                                                                            |

### Cart persistence

Until Phase 6, the cart lives in `useCartStore` with Zustand's `persist` middleware writing to localStorage, so it survives a refresh with no backend. Phase 6 swaps the storage layer for Firestore. Keep cart math in `src/lib/cart.js` so that swap touches the store only.
