# Bullet Check

Paste a job description and your resume, and get back your 3 weakest resume
bullets with an explanation of why they're weak and a stronger rewrite
tailored to the role.

Built with Next.js (App Router) and the Anthropic API (`claude-haiku-4-5`).

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root with your Anthropic API
   key:

   ```bash
   ANTHROPIC_API_KEY=sk-ant-...
   ```

   Get a key from the [Anthropic Console](https://console.anthropic.com/).

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000), paste in a job
   description and resume, and hit Analyze.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm start` — run the production build
- `npm run lint` — lint the codebase
- `npm test` — run tests

## How it works

`app/api/analyze/route.ts` takes the submitted job description and resume,
sends them to the Anthropic Messages API with a system prompt instructing
the model to act as a resume coach, and parses the returned JSON into the
three weakest bullets, why each is weak, and a stronger rewrite. The
frontend (`app/page.tsx`) is a single form that renders the results as
cards.
