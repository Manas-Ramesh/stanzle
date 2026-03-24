# 🚀 Stanzle Deployment Guide

## Quick Deploy Options

### Option 1: Railway (Recommended - Easiest)

1. **Sign up at [Railway.app](https://railway.app)**
2. **Connect your GitHub repository**
3. **Set environment variables in Railway dashboard:**
   ```
   OPENAI_API_KEY=your_openai_key
   WORDNIK_API_KEY=your_wordnik_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   SECRET_KEY=your_secret_key
   ```
4. **Deploy!** Railway will automatically build and deploy your app.

### Custom domain (always show `stanzle.com`, not `*.railway.app`)

1. In **Railway** → your service → **Settings** → **Networking**, add **`stanzle.com`** (and **`www.stanzle.com`** if you use it). Point DNS at the targets Railway shows (CNAME / A records).
2. In **Google Cloud Console** → OAuth client → **Authorized redirect URIs**, add exactly:
   - `https://stanzle.com/login/google/authorized`
   - (and `https://www.stanzle.com/login/google/authorized` if you use `www`)
3. Set Railway **environment variables** (pick one approach for the callback URL):
   - **Recommended:** `GOOGLE_REDIRECT_URI=https://stanzle.com/login/google/authorized`  
   - **Or:** `PUBLIC_APP_URL=https://stanzle.com` (no trailing slash) — the app builds the same callback path automatically.
4. Set **`CORS_ORIGINS`** to include your real origins, e.g. `https://stanzle.com,https://www.stanzle.com` (comma-separated, no spaces if possible).
5. If you use **`FRONTEND_URL`** for OAuth redirects, set it to **`https://stanzle.com`** (same as the site users open).
6. **Frontend build:** Do **not** bake the Railway URL into the SPA. Leave **`VITE_API_BASE` unset** for same-host deploys so “Continue with Google” stays on `stanzle.com`. If you must set it, use **`https://stanzle.com`**, not `*.railway.app`.

The app enables **ProxyFix** so `Host` / `X-Forwarded-*` from Railway match your custom domain when building OAuth URLs.

**Sessions and data:** Login uses `data/sessions.json` and `data/users.json` on disk. On a default Railway service the filesystem is **ephemeral**—each **redeploy** can wipe those files, so old browser tokens stop matching the server and `/api/auth/verify` returns **401** until the user signs in again. To keep accounts across deploys, attach a **persistent volume** and mount it at your app’s `data/` directory (or move sessions to Redis/Postgres later).

**Cost:** Free tier available, then $5/month

### Option 2: Render

1. **Sign up at [Render.com](https://render.com)**
2. **Create new Web Service**
3. **Connect your GitHub repository**
4. **Configure:**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python main.py`
5. **Set environment variables in Render dashboard**
6. **Deploy!**

**Cost:** Free tier available

### Option 3: Heroku

1. **Install Heroku CLI**
2. **Login:** `heroku login`
3. **Create app:** `heroku create your-app-name`
4. **Set environment variables:**
   ```bash
   heroku config:set OPENAI_API_KEY=your_key
   heroku config:set WORDNIK_API_KEY=your_key
   heroku config:set GOOGLE_CLIENT_ID=your_id
   heroku config:set GOOGLE_CLIENT_SECRET=your_secret
   heroku config:set SECRET_KEY=your_secret
   ```
5. **Deploy:** `git push heroku main`

**Cost:** $7/month minimum

## Environment Variables Required

```bash
# Required
OPENAI_API_KEY=sk-proj-...
WORDNIK_API_KEY=your_wordnik_key
SECRET_KEY=your_secret_key

# Optional (for Google OAuth)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Server settings
PORT=8000
DEBUG=False
HOST=0.0.0.0
```

## Post-Deployment Steps

1. **Update Google OAuth redirect URI** to your production domain
2. **Test all functionality** (login, poem submission, AI analysis)
3. **Set up monitoring** (optional but recommended)
4. **Configure custom domain** (optional)

## Security Checklist

- [ ] Environment variables are set securely
- [ ] DEBUG=False in production
- [ ] HTTPS is enabled (automatic on most platforms)
- [ ] Google OAuth redirect URI updated
- [ ] API keys are not exposed in code

## Troubleshooting

### Common Issues:
- **Port binding errors:** Make sure your app uses `os.getenv('PORT', 8000)`
- **Static files not loading:** Check that `public/` folder is included
- **Database errors:** JSON files will be created automatically
- **CORS errors:** Update CORS_ORIGINS with your domain

### Logs:
- Railway: View logs in dashboard
- Render: View logs in dashboard  
- Heroku: `heroku logs --tail`
