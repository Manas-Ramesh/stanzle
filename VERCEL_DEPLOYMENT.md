# Vercel deployment

Flask backend plus Vite React UI in one repo, deployed with Vercel’s Python runtime and build step.

## Prerequisites

- Vercel account: [vercel.com](https://vercel.com)
- GitHub repo containing this project
- `OPENAI_API_KEY` (required)
- Optional: Wordnik, Google OAuth vars from `vercel-env.example`

## Repo layout

Vercel **Root Directory** should be the folder that contains `main.py`, `vercel.json`, and `api/`.

```
project-root/
  api/
  updatedDesign/     # Vite app; build output copied into public/
  public/            # SPA output (index.html, assets/)
  scripts/build-spa.sh
  main.py
  vercel.json
  requirements.txt
```

Keep `updatedDesign/` in the repo so the build script can run `npm ci` and `vite build` there.

## What the build does

1. Installs Python deps and runs `npm ci` in `updatedDesign/` (see `vercel.json`).
2. Runs `scripts/build-spa.sh`: builds the SPA and copies `dist/` into `public/`.
3. Production `/` serves the React app. Legacy HTML may remain at paths like `/landing` or `/classic-daily.html` depending on routing.

## Local check (production-like)

From the inner project directory:

```bash
bash scripts/build-spa.sh
python main.py
```

Open `http://localhost:8000`. Same origin for API and SPA means you usually omit `VITE_API_BASE`.

## Deploy (CLI)

```bash
npm install -g vercel
vercel login
cd /path/to/inner/stanzle
vercel
```

Link the project, confirm root directory, then promote to production when ready.

## Deploy (dashboard)

1. New Project → import the GitHub repo.
2. **Root Directory**: the inner folder with `main.py` and `vercel.json`.
3. Install command: `pip install -r requirements.txt && cd updatedDesign && npm ci` (or whatever `vercel.json` specifies).
4. Build command: `bash scripts/build-spa.sh` (or as in `vercel.json`).
5. Node: 18.x or newer in project settings.

## Environment variables

Copy names from `vercel-env.example`. Typical set:

**Required**

```
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=300
OPENAI_TEMPERATURE=0.7
```

**Optional**

```
WORDNIK_API_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
SECRET_KEY=...
FRONTEND_URL=https://your-app.vercel.app
```

`FRONTEND_URL` should be the canonical public URL (no trailing slash). Google OAuth redirects use it after sign-in.

**Often set by Vercel**

`VERCEL_URL`, and you may set `CORS_ORIGINS` and `FLASK_ENV=production` per your needs.

## Google OAuth

In Google Cloud Console → Credentials → your OAuth web client:

- Authorized redirect URI: `https://<your-domain>/login/google/authorized`

Match `GOOGLE_REDIRECT_URI` or `PUBLIC_APP_URL` / `FRONTEND_URL` to how `main.py` builds the callback (see `_google_oauth_redirect_uri()`).

## Smoke test after deploy

- `/` loads the SPA.
- Register / login (including Google if enabled).
- Daily and unlimited flows and API responses work.

## Custom domain

Project → Settings → Domains → add domain and DNS as instructed.

## Troubleshooting

- Python import paths: keep `api/index.py` and package layout as in the repo.
- Missing env vars: check Vercel project → Settings → Environment Variables.
- CORS: set `CORS_ORIGINS` to `*` or explicit origins.
- Statics: confirm `public/` exists after build in the deployment artifact.
- OAuth: redirect URI must exactly match production HTTPS.

**Debug**

- Vercel dashboard → Functions → logs.
- Local: `vercel dev`.

## Limits

Serverless cold starts, memory and timeout limits, and JSON-on-disk persistence (not ideal for multi-instance production) apply. For scale, use external DB and object storage.

## References

- [Vercel docs](https://vercel.com/docs)
- [Python on Vercel](https://vercel.com/docs/functions/serverless-functions/runtimes/python)
