# Stanzle Game Architecture

## Project Structure

```
stanzle-game/
├── public/                     # Static files served to clients
│   ├── css/
│   │   └── styles.css         # Main stylesheet
│   ├── js/
│   │   └── game.js            # Frontend game logic
│   ├── images/                # Image assets
│   ├── fonts/                 # Font files
│   └── index.html             # Main HTML file
│
├── src/                       # Source code
│   ├── backend/              # Backend application
│   │   ├── app.py            # Flask application factory
│   │   ├── services/         # Business logic services
│   │   │   ├── openai_service.py    # OpenAI API integration
│   │   │   └── wordnik_service.py   # Wordnik API integration
│   │   ├── utils/            # Utility functions
│   │   │   └── validators.py # Data validation
│   │   ├── models/           # Data models (future)
│   │   ├── middleware/       # Custom middleware (future)
│   │   └── routes/           # API routes (future)
│   │
│   └── frontend/             # Frontend components
│       ├── components/       # Reusable UI components (future)
│       ├── utils/           # Frontend utilities (future)
│       └── services/        # Frontend services (future)
│
├── config/                   # Configuration files
│   └── settings.py          # Application settings
│
├── scripts/                 # Build and deployment scripts
│   └── start.sh             # Development startup script
│
├── tests/                   # Test files
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── fixtures/           # Test data
│
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md     # This file
│   ├── API.md             # API documentation
│   └── DEPLOYMENT.md      # Deployment guide
│
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
└── README.md              # Project overview
```

## Architecture Overview

### Backend Architecture

The backend follows a **Service-Oriented Architecture (SOA)** pattern:

- **Flask Application**: Main web framework
- **Services Layer**: Business logic separation
- **Utils Layer**: Reusable utility functions
- **Configuration**: Environment-based settings

### Frontend Architecture

The frontend uses a **Modular JavaScript** approach:

- **Game Class**: Main application controller
- **Event-Driven**: User interactions trigger methods
- **API Integration**: RESTful API communication
- **Responsive Design**: Mobile-first CSS approach

## Key Components

### 1. Flask Application (`src/backend/app.py`)
- **Application Factory Pattern**: Configurable app creation
- **CORS Support**: Cross-origin resource sharing
- **Error Handling**: Centralized error management
- **API Routes**: RESTful endpoints

### 2. OpenAI Service (`src/backend/services/openai_service.py`)
- **Poem Analysis**: Theme and emotion detection
- **Scoring System**: AI-powered poem evaluation
- **Mode Support**: Easy/Hard difficulty handling
- **Error Handling**: Robust API error management

### 3. Wordnik Service (`src/backend/services/wordnik_service.py`)
- **Random Words**: API integration for word banks
- **Filtering**: Technical word exclusion
- **Fallback System**: Offline word lists
- **Theme/Emotion Generation**: Curated word lists

### 4. Frontend Game (`src/frontend/js/game.js`)
- **State Management**: Game state tracking
- **UI Updates**: Dynamic interface updates
- **API Communication**: Backend integration
- **Writing Tools**: Advanced editor features

## API Endpoints

### GET `/api/challenge`
- **Purpose**: Get daily challenge (theme, emotion, words)
- **Response**: JSON with challenge data
- **Fallback**: Predefined challenges if API fails

### POST `/api/analyze`
- **Purpose**: Analyze poem for theme/emotion
- **Body**: `{poem, mode, focus}`
- **Response**: AI analysis results

### POST `/api/score`
- **Purpose**: Score poem based on criteria
- **Body**: `{poem, intended_theme, intended_emotion, ai_guess, difficulty, focus}`
- **Response**: Scoring breakdown

## Configuration

### Environment Variables
- `OPENAI_API_KEY`: OpenAI API access
- `WORDNIK_API_KEY`: Wordnik API access (optional)
- `SECRET_KEY`: Flask secret key
- `DEBUG`: Development mode flag

### Settings Classes
- **DevelopmentConfig**: Development settings
- **ProductionConfig**: Production settings
- **TestingConfig**: Test environment settings

## Development Workflow

### 1. Setup
```bash
./scripts/start.sh
```

### 2. Development
- Backend: Flask development server
- Frontend: Static file serving
- Hot reload: Automatic restart on changes

### 3. Testing
```bash
pytest tests/
```

### 4. Deployment
- Production: Gunicorn WSGI server
- Static files: Nginx or CDN
- Environment: Docker containers

## Future Enhancements

### Backend
- **Database Integration**: User accounts, poem history
- **Authentication**: User login/registration
- **Caching**: Redis for performance
- **Monitoring**: Application metrics

### Frontend
- **Component System**: Reusable UI components
- **State Management**: Redux or Vuex
- **PWA Support**: Offline functionality
- **Mobile App**: React Native or Flutter

### Infrastructure
- **CI/CD**: Automated testing and deployment
- **Containerization**: Docker support
- **Cloud Deployment**: AWS/Azure/GCP
- **Monitoring**: Application performance monitoring
