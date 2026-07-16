# EnglishAce

AI-powered English proficiency assessment platform — Speaking, Writing, Grammar, Vocabulary, Listening, Reading, and HR Interview practice, with instant CEFR-level feedback.

---

## Tech Stack

- **Frontend:** React 18 + Vite, React Router
- **Backend:** Vercel Serverless Functions (`/api`)
- **AI:** Groq (Whisper speech-to-text + Llama-based evaluation)
- **Styling:** Inline styles + a small shared glassmorphism design system (no CSS framework)
- **Storage:** Browser LocalStorage only — **there is no database or user-account system** (see *Known Limitations* below)

---

## Getting Started

```bash
npm install
cp .env.example .env.local     # then add your Groq API key(s)
npm run dev
```

The dev server runs on Vite. A custom Vite plugin (see `vite.config.js`) executes everything under `/api` locally, so `npm run dev` behaves the same as production — no separate backend process or Vercel CLI needed for local development.

### Environment variables

See `.env.example`. At minimum you need **one** Groq API key (free tier available at [console.groq.com](https://console.groq.com/keys)). Additional `GROQ_API_KEY_1` through `GROQ_API_KEY_10` are optional and used for round-robin rate-limit distribution across multiple keys.

---

## Project Structure

```
api/
  questions/        → 7 public endpoints (GET /api/questions/<type>?count=N)
  data/              → the actual question banks (server-only, never bundled to the client)
  chat.js            → AI evaluation endpoint (Groq LLM)
  transcribe.js       → Speech-to-text endpoint (Groq Whisper)
src/
  pages/             → route-level pages (Home, Blog, Assessment, Results, etc.)
  pages/assessment/   → the 7 individual test pages
  components/         → shared UI (AssessmentFeedback, Navbar, Lexi widget, icons)
  data/               → client-safe data only (translations, blog articles, learning-resource links)
  contexts/           → React context providers (language, Lexi assistant state)
  utils/               → session persistence, API client with retry + caching
```

Question banks and answer keys live **only** in `api/data/` and are never sent to the browser beyond the specific items needed for the assessment in progress — see `api/questions/*.js` for the randomization/selection logic.

---

## Deployment

Built for **Vercel** (zero-config — every file under `/api` auto-deploys as a serverless function). Push to a connected Git repo, or run:

```bash
npm run build
vercel deploy
```

Set the same environment variables from `.env.example` in your Vercel project settings before deploying.

---

## Before You Launch / Resell Checklist

This project was sanitized of the original developer's personal contact info, but a few placeholders still need **your** real information before going live:

- [ ] `src/components/Footer.jsx` — Facebook link + phone/WhatsApp number
- [ ] `src/pages/Contact.jsx` — email, WhatsApp, Instagram
- [ ] `src/pages/About.jsx` — founder name + photo (`public/founder.jpg`)
- [ ] `index.html` — Google Analytics ID (currently `G-XXXXXXXXXX` placeholder)
- [ ] `index.html`, `sitemap.xml`, `public/robots.txt` — replace the placeholder domain (currently a free `.ddns.net` subdomain) with your real purchased domain
- [ ] `.env.local` / hosting provider dashboard — your own Groq API key(s)

---

## Known Limitations (read before pricing/scoping any resale)

- **No authentication or user accounts.** All progress/session state lives in the browser's LocalStorage only. There is no server-side database.
- **No payment/billing integration.** Every assessment is currently free to run.
- **No persistent analytics on assessment results** beyond what the user's own browser stores.

Adding real user accounts + a database is the single highest-impact improvement for turning this into a fully operable subscription SaaS.

---

## License / Ownership

All rights to this codebase belong to its current owner. No open-source license is granted.
