# Fasal Mitra Backend

A Flask-based backend API for the Fasal Mitra application.

## Setup

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Run the development server:**
   ```bash
   python app.py
   ```

   The server will start on `http://localhost:5000`

## API Endpoints

### Base URL: `http://localhost:5000`

- `GET /` - Hello World endpoint
  - Returns: `{"message": "Hello World from Flask Backend!", "status": "success"}`

- `GET /api/health` - Health check endpoint
  - Returns: `{"status": "healthy", "service": "fasal-mitra-backend", "version": "1.0.0"}`

## Development

- The server runs in debug mode by default
- CORS is enabled for all routes to allow frontend integration
- Environment variables can be configured in a `.env` file

## Project Structure

```
backend/
├── app.py              # Main Flask application
├── config.py           # Configuration settings
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

## Next Steps

- Add database models and migrations
- Implement authentication
- Add more API endpoints for crop diagnosis, market analysis, etc.
- Add proper error handling and logging 