# Stanzle Challenge Archive System

This system tracks all daily challenges for future archive mode functionality.

## 📁 Data Storage

### JSON Format (`data/daily_challenges.json`)
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

### CSV Format (`data/daily_challenges.csv`)
```csv
date,theme,emotion,word1,word2,word3,word4,submissions_count,avg_score,best_score,created_at
2025-01-19,Adventure,Joy,mountain,journey,discover,freedom,15,67.3,95,2025-01-19T10:30:00
```

## 🔧 API Endpoints

### Get All Challenges
```
GET /api/archive/challenges
```
Returns all tracked challenges.

### Get Challenge by Date
```
GET /api/archive/challenge/2025-01-19
```
Returns a specific challenge by date (YYYY-MM-DD format).

### Export Challenges
```
GET /api/archive/export
```
Exports all challenges to a timestamped CSV file.

## 📊 Tracked Data

For each daily challenge, the system tracks:

- **Basic Info**: Date, theme, emotion, required words
- **Statistics**: 
  - `submissions_count`: Number of users who submitted
  - `avg_score`: Average score across all submissions
  - `best_score`: Highest score achieved
- **Metadata**: Creation timestamp

## 🚀 Usage

### View Challenges
```bash
python scripts/view_challenges.py
```

### Access via API
```javascript
// Get all challenges
fetch('/api/archive/challenges')
  .then(response => response.json())
  .then(data => console.log(data.challenges));

// Get specific challenge
fetch('/api/archive/challenge/2025-01-19')
  .then(response => response.json())
  .then(data => console.log(data.challenge));
```

## 🔮 Future Archive Mode

This data will be used to implement an archive mode where users can:

1. **Browse Past Challenges**: View all previous daily challenges
2. **Replay Challenges**: Try challenges from specific dates
3. **Challenge History**: See statistics and popular challenges
4. **Leaderboards**: Compare scores across different days

## 📈 Statistics Tracking

The system automatically updates statistics when users submit daily scores:

- **Submission Count**: Increments with each submission
- **Average Score**: Calculated across all submissions
- **Best Score**: Tracks the highest score achieved

## 🗂️ File Structure

```
data/
├── daily_challenges.json    # Main JSON storage
├── daily_challenges.csv     # CSV backup/export
└── challenges_export_*.csv  # Timestamped exports
```

## 🔧 Configuration

The archive system is automatically enabled and requires no configuration. Data is stored in the `data/` directory and persists across server restarts.
