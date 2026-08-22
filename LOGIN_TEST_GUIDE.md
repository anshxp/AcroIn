# Login Testing Guide

## Services Running

- **Frontend**: http://localhost:5173/
- **Backend**: http://localhost:7852/
- **MongoDB**: Connected via MONGO_URI in backend/.env

## Current Status

✅ Backend authentication endpoints working
✅ Frontend dev server running
✅ Error handling implemented
✅ CORS configured
✅ All TypeScript builds pass

## How to Test Login

### Option 1: Demo Login (No Database Required)
1. Go to http://localhost:5173/
2. Click "Sign in to your account"
3. Scroll down to "quick demo access" section
4. Click "Demo Student", "Demo Faculty", or "Demo Admin"
5. You'll be logged in and redirected to /home

**Status**: ✅ This should work without any backend database

### Option 2: Real Login (Requires Test Data)

#### Step 1: Create Test Student in MongoDB
Connect to MongoDB and run:
```javascript
use('acro_db')
db.students.insertOne({
  name: 'Test Student',
  roll: 'CS001',
  email: 'demo.student@acroin.edu',
  department: 'Computer Science',
  tech_stack: [],
  profile_image: null,
  projects: [],
  internships: [],
  competitions: [],
  certificates: []
})
```

#### Step 2: Create Test Faculty in MongoDB
```javascript
use('acro_db')
db.faculties.insertOne({
  firstname: 'John',
  lastName: 'Doe',
  email: 'demo.faculty@acroin.edu',
  department: 'Computer Science',
  designation: 'Associate Professor',
  experience: 5,
  qualification: 'Ph.D',
  dob: '1990-01-01',
  phone: '9876543210',
  role: ['faculty'],
  subjects: [],
  skills: [],
  techstacks: []
})
```

#### Step 3: Try Login at http://localhost:5173/login
- **Email**: demo.student@acroin.edu
- **Password**: (any value, password validation is not enabled)
- Select "Student" and click "Sign In"

## Expected Behavior

### Successful Login
- ✅ Credentials match database record
- ✅ Token stored in localStorage
- ✅ User data stored in localStorage
- ✅ Redirected to /home
- ✅ Dashboard displays user info

### Failed Login
- ✅ Email not found in database
- ✅ Error message displays: "Student not found"
- ✅ User stays on login page
- ✅ No redirect

## Endpoint Testing

### Test Student Login Endpoint (PowerShell)
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:7852/auth/student/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"demo.student@acroin.edu","password":"test"}' `
  -ErrorAction SilentlyContinue

$response.Content | ConvertFrom-Json | Format-Table
```

### Test Faculty Login Endpoint
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:7852/auth/faculty/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"demo.faculty@acroin.edu","password":"test"}' `
  -ErrorAction SilentlyContinue

$response.Content | ConvertFrom-Json | Format-Table
```

## Troubleshooting

### "Student not found" error
- ✅ **Expected**: Database doesn't have a student with that email
- **Solution**: Add test student to MongoDB using Step 1 above

### Login button not responding
- Check browser console (F12) for errors
- Check if backend is running: `http://localhost:7852/` should show "Hello World!"
- Check if frontend is running: `http://localhost:5173/` should load

### Demo buttons not working
- Clear localStorage: Press F12 → Application → localStorage → Clear All
- Refresh page and try again

### CORS errors
- Ensure backend is running on port 7852
- Backend should have CORS enabled (it does)
- Check browser console for specific CORS error

## Response Format

### Successful Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "token": "student_<id>_<timestamp>_<random>",
  "user": {
    "_id": "mongo_id",
    "id": "mongo_id",
    "name": "Test Student",
    "email": "demo.student@acroin.edu",
    "roll": "CS001",
    "department": "Computer Science",
    "tech_stack": [],
    "profile_image": null,
    "role": "student"
  }
}
```

### Failed Login Response
```json
{
  "success": false,
  "message": "Student not found",
  "error": "Student not found"
}
```

## What Fixed

1. ✅ Backend response normalization (both `id` and `_id` fields)
2. ✅ Frontend error extraction from axios errors
3. ✅ Axios interceptor no longer redirects during auth attempts
4. ✅ Proper error handling in login/register functions
5. ✅ GraphQL resolver type safety
6. ✅ Frontend TypeScript compilation

## Next Steps

**Tell me what error you're seeing** and I can fix it specifically. Include:
- Error message from the login page
- Browser console errors (F12)
- Backend console errors
- Which login method you're using (demo or real)
