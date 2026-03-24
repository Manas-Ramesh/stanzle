#!/bin/bash

# Stanzle Poetry Game - Vercel Deployment Script

echo "🚀 Deploying Stanzle Poetry Game to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing now..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel..."
    vercel login
fi

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "📝 Don't forget to:"
echo "   1. Set up environment variables in Vercel dashboard"
echo "   2. Update Google OAuth redirect URIs"
echo "   3. Test your deployed application"
echo ""
echo "🔗 Check the VERCEL_DEPLOYMENT.md file for detailed instructions"
