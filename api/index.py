import os
import sys

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the main app configuration
from main import app

# Configure for Vercel
app.config['DEBUG'] = False

# Vercel expects the Flask app to be available as 'application'
application = app