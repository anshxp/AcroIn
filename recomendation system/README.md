# Recommendation System

Standalone Python backend for ranking students for the Acro-In recommendations page.

## What it does

- Scores students by skill overlap, department match, profile completeness, verification status, and text relevance.
- Accepts a student list in the request body for tests or offline use.
- Falls back to MongoDB if `MONGO_URI` is configured.

## Run locally

```bash
cd "recomendation system"
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

## Environment variables

- `MONGO_URI` - MongoDB connection string used to load students
- `MONGO_DB` - Database name, defaults to `acroin`
- `MONGO_STUDENT_COLLECTION` - Student collection name, defaults to `students`
- `RECOMMENDATION_API_KEY` - Internal service key; must match the backend value in production
- `ENVIRONMENT` - Use `production` for deployment; production startup requires a key, MongoDB URI, and explicit origins
- `ALLOWED_ORIGINS` - Comma-separated explicit HTTPS frontend origins in production; wildcard origins are rejected
