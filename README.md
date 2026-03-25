# UI Placement Assistant (AI UI Design Assistant)

An AI UI design assistant for front-end developers: **upload a screenshot of an existing UI**, describe the component/change you want to make, and get **2–4 suggested placement options** with rationale and **bounding boxes** (percent-based coordinates) that are drawn directly on the screenshot.

The goal is to help you decide **where to add a new component** and **how to adjust a UI to reduce user friction** while staying consistent with the current layout and hierarchy.

## What it does

- **Screenshot + prompt → placements**: Uses OpenAI vision to analyze a UI screenshot and return suggested placements.
- **Visual overlay**: Draws suggested bounding boxes over the screenshot so you can see “where” immediately.
- **Clarifying questions → refine**: If the model needs more context, it returns clarifying questions; you answer them in-app and re-run the analysis with conversation history.
- **Exports**:
  - Export results as **JSON**
  - Print/export via browser **“Print to PDF”**
- **Comparison mode**: Save multiple analyses and view them side-by-side.
- **Keyboard shortcuts**: Upload, analyze, and open help quickly.
- **Theme toggle**: Light/dark mode via `next-themes`.

## Tech stack

- **Client**: React + Vite, Tailwind CSS, Radix UI primitives, TanStack Query, `wouter`
- **Server**: Express (TypeScript) + OpenAI SDK
- **Schema/validation**: `zod` in `shared/`
- **Deployment**: Vercel serverless handler in `api/analyze.ts` (plus a Node server for local/dev)

## Repository layout

- `client/`: React app (Vite root)
- `server/`: Express server + OpenAI analysis handler
- `shared/`: Zod schemas/types shared between client and server
- `api/`: Vercel Serverless Function entrypoint(s)

## Running locally

### Prerequisites

- Node.js (project uses modern React/Vite; Node 18+ recommended)
- An OpenAI API key

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

This project loads `.env.<NODE_ENV>` first, then falls back to `.env`.

Create a `.env.development` (or `.env`) file in the repo root:

```bash
OPENAI_API_KEY=your_key_here
PORT=8888
```

Notes:

- **`OPENAI_API_KEY` is required** (the server will exit on startup if missing).
- `PORT` defaults to `8888` if not set.

### 3) Start the dev server

```bash
npm run dev
```

This runs the Express server in watch mode and (in development) mounts Vite as middleware, so **the API and the client are served from the same origin**.

Open the app at `http://localhost:8888` (or whatever `PORT` you set).

## Build and run (production-like)

```bash
npm run build
npm run start
```

`npm run build` outputs the client to `dist/public` and bundles the server into `dist/index.js`.

## Using the app

1. Upload a **PNG or JPG** UI screenshot (max 10MB).
2. Describe what you want to add/change (example: “Add a Save Draft button for this form”).
3. Click **Analyze Layout**.
4. Review suggested placements:
   - Each suggestion includes a **region description**, **reason**, and (typically) **coordinates**.
   - Coordinates are percentages of the original image: `x`, `y`, `width`, `height` in the range 0–100.
5. If clarifying questions appear, answer them and click **Refine Suggestions**.

## API

### `POST /api/analyze`

Accepts `multipart/form-data`:

- **`image`**: required file, `image/png` or `image/jpeg` (max 10MB)
- **`description`**: required string
- **`conversationHistory`**: optional JSON string:
  - `[{ "question": "...", "answer": "..." }, ...]`

Returns JSON matching the shared Zod schema in `shared/schema.ts`:

- `placements`: array of
  - `region`: string
  - `reason`: string
  - `coordinates`: optional `{ x, y, width, height }` (all numbers 0–100)
- `clarifyingQuestions`: optional string[]

Example `curl`:

```bash
curl -X POST "http://localhost:8888/api/analyze" \
  -F "image=@/path/to/screenshot.png" \
  -F "description=Add a persistent Save Draft button"
```

## How the “AI UI assistant” works (high level)

- `server/analyze-handler.ts` builds a **system prompt** that instructs the model to:
  - inspect the UI screenshot
  - suggest **2–4** placement options
  - provide **bounding boxes as percentages**
  - optionally ask clarifying questions
  - respond as **JSON only**
- The response is parsed and validated with Zod (`analysisResultSchema`).
- The client renders placement cards and overlays coordinate boxes using SVG (`client/src/components/image-markup-overlay.tsx`).

## Design & UX guidelines

See `design_guidelines.md` for the intended product look/feel (modern productivity-tool vibe, clarity-first, restrained motion, accessibility, and responsive behavior).

## Notes / known constraints

- Image uploads are restricted to **PNG/JPEG** and **10MB** max.
- The OpenAI model is currently set in code (`server/analyze-handler.ts`).
- The server uses a single port for both UI + API in dev; in production it serves static files from `dist/public`.

## License

MIT (see `package.json`).

