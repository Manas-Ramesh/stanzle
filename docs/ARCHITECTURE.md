# Architecture

High-level layout of the Stanzle codebase. Paths may differ slightly from an older tree; treat this as a map, not a file audit.

## Layout (conceptual)

```
stanzle/
├── public/                 # Static assets and SPA build output
├── updatedDesign/          # Vite + React source
├── src/backend/services/   # Python services (auth, OpenAI, challenges, etc.)
├── api/                    # Vercel serverless entry (if used)
├── data/                   # JSON persistence
├── scripts/
├── main.py                 # Flask app and HTTP routes
├── requirements.txt
└── docs/
```

## Backend

- **Flask** in `main.py`: HTTP API, auth, daily flow, archive, static/SPA routes as configured.
- **Services** under `src/backend/services/`: OpenAI scoring/analysis, Wordnik or fallbacks, auth, challenge archive, etc.
- **Config**: environment variables (see `README.md` and `env.example` / `vercel-env.example`).

## Frontend

- **React SPA** in `updatedDesign/`: router pages, auth context, game UI.
- **Legacy HTML/JS** may still exist under `public/` for older routes.

## Main API surface (examples)

- `GET /api/challenge` – daily challenge payload
- `POST /api/analyze` – poem → guessed theme/emotion
- `POST /api/score` – poem + intended theme/emotion → scores
- Auth and daily submit routes as implemented in `main.py`

## Configuration

Typical env vars: `OPENAI_API_KEY`, optional `WORDNIK_API_KEY`, `SECRET_KEY`, optional Google OAuth vars, `CORS_ORIGINS`, production URLs for OAuth.

## Local development

```bash
pip install -r requirements.txt
python main.py
```

Frontend dev server (if used): `cd updatedDesign && npm run dev` with API proxy or `VITE_API_BASE` as your setup requires.

## Production notes

- Use a production WSGI server (e.g. Gunicorn) when not on serverless.
- JSON files in `data/` suit single-instance or dev; multi-instance hosting needs a shared database or object store.

## Possible next steps

- Database for users and poems
- Redis or similar for sessions
- CI/CD and automated tests
- Monitoring and structured logging
