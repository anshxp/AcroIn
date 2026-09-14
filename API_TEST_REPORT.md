# AcroIn API Audit Report

Date: 2026-09-06

## Executive Summary

The backend is running and MongoDB connectivity is healthy, but the application is not fully operational in the current environment because the production auth configuration is invalid. The backend refuses to start in production mode unless required environment variables are supplied and the JWT secret is at least 32 characters long. As a result, live authentication and all JWT-protected routes are blocked until the runtime configuration is corrected.

The core evidence is from live requests to the running API and direct inspection of the backend configuration in [backend/server.js](backend/server.js) and [backend/routes/auth.js](backend/routes/auth.js):

- `/health` returns `200` with `{"success":true,"status":"healthy","database":"connected"}`.
- `/ready` returns `200`.
- Public landing endpoints return `200`.
- Login attempts return `500` when the server runs without a valid JWT secret, and the app exits in production mode if the secret is too short.
- Auth-protected endpoints return `401 No token provided` when no token exists, which is expected; however, the app cannot issue valid tokens in the current production configuration.

## Environment and Runtime Findings

### Startup blockers

The app initialization logic in [backend/server.js](backend/server.js) enforces production checks:

- required variables include `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`, `RECOMMENDATION_SERVICE_URL`, and `RECOMMENDATION_API_KEY`.
- `JWT_SECRET` must be at least 32 characters long in production.

Observed runtime startup output:

- `Missing required production environment variables: FRONTEND_URL, RECOMMENDATION_SERVICE_URL, RECOMMENDATION_API_KEY`
- `JWT_SECRET must be at least 32 characters in production.`

This is a real blocker, not a test artifact.

### Database status

Live MongoDB validation shows the project is connected to the configured Atlas database and contains seed/demo data. Verified counts included:

- 7 students
- 1 faculty
- 0 admins in the default seeded dataset
- several demo users and the expected demo faculty/student accounts

The seeded credentials in the repo include:

- `lavishjangid230719@acropolis.in` / `Lavish@262`
- `lavishjnagid682@gmail.com` / `Lavish@262`
- `sandeep.sharma@acropolis.in` / `Lavish@262`

These were validated as valid hash comparisons against the database records.

## Endpoint Testing Results

### Public / non-authenticated endpoints

Status: PASS

- `GET /health` — PASS. Response `200` and healthy DB status.
- `GET /ready` — PASS. Response `200`.
- `GET /landing/content` — PASS. Response `200`.
- `GET /landing/stats` — PASS. Response `200`.
- `GET /opportunities` — PASS. Response `200` with a populated array of opportunity records.

### Authentication endpoints

Status: FAIL / BLOCKED

- `POST /auth/student/login` — FAIL in the current configuration.
  - Earlier runtime: `500 {"success":false,"message":"Login failed"}` while secret was undefined.
  - In production config, the backend exits before it can serve requests when the JWT secret is short.
- `POST /auth/login` — FAIL / BLOCKED for the same reason.
- `POST /auth/register/student` — NOT FULLY VERIFIABLE in the current state because the seeded email already exists; route responds with `409` when the same account is re-used.
- `POST /internal/admin-bootstrap` — NOT TESTED because the bootstrap feature is disabled by configuration and the app is not running in a clean production-auth state.

### Auth-protected endpoints

Status: BLOCKED due to auth runtime failure

These routes are mounted and registered in the app, but they cannot be validated end-to-end until the login flow can issue valid JWTs:

- `GET /students`
- `GET /faculty`
- `GET /posts`
- `GET /admin`
- `GET /notifications/:userId`
- `GET /interests/:opportunityId/has-interest`
- `POST /faculty/face-search`
- all student/faculty/admin CRUD routes under the mounted routers

Observed behavior:

- Without a token, the server correctly returns `401 {"success":false,"message":"No token provided"}`.
- The issue is not route registration; the issue is that the JWT system cannot be completed successfully under the current runtime configuration.

## Route Inventory Status

From the route declarations in the backend, the following route groups exist:

- Auth: [backend/routes/auth.js](backend/routes/auth.js)
- Student: [backend/routes/student.js](backend/routes/student.js)
- Faculty: [backend/routes/faculty.js](backend/routes/faculty.js)
- Admin: [backend/routes/admin.js](backend/routes/admin.js)
- Opportunities: [backend/routes/opportunity.js](backend/routes/opportunity.js)
- Posts: [backend/routes/post.js](backend/routes/post.js)
- Certificates: [backend/routes/certificate.js](backend/routes/certificate.js)
- Competitions: [backend/routes/competition.js](backend/routes/competition.js)
- Internships: [backend/routes/internship.js](backend/routes/internship.js)
- Notifications: [backend/routes/notification.js](backend/routes/notification.js)
- Interests: [backend/routes/interest.js](backend/routes/interest.js)
- Landing: [backend/routes/landing.js](backend/routes/landing.js)
- Projects: [backend/routes/project.js](backend/routes/project.js)
- UI: [backend/routes/ui.js](backend/routes/ui.js)

The codebase clearly contains a broad API surface, but the live audit shows the application is not currently in a fully working state because the auth/config pipeline is broken.

## Final Verdict

This project does not currently pass a full functional API audit.

### Verified working
- health/readiness checks
- landing/public pages
- opportunity listing read endpoint
- MongoDB connectivity

### Blocked by configuration/runtime issue
- JWT-based login
- all protected endpoints
- admin/faculty/student authenticated workflows

### Root cause
The backend enforces a minimum 32-character `JWT_SECRET` in production and it is currently configured with a too-short value. This prevents the API from fully booting and issuing valid tokens. The app also requires other production env values that are not present unless set for the local runtime.

## Recommended Next Step

Set a valid 32+ character JWT secret and the required production env values, then restart the backend and rerun the auth tests before continuing with the full route-by-route validation.

Example fix:

- `JWT_SECRET=your-32-character-long-secret-here`
- `FRONTEND_URL=http://localhost:5173`
- `RECOMMENDATION_SERVICE_URL=http://localhost:8000`
- `RECOMMENDATION_API_KEY=test-key`

Once the env is corrected, the next audit pass should test each protected route with real JWTs generated by the live login endpoints.
