# Vercel Deployment Guide for Stanzle Poetry Game

This guide will help you deploy your Flask-based Stanzle Poetry Game to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **API Keys**: You'll need the following API keys:
   - OpenAI API Key
   - Wordnik API Key (optional)
   - Google OAuth credentials (if using Google login)

## Step 1: Prepare Your Repository

### Repository layout (required)

The Flask app and the React UI live in the **same GitHub repository**. Your **git root** and Vercel **Root Directory** are the inner project folder (the one that contains `main.py`, `vercel.json`, and `api/`):

```
your-repo/                 ← git root = Vercel Root Directory
  api/
  updatedDesign/           ← React (Vite) source; built and copied into public/ on deploy
  public/                  ← SPA build output (index.html + assets/) is generated here
  scripts/build-spa.sh
  main.py
  vercel.json
  ...
```

Keep **`updatedDesign/` inside this repo** so GitHub clones include the frontend; the build script reads it from `./updatedDesign` (not a folder above the repo).

### What deploys

- Vercel runs **`installCommand`**: installs Python deps and runs **`npm ci`** in **`updatedDesign/`** (relative to the project root).
- Then **`buildCommand`**: runs **`scripts/build-spa.sh`**, which builds the React app and copies **`dist/`** into **`public/`** (overwriting `public/index.html` and `public/assets/`).
- The live site **`/`** is the **new React app**. Legacy HTML is still available at **`/landing`**, and the old daily game HTML is saved as **`/classic-daily.html`**.

### Local production-like check

From the inner `stanzle` folder:

```bash
bash scripts/build-spa.sh
python main.py
```

Open `http://localhost:8000` — API and SPA share the same origin (no `VITE_API_BASE` needed).

### Files for Vercel

- `vercel.json` - Vercel configuration (includes SPA build commands)
- `api/index.py` - Serverless function entry point
- `requirements.txt` - Python dependencies
- `vercel-env.example` - Environment variables template
- `package.json` - Node engine hint + `build:spa` script (optional locally)

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**:
   ```bash
   cd /Users/mramesh21/Desktop/stanzle/stanzle
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Choose your Git repository
   - Confirm settings

### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Under **Root Directory**, choose **`stanzle`** (the folder that contains `main.py` and `vercel.json`)
5. Confirm **Install Command** is `pip install -r requirements.txt && cd updatedDesign && npm ci` and **Build Command** is `bash scripts/build-spa.sh` (or rely on values from `vercel.json` if the dashboard picks them up)
6. Set **Node.js** to **18.x** or newer (Project Settings → General)

## Step 3: Configure Environment Variables

1. **In your Vercel dashboard**, go to your project settings
2. **Navigate to Environment Variables**
3. **Add the following variables** (copy from `vercel-env.example`):

### Required Variables:
```
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=300
OPENAI_TEMPERATURE=0.7
```

### Optional Variables:
```
WORDNIK_API_KEY=your_wordnik_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
SECRET_KEY=your_secret_key_here
FRONTEND_URL=https://your-app-name.vercel.app
```

Set **`FRONTEND_URL`** to your **canonical site URL** (same as the SPA, no trailing slash). Google OAuth after sign-in redirects there. For local dev with the React dev server, use `http://localhost:5173` in `.env` instead.

### System Variables (Auto-set by Vercel):
```
VERCEL_URL=your-app-name.vercel.app
CORS_ORIGINS=*
FLASK_ENV=production
```

## Step 4: Update Google OAuth Settings

If you're using Google OAuth:

1. **Go to Google Cloud Console**
2. **Navigate to APIs & Services > Credentials**
3. **Update your OAuth 2.0 Client ID**:
   - Add your Vercel domain to authorized redirect URIs
   - Format: `https://your-app-name.vercel.app/login/google/authorized`

## Step 5: Test Your Deployment

1. **Visit your Vercel URL** (provided after deployment)
2. **Test the main functionality**:
   - **`/`** loads the **new React app** (home, play, unlimited, progress)
   - **`/landing`** still serves the **legacy HTML** landing if needed
   - User registration/login (including Google) works
   - Daily / unlimited play and API endpoints respond correctly

## Step 6: Custom Domain (Optional)

1. **In Vercel dashboard**, go to your project
2. **Navigate to Settings > Domains**
3. **Add your custom domain**
4. **Update DNS records** as instructed

## Troubleshooting

### Common Issues:

1. **Import Errors**: Make sure all Python files are in the correct directory structure
2. **Environment Variables**: Double-check all required variables are set
3. **CORS Issues**: Ensure `CORS_ORIGINS` is set to `*` or your specific domain
4. **Static Files**: Check that static files are being served correctly
5. **Google OAuth**: Verify redirect URIs match your Vercel domain

### Debugging:

1. **Check Vercel Function Logs**:
   - Go to your project dashboard
   - Click on "Functions" tab
   - View logs for any errors

2. **Test Locally with Vercel**:
   ```bash
   vercel dev
   ```

3. **Check Environment Variables**:
   - Ensure all required variables are set
   - Verify variable names match exactly

## File Structure for Vercel

Your project should have this structure:
```
stanzle/
├── api/
│   └── index.py          # Vercel serverless function
├── public/               # Static files
├── src/                  # Source code
├── main.py               # Main Flask app
├── requirements.txt      # Python dependencies
├── vercel.json          # Vercel configuration
└── vercel-env.example   # Environment variables template
```

## Performance Considerations

1. **Cold Starts**: First request may be slower due to serverless cold starts
2. **Memory Limits**: Vercel has memory limits for serverless functions
3. **Timeout**: Functions have a 30-second timeout (configurable)
4. **File Storage**: Consider using external storage for user data in production

## Next Steps

1. **Monitor Performance**: Use Vercel Analytics to monitor your app
2. **Set up Monitoring**: Consider adding error tracking (Sentry, etc.)
3. **Database**: For production, consider using a proper database instead of JSON files
4. **CDN**: Vercel automatically provides CDN for static assets

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Flask on Vercel**: [vercel.com/docs/functions/serverless-functions/runtimes/python](https://vercel.com/docs/functions/serverless-functions/runtimes/python)
- **Project Issues**: Check your project's GitHub issues
