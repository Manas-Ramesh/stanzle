# Stanzle web UI (Vite + React)

Source for the redesigned Stanzle front end. Original design reference: [Figma – Redesign Stanzle Website](https://www.figma.com/design/yeSjN0GyWGHd2E73inejpx/Redesign-Stanzle-Website).

## Commands

```bash
npm i
npm run dev
```

Development server URL is printed in the terminal (often `http://localhost:5173`).

Production build (from this folder):

```bash
npm run build
```

Output is in `dist/`. The Flask app’s deploy script usually copies `dist/` into `../public/`.
