# Google OAuth setup

Sign-in with Google for Stanzle uses Flask routes in `main.py` (start at `/login/google`, callback at `/login/google/authorized`).

## Google Cloud

1. [Google Cloud Console](https://console.cloud.google.com/) → create or select a project.
2. APIs & Services → Library: enable what Google requires for OAuth (People / Google Identity as prompted by the console).
3. APIs & Services → Credentials → Create credentials → OAuth client ID → **Web application**.

**Authorized JavaScript origins** (examples for local dev):

- `http://localhost:8000`
- `http://127.0.0.1:8000`

Add your production origin(s) when you deploy.

**Authorized redirect URIs** (must match the server exactly):

- Local: `http://localhost:8000/login/google/authorized` (or the port you use)
- Production: `https://your-domain.com/login/google/authorized`

The app builds the redirect URI from `GOOGLE_REDIRECT_URI`, or from `PUBLIC_APP_URL` / `FRONTEND_URL` / request host; see `_google_oauth_redirect_uri()` in `main.py`.

4. Save the **Client ID** and **Client Secret**.

## App environment

In `.env` (or your host’s env panel):

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

Optional (override auto-detected callback):

```env
GOOGLE_REDIRECT_URI=https://your-domain.com/login/google/authorized
```

Use HTTPS URLs in production.

## Python packages

Google libraries should already be in `requirements.txt`. If not:

```bash
pip install google-auth google-auth-oauthlib google-auth-httplib2
```

## OAuth consent screen

APIs & Services → OAuth consent screen: app name, support email, scopes (`openid`, `email`, `profile`). In testing mode, add test users.

## Test

1. `python main.py`
2. Open the app, use “Continue with Google” (or the link that hits `/login/google`).
3. Complete Google consent; you should return to the app with a session.

## Common errors

- **redirect_uri_mismatch**: Console redirect URI must match character-for-character what the server sends (scheme, host, port, path).
- **invalid_client**: Wrong ID/secret or wrong project.
- **access_denied**: User cancelled; or consent screen / test users not configured.

## Security

- Do not commit secrets.
- Use HTTPS in production.
- Rotate client secret if it leaks.

The detailed token exchange and user creation live in `main.py` (`google_login`, `google_callback`, `setup_google_user`); keep this doc aligned when those routes change.
