# Portfolio — UI/UX Designer

A modern, modular portfolio built with **Next.js 16 (App Router)**, **TypeScript**, and **Tailwind CSS**. Deployable for free on Vercel.

## Features
- Home page with featured work & lab highlights
- Projects listing + dynamic case study pages
- Lab listing + dynamic interactive experiment pages
- Responsive, dark-themed design
- Centralized data files — add content without touching page logic

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation
```bash
git clone https://github.com/Ikenakk/Test-Portfolio.git
cd Test-Portfolio
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Adding a New Project
Edit `data/projects.ts` and add an object to the `projects` array:
```ts
{
  slug: "my-new-project",       // URL: /projects/my-new-project
  title: "My New Project",
  description: "Short description shown on cards.",
  tags: ["UI/UX", "Mobile"],
  role: "Designer",
  problem: "What problem does it solve?",
  process: "How did you approach it?",
  solution: "What did you build/design?",
  impact: "What was the outcome?",
  year: 2025,
  // optional:
  liveUrl: "https://...",
  githubUrl: "https://...",
}
```

## Adding a New Lab Experiment
Edit `data/lab.ts` and add an object to the `labItems` array:
```ts
{
  slug: "my-experiment",        // URL: /lab/my-experiment
  title: "My Experiment",
  description: "What this mini-project does.",
  tags: ["Tool", "CSS"],
  year: 2025,
}
```
Then add your interactive React component to `app/lab/[slug]/page.tsx` by matching the slug.

## Deploy to Vercel
1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project → Select this repo
3. Default settings work out of the box (Next.js is auto-detected)
4. Connect your custom domain in Vercel → Project → Settings → Domains

## Architecture
```
app/
  layout.tsx          # Global layout (Header + Footer)
  page.tsx            # Home
  projects/
    page.tsx          # Projects listing
    [slug]/page.tsx   # Project detail
  lab/
    page.tsx          # Lab listing
    [slug]/page.tsx   # Lab detail
components/           # Reusable UI components
data/
  projects.ts         # ← Add your projects here
  lab.ts              # ← Add your lab items here
types/
  index.ts            # TypeScript types
```
