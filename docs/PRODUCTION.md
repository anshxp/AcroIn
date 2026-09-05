# AcroIn Production Deployment

## Architecture

The browser/mobile clients communicate with the authenticated Node/Express API. The backend communicates with the face-recognition and recommendation services. Internal service API keys must never be exposed to frontend or mobile builds.

## Required backend configuration

- `NODE_ENV=production`
- `MONGO_URI`
- `JWT_SECRET`
- `FRONTEND_URLS`
- `FACE_REC_SERVICE_URL`
- `FACE_API_KEY`
- `RECOMMENDATION_SERVICE_URL`
- `RECOMMENDATION_API_KEY`

Use long, randomly generated secrets. Do not commit `.env` files.

## Required recommendation-service configuration

- `ENVIRONMENT=production`
- `MONGO_URI`
- `MONGO_DB`
- `MONGO_STUDENT_COLLECTION`
- `RECOMMENDATION_API_KEY` (must match the backend)

## Frontend configuration

Set `VITE_API_URL` to the public HTTPS backend URL in the hosting provider. Do not put `RECOMMENDATION_API_KEY` or `FACE_API_KEY` in frontend environment variables.

The Vercel configuration in `frontend/vercel.json` provides SPA fallback routing so direct navigation to React Router paths resolves to `index.html`.

## Mobile configuration

Set `EXPO_PUBLIC_API_URL` to the public HTTPS backend URL for release builds. Localhost/Expo-host discovery is intended for development only.

## Health checks

Backend:

- `GET /health` checks database connectivity and returns 503 when the database is unavailable.
- `GET /ready` is a readiness check and returns 503 until MongoDB is connected.

Face service:

- `GET /` is the service health endpoint.

Recommendation service:

- `GET /recommendations/health` is the service health endpoint.

## Deployment order

1. Provision MongoDB and create application database/collections.
2. Deploy recommendation service and configure its internal API key.
3. Deploy face-recognition service and configure its API key.
4. Deploy backend with both internal service URLs and matching keys.
5. Verify `/health` and `/ready`.
6. Deploy frontend with `VITE_API_URL` pointing to the backend.
7. Configure `FRONTEND_URLS` on the backend to the exact frontend origin(s).
8. Build and test mobile against the same HTTPS backend.

## Production requirements

- HTTPS for all public services.
- No wildcard CORS in production.
- No secrets in client bundles.
- MongoDB credentials stored in the hosting provider's secret manager.
- Face and recommendation services not publicly callable without their internal API keys.
- CI must pass before merging to `main`.
- Monitor application and service logs without logging passwords, tokens, API keys, or biometric embeddings.
