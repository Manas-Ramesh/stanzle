# Stanzle 🎭

A creative poetry game where players write poems based on given themes and emotions, with AI-powered scoring and analysis.

## 🌟 Features

### Core Gameplay
- **Daily Challenges**: New theme and emotion combinations every day
- **Difficulty Modes**: 
  - **Hard Mode**: Use both theme and emotion
  - **Easy Mode**: Choose to focus on either theme or emotion
- **Word Bank**: Optional feature with 4 random words that must be included
- **Rich Text Editor**: Google Docs-style editing with formatting tools

### AI Integration
- **OpenAI Analysis**: AI guesses the theme and emotion from your poem
- **Intelligent Scoring**: Scores based on accuracy, creativity, and adherence to requirements
- **Detailed Feedback**: Get insights on how to improve your poetry

### User Experience
- **User Authentication**: Secure login with username/password and Google OAuth
- **Profile System**: Track your poetry journey with detailed submission history
- **Unlimited Mode**: Practice with unlimited challenges
- **Daily Limits**: One submission per day for daily challenges
- **Archive System**: Track all challenges for future reference

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- OpenAI API key
- Wordnik API key (optional)
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/stanzle.git
   cd stanzle
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your API keys:
   ```
   OPENAI_API_KEY=your_openai_key_here
   WORDNIK_API_KEY=your_wordnik_key_here
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   SECRET_KEY=your_secret_key_here
   ```

4. **Run the application**
   ```bash
   python main.py
   ```

5. **Open your browser**
   Navigate to `http://localhost:8000`

## 🎮 How to Play

1. **Choose your mode**: Hard (use both theme and emotion) or Easy (pick one)
2. **Optional**: Enable word bank for an extra challenge
3. **Write your poem**: Use the rich text editor to craft your masterpiece
4. **Submit**: Get AI analysis and scoring
5. **View results**: See how well you captured the theme and emotion

## 🏗️ Project Structure

```
stanzle/
├── public/                 # Frontend files
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   ├── index.html        # Main game page
│   ├── unlimited.html    # Unlimited mode page
│   ├── profile.html      # User profile page
│   └── landing.html      # Landing page
├── templates/            # Flask templates
├── src/
│   └── backend/          # Backend services
│       └── services/     # Business logic
├── data/                 # Data storage
├── scripts/              # Utility scripts
├── main.py              # Flask application
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## 🔧 Configuration

### API Keys Required

- **OpenAI API**: For poem analysis and scoring
- **Wordnik API**: For random word generation (optional)
- **Google OAuth**: For social login (optional)

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI analysis | Yes |
| `WORDNIK_API_KEY` | Wordnik API key for word bank | No |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `SECRET_KEY` | Flask secret key for sessions | Yes |

## 🎯 Game Modes

### Daily Challenge
- One challenge per day
- Same theme/emotion for all players
- One submission per day
- Track your progress over time

### Unlimited Mode
- Practice with unlimited challenges
- New challenge on each page refresh
- No submission limits
- Perfect for honing your skills

## 📊 Scoring System

### Hard Mode (100 points total)
- **Theme Accuracy**: 40 points
- **Emotion Accuracy**: 40 points  
- **Creativity**: 20 points

### Easy Mode (100 points total)
- **Chosen Focus** (theme OR emotion): 80 points
- **Creativity**: 20 points

## 🛠️ Development

### Running in Development Mode
```bash
export FLASK_ENV=development
python main.py
```

### Database Management
The app uses JSON files for data storage:
- `data/users.json`: User accounts and submission history
- `data/sessions.json`: Active user sessions
- `data/daily_challenges.json`: Challenge archive

### Adding New Features
1. Backend: Add routes in `main.py` and services in `src/backend/services/`
2. Frontend: Update HTML templates and JavaScript files
3. Styling: Modify CSS files in `public/css/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for AI analysis capabilities
- Wordnik for word bank functionality
- Google for OAuth integration
- Flask community for the web framework

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Happy Poetry Writing! 🎭✨**