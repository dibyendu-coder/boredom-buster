# Boredom Buster

A polished React + TypeScript web app that helps you instantly pick fun mini-challenges when you feel bored.

## Features

- Premium dark UI with purple/electric-blue accents, gradients, smooth hover/focus states, and responsive layout
- Homepage title: **“Bored? Let's fix that.”**
- Four challenge categories:
  - Quick Games
  - Brain Teasers
  - Creative Tasks
  - Random Challenges
- **Surprise Me** random challenge generator
- **Give Me Another** flow to rotate to another challenge
- Challenge card with title, description, estimated time, difficulty, and points
- Favorites system with persistence and favorites-only filtering
- Score + streak progression persisted in `localStorage`
- Completion logic that prevents duplicate completion of the same challenge on the same day
- Loading, empty, and completed states for key interactions
- 32 predefined challenges across the four categories

## Local setup

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`).

## Quality checks

```bash
npm run lint
npm run build
```

## Implementation notes

- Built with **Vite + React + TypeScript**
- No backend, auth, API keys, or paid services
- Data and progress are client-side only (stored in `localStorage`)
