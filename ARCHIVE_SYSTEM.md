# Challenge archive

Tracks each daily challenge for stats and a possible future archive UI.

## Storage

**JSON** (`data/daily_challenges.json`)

```json
{
  "2025-01-19": {
    "date": "2025-01-19",
    "theme": "Adventure",
    "emotion": "Joy",
    "words": ["mountain", "journey", "discover", "freedom"],
    "submissions_count": 15,
    "avg_score": 67.3,
    "best_score": 95,
    "created_at": "2025-01-19T10:30:00"
  }
}
```

**CSV** (`data/daily_challenges.csv`)

```csv
date,theme,emotion,word1,word2,word3,word4,submissions_count,avg_score,best_score,created_at
2025-01-19,Adventure,Joy,mountain,journey,discover,freedom,15,67.3,95,2025-01-19T10:30:00
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/archive/challenges` | All tracked challenges |
| GET | `/api/archive/challenge/YYYY-MM-DD` | One day |
| GET | `/api/archive/export` | CSV export (timestamped file) |

## Fields per day

- Date, theme, emotion, word list
- `submissions_count`, `avg_score`, `best_score`
- `created_at`

## Scripts

```bash
python scripts/view_challenges.py
```

**Example fetch**

```javascript
fetch("/api/archive/challenges")
  .then((r) => r.json())
  .then((data) => console.log(data.challenges));

fetch("/api/archive/challenge/2025-01-19")
  .then((r) => r.json())
  .then((data) => console.log(data.challenge));
```

## Future archive mode

Possible uses:

- Browse past dailies
- Replay a date
- History and stats
- Compare days on a leaderboard

## Stats updates

On daily submit, the backend can update counts, average score, and best score for that date.

## Files

```
data/
├── daily_challenges.json
├── daily_challenges.csv
└── challenges_export_*.csv
```

No extra config: writes under `data/` and survives restarts if the disk is persistent.
