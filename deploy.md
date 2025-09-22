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
