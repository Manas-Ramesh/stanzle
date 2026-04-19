# Stanzle

Poetry game: write from a daily theme and emotion, get AI scoring and feedback.

## Features

**Gameplay**

- Daily challenge: same theme and emotion for everyone that day
- Hard: scored on both theme and emotion
- Easy: pick theme or emotion as the main focus
- Optional word bank: four words that must appear in the poem
- Rich text editor for the poem

**AI**

- Guesses theme and emotion from the poem
- Scores match, creativity, and requirements
- Short written feedback

**Accounts and modes**

- Username/password and optional Google sign-in
- Profile with submission history
- Unlimited mode for practice
- One official daily submit per day when logged in
- Archive tracking for past dailies

## Quick start

**Requirements**

- Python 3.8+
- OpenAI API key
- Wordnik API key (optional, word bank)
- Google OAuth credentials (optional)

**Setup**

```bash
git clone https://github.com/yourusername/stanzle.git
cd stanzle
pip install -r requirements.txt
cp env.example .env
```

Edit `.env`:

```
OPENAI_API_KEY=your_openai_key_here
WORDNIK_API_KEY=your_wordnik_key_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SECRET_KEY=your_secret_key_here
```

**Run**

```bash
python main.py
```

Open `http://localhost:8000`.

## How to play

1. Pick hard or easy (and theme vs emotion focus on easy).
2. Turn word bank on or off.
3. Write and submit.
4. Read scores and feedback.

## Layout

```
stanzle/
├── public/              # Frontend (SPA build, static assets)
├── templates/           # Flask templates (if used)
├── src/backend/services/# Business logic
├── data/                # JSON data files
├── scripts/
├── main.py              # Flask app
├── requirements.txt
└── README.md
```

## Environment

| Variable | Purpose | Required |
|----------|---------|----------|
| `OPENAI_API_KEY` | Analysis and scoring | Yes |
| `WORDNIK_API_KEY` | Random words | No |
| `GOOGLE_CLIENT_ID` | Google login | No |
| `GOOGLE_CLIENT_SECRET` | Google login | No |
| `SECRET_KEY` | Sessions | Yes |

## Modes

**Daily**

- One official submission per day (logged in).
- Same prompt for all players that calendar day.

**Unlimited**

- New challenge when you refresh.
- No daily submit limit.

## Scoring (typical split)

**Hard (100 total)**

- Theme and emotion each part of the score
- Creativity included

**Easy (100 total)**

- Main weight on the side you chose (theme or emotion)
- Creativity included

Exact weights follow the live `/api/score` behavior.

## Development

```bash
export FLASK_ENV=development
python main.py
```

**Data files**

- `data/users.json` – users and history
- `data/sessions.json` – sessions
- `data/daily_challenges.json` – challenge archive

**Where to change things**

- Routes: `main.py`
- Services: `src/backend/services/`
- New React UI: `updatedDesign/` (build copies into `public/`)

## Contributing

Fork, branch, commit, push, open a pull request.

## License

MIT. See `LICENSE` if present.

## Credits

OpenAI, Wordnik (optional), Google OAuth, Flask.

## Support

Open an issue on GitHub.
