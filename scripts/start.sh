#!/bin/bash

# Stanzle Game Startup Script
# Professional startup script with environment checks

set -e  # Exit on any error

echo "🎭 Starting Stanzle Poetry Game..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is required but not installed."
    exit 1
fi

print_success "Python 3 found: $(python3 --version)"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_status "Creating virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
print_status "Installing dependencies..."
pip install -r requirements.txt

# Check environment variables
print_status "Checking environment variables..."

if [ -z "$OPENAI_API_KEY" ]; then
    print_warning "OPENAI_API_KEY environment variable is not set."
    print_warning "The game will work with mock responses, but for full AI functionality,"
    print_warning "please set your OpenAI API key:"
    print_warning "export OPENAI_API_KEY='your-api-key-here'"
    echo ""
fi

if [ -z "$WORDNIK_API_KEY" ]; then
    print_warning "WORDNIK_API_KEY environment variable is not set."
    print_warning "The game will use fallback word lists instead of Wordnik API."
    echo ""
fi

# Check if .env file exists
if [ -f ".env" ]; then
    print_success "Found .env file"
else
    print_warning "No .env file found. Consider creating one with your API keys."
fi

# Start the application
print_status "Starting Stanzle server..."
print_success "Server will be available at http://localhost:8000"
print_success "Press Ctrl+C to stop the server"
echo ""

# Run the Flask application
python main.py