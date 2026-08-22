# AcroIn Mobile — Backend Handoff Checklist

**Mobile app status:** Feature-complete on the client side. All screens, navigation, API wiring, error handling, and auth flows are implemented. Remaining work is **backend data, deployment, and API gaps** listed below.

---

## How to run mobile against your backend

```bash
cd mobile
cp .env.example .env.local   # set EXPO_PUBLIC_API_URL to deployed or LAN URL
npx expo start
```

Verify Metro log shows: `[API] Using base URL: <your-url>`

Health check: `GET <API_URL>/health` → `{ "success": true }`

---

## What mobile already implements

| Feature | Endpoint(s) | Notes |
|---------|-------------|--------|
| Login / student register | `POST /auth/login`, `POST /auth/student/register` | Faculty self-register **disabled in UI** (no backend route) |
| Home feed (paginated) | `GET /posts?page=&limit=` | Infinite scroll |
| Smart search | `GET /students?page=&limit=` | Client filter; tap → profile view |
| Student profile view | `GET /students/:id` | |
| Edit profile | `PUT /students/:id` | Strips locked `parentInfo` |
| Profile image upload | `POST /students/:id/upload-profile-image` | multipart |
| Projects / internships / competitions / certificates / skills | CRUD under respective routes | Uses `profileId` (Student `_id`) |
| CDC opportunities (student) | `GET /opportunities`, `POST /interests/:id/mark` | Browse + mark interest |
| Faculty post opportunities | `POST /opportunities` | From profile menu |
| Faculty create post | `POST /posts` | Home → + button (faculty/admin) |
| Chat list / window | `GET /chats/:userId`, `POST /chats`, `POST /chats/:id/message` | Uses `authUserId` (User `_id`) |
| Notifications | `GET /notifications/:userId` | Uses `authUserId` |
| Face enrollment | `POST /students/:id/face/enroll` | Requires face service |

---

## Backend owner action items

### P0 — Required for demo/production

- [ ] **Deploy API** with stable HTTPS/LAN URL and document it for mobile `.env.local`
- [ ] **Populate MongoDB** with real or seed data: posts, verified students, opportunities, faculty users
- [ ] **Login response** must include `authUserId` (User `_id`) alongside student/faculty profile `_id`  
  *(Already added in local `auth.js`; ensure deployed backend has this)*
- [ ] **CORS** allow mobile dev origins or requests without Origin
- [ ] Provide **test accounts** (student + faculty) with known passwords

### P1 — API gaps mobile expects

- [ ] `POST /auth/faculty/register` — **not implemented**; mobile shows admin-provision message instead
- [ ] `GET /posts` pagination — mobile sends `page` & `limit`; backend should return `{ data, total, hasMore }` when paginated
- [ ] `GET /students` pagination — same as posts for large directories
- [ ] Post feed department scoping — resolve user department from JWT `User` lookup (not `req.user.email` alone)
- [ ] Password reset endpoint — mobile shows “contact admin” until implemented

### P2 — Optional / later

- [ ] Push notifications (FCM)
- [ ] `POST /faculty/face-search` wired in faculty Smart Search
- [ ] Recommendation system integration
- [ ] File CDN URLs for uploads

---

## Local seed for testing (backend)

```bash
cd backend
node scripts/seed-mobile-demo.js
```

Creates posts, verified students, opportunities, and test logins documented in seed output.

---

## Auth ID contract (critical)

| Use case | ID to use |
|----------|-----------|
| Chats, notifications, post likes | **User `_id`** (`authUserId` from login) |
| Profile, projects, skills, uploads | **Student/Faculty `_id`** (`profileId`) |

Login response shape mobile expects:

```json
{
  "success": true,
  "token": "...",
  "user": {
    "_id": "<studentOrFacultyDocId>",
    "authUserId": "<userDocId>",
    "userType": "student",
    "email": "...",
    "name": "..."
  }
}
```

---

## Mobile QA checklist (already verified on client)

- [x] TypeScript `tsc --noEmit` passes
- [x] ESLint (warnings only, no errors)
- [x] Mock fallback opt-in (`EXPO_PUBLIC_ENABLE_MOCK_FALLBACK=false` by default)
- [x] Network errors show retry UI (not silent empty lists)
- [x] Faculty registration gated (no dead API calls)

---

## Contact / ownership

| Area | Owner |
|------|--------|
| Mobile app (this repo `/mobile`) | Frontend — **complete** |
| API, DB, deploy (`/backend`) | Backend — **remaining** |

When backend items in P0 are done, mobile should work end-to-end without further client changes.
