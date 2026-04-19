# Deployment

## Railway

1. Create an account at [railway.app](https://railway.app).
2. Connect the GitHub repo.
3. Set variables in the project dashboard:

   ```
   OPENAI_API_KEY=your_openai_key
   WORDNIK_API_KEY=your_wordnik_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   SECRET_KEY=your_secret_key
   ```

4. Deploy; Railway builds and runs the app from the repo.

**Custom domain (e.g. stanzle.com)**

1. Railway: service → Settings → Networking → add `stanzle.com` (and `www` if needed). Point DNS as Railway shows.
2. Google Cloud Console → OAuth client → Authorized redirect URIs:
   - `https://stanzle.com/login/google/authorized`
   - Add `www` variant if you use it.
3. Env (pick one style for the callback):
   - `GOOGLE_REDIRECT_URI=https://stanzle.com/login/google/authorized`, or
   - `PUBLIC_APP_URL=https://stanzle.com` (no trailing slash) if the app builds the path from that.
4. `CORS_ORIGINS` should list real origins, e.g. `https://stanzle.com,https://www.stanzle.com`.
5. If you use `FRONTEND_URL` for OAuth, set it to the URL users open in the browser.
6. For same-host SPA, leave `VITE_API_BASE` unset in production, or set it to your public `https://` origin (not `*.railway.app`) if the API is separate.

The app uses ProxyFix so `Host` / `X-Forwarded-*` from the platform match your public domain for OAuth.

**Persistence**

Sessions and users live in `data/sessions.json` and `data/users.json`. On Railway the default disk is often ephemeral: redeploys can wipe `data/`. Use a persistent volume mounted at `data/`, or move sessions to Redis/Postgres later.

**Cost**

Free tier exists; paid usage varies.

## Render

1. [render.com](https://render.com) → New Web Service.
2. Connect the repo.
3. Build: `pip install -r requirements.txt`
4. Start: `python main.py`
5. Set the same env vars as above.
6. Deploy.

## Heroku

```bash
heroku login
heroku create your-app-name
heroku config:set OPENAI_API_KEY=...
heroku config:set WORDNIK_API_KEY=...
heroku config:set GOOGLE_CLIENT_ID=...
heroku config:set GOOGLE_CLIENT_SECRET=...
heroku config:set SECRET_KEY=...
git push heroku main
```

Heroku pricing is plan-dependent.

## Environment summary

```bash
# Required
OPENAI_API_KEY=sk-proj-...
WORDNIK_API_KEY=your_wordnik_key
SECRET_KEY=your_secret_key

# Optional (Google)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Server
PORT=8000
DEBUG=False
HOST=0.0.0.0
```

## After deploy

1. OAuth redirect URIs match production HTTPS URLs.
2. Smoke-test login, daily play, and scoring.
3. Optional: uptime or error monitoring.

## Security checklist

- [ ] Secrets only in the host env, not in git
- [ ] `DEBUG=False` in production
- [ ] HTTPS (usually automatic on these hosts)
- [ ] OAuth redirect URIs exact match
- [ ] API keys not hard-coded

## Troubleshooting

- **Port**: App should read `PORT` from the environment (default 8000 locally).
- **Statics**: Ensure `public/` is present in the deployed artifact.
- **JSON data**: Files are created on first use if missing.
- **CORS**: Set `CORS_ORIGINS` to your real frontend origin(s).

**Logs**

- Railway / Render: dashboard logs
- Heroku: `heroku logs --tail`
