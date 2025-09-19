# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the Stanzle game.

## Prerequisites

- Google Cloud Console account
- Python environment with Flask
- Basic understanding of OAuth 2.0

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Stanzle Game"
4. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API" and enable it
3. Also enable "Google Identity" API

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set the following:
   - **Name**: Stanzle Game Auth
   - **Authorized JavaScript origins**: 
     - `http://localhost:8000`
     - `http://127.0.0.1:8000`
   - **Authorized redirect URIs**:
     - `http://localhost:8000/login/google/authorized`
     - `http://127.0.0.1:5000/login/google/authorized`

5. Click "Create"
6. **Save the Client ID and Client Secret** - you'll need these!

## Step 4: Install Required Packages

```bash
pip install google-auth google-auth-oauthlib google-auth-httplib2
```

## Step 5: Update Environment Variables

Create or update your `.env` file:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

## Step 6: Update Backend Code

Add these imports to `main.py`:

```python
from google.auth.transport import requests
from google.oauth2 import id_token
import google.auth.transport.requests
```

Add Google OAuth routes:

```python
@app.route('/auth/google')
def google_login():
    """Initiate Google OAuth login"""
    client_id = os.getenv('GOOGLE_CLIENT_ID')
    redirect_uri = os.getenv('GOOGLE_REDIRECT_URI')
    
    # Create the authorization URL
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"scope=openid%20email%20profile&"
        f"response_type=code&"
        f"access_type=offline"
    )
    
    return redirect(auth_url)

@app.route('/auth/google/callback')
def google_callback():
    """Handle Google OAuth callback"""
    try:
        code = request.args.get('code')
        client_id = os.getenv('GOOGLE_CLIENT_ID')
        client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
        redirect_uri = os.getenv('GOOGLE_REDIRECT_URI')
        
        # Exchange code for token
        token_url = 'https://oauth2.googleapis.com/token'
        token_data = {
            'client_id': client_id,
            'client_secret': client_secret,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri
        }
        
        token_response = requests.post(token_url, data=token_data)
        token_json = token_response.json()
        access_token = token_json['access_token']
        
        # Get user info
        user_info_url = f'https://www.googleapis.com/oauth2/v2/userinfo?access_token={access_token}'
        user_response = requests.get(user_info_url)
        user_info = user_response.json()
        
        # Create or find user
        email = user_info['email']
        username = email.split('@')[0]
        
        # Create session
        session_token = secrets.token_urlsafe(32)
        sessions = auth_service._load_sessions()
        
        sessions[session_token] = {
            'username': username,
            'created_at': datetime.now().isoformat(),
            'expires_at': (datetime.now() + timedelta(days=7)).isoformat()
        }
        auth_service._save_sessions(sessions)
        
        # Set cookie and redirect
        response = redirect('/')
        response.set_cookie('authToken', session_token, max_age=7*24*60*60)
        return response
        
    except Exception as e:
        return redirect('/landing?error=google_auth_failed')
```

## Step 7: Update Frontend

Update the Google login button in `landing.js`:

```javascript
async handleGoogleLogin() {
    try {
        // Redirect to Google OAuth
        window.location.href = '/auth/google';
    } catch (error) {
        console.error('Google login error:', error);
        alert('Google login failed. Please try again.');
    }
}
```

## Step 8: Test the Integration

1. Start your Flask server: `python main.py`
2. Go to `http://localhost:8000`
3. Click "Play" to open the login modal
4. Click "Continue with Google"
5. You should be redirected to Google's OAuth page
6. After authorization, you'll be redirected back to the game

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch"**: 
   - Check that your redirect URI in Google Console matches exactly
   - Make sure there are no trailing slashes

2. **"invalid_client"**:
   - Verify your Client ID and Client Secret are correct
   - Check that the OAuth consent screen is configured

3. **"access_denied"**:
   - User denied permission - this is normal
   - Make sure your OAuth consent screen is properly configured

### OAuth Consent Screen Setup:

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" (unless you have a Google Workspace)
3. Fill in required fields:
   - App name: "Stanzle Game"
   - User support email: your email
   - Developer contact: your email
4. Add scopes: `openid`, `email`, `profile`
5. Add test users (your email) if in testing mode

## Security Notes

- Never commit your Client Secret to version control
- Use environment variables for all sensitive data
- Consider using HTTPS in production
- Implement proper session management
- Add CSRF protection for production use

## Production Considerations

- Use HTTPS URLs in production
- Update redirect URIs for your production domain
- Implement proper error handling
- Add logging for security monitoring
- Consider rate limiting for OAuth endpoints

## Next Steps

Once Google OAuth is working:

1. Add user profile pictures from Google
2. Implement proper user data synchronization
3. Add logout functionality that revokes Google tokens
4. Consider adding other OAuth providers (GitHub, Facebook, etc.)
5. Implement proper session management and security

## Support

If you encounter issues:

1. Check the Google Cloud Console for error details
2. Verify all URLs and credentials are correct
3. Test with a simple OAuth flow first
4. Check browser console for JavaScript errors
5. Review Flask server logs for backend errors
