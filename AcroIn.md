📘 AcroIn — Product & System Design Document
🧠 1. Product Overview
🔹 Definition

AcroIn is a faculty-verified student talent discovery platform that enables skill-based search, identity verification, and opportunity access within a college ecosystem.

🎯 Core Objective
Help students get discovered based on real skills
Help faculty/admin identify talent efficiently
Provide a trusted, verified student database
🚫 What AcroIn is NOT
Not a social network
Not a chat platform
Not a content-sharing app
✅ What AcroIn IS

A college-level talent search engine with identity + skill verification

👥 2. User Roles
🎓 Students
Create profiles
Upload face data
Add skills, projects, certificates
Get verified
👨‍🏫 Faculty
Verify students (same department only)
Search students (including face search)
Post opportunities
🛡️ Admin
Manage system
Monitor activity
Control roles & data
🧩 3. Core Features
👤 3.1 Student Profile System
Data Fields:
Name
Enrollment Number
Department
Year/Sem
CGPA
Tech Stack (skills)
Projects
Certificates
Resume
GitHub / LinkedIn
🔐 3.2 Identity Verification (Face Recognition)
📌 Requirement
Student must upload face data
Without face → not eligible for verification
🎥 Face Capture System (Recommended Approach)

Instead of static uploads:

Flow:

User records short video
System extracts multiple angles automatically
🧠 Stored Data
faceEmbeddings: [vector1, vector2, vector3, ...]
faceVerificationStatus:
  - none
  - partial
  - complete
🎯 Purpose
Identity validation
Prevent duplicate accounts
Enable face-based search
👨‍🏫 3.3 Faculty Verification System
Rules:
Faculty can verify only same department students
Verification Levels:
❌ Not Verified
✔ Verified
⭐ Strongly Verified (optional future enhancement)
Stored Data:
verificationStatus
verifiedBy (facultyId)
verifiedAt
🔎 3.4 Smart Search System
Filters:
Skills
Projects
Department
CGPA
Verification status
Output:
Ranked list of students
🧠 3.5 Skill Matching Recommendation System
Use Case:
“Find backend developer”
“Find ML student”
Ranking Formula:
Score =
  Skill Match (40%)
+ Project Relevance (25%)
+ Verification Level (20%)
+ Profile Completeness (10%)
+ Activity (5%)
📢 3.6 Opportunity Posts
Posted By:
Faculty
Admin
Types:
Hackathons
Internships
Placements
Events
Fields:
title
description
type
postedBy
department (optional)
deadline
🔔 3.7 Notification System
Events:
New opportunities
Verification updates
Recommendations
Structure:
userId
type
message
readStatus
createdAt
🧠 4. Face Search System (Key Differentiator)
📌 Use Case

Faculty uploads a face → system finds matching student

⚙️ Process
Step 1:

Extract embedding from uploaded image

Step 2:

Compare with stored embeddings

Step 3:

Return best matches

🧠 Matching Logic
similarity = cosine_similarity(query, stored_embedding)

if similarity > threshold:
   match
Recommended Thresholds:

0.6 → possible

0.75 → strong match

Optimization:
final_score = max(similarity across embeddings)
🧱 5. System Architecture
🖥️ Frontend
React
Tailwind CSS
Vite
⚙️ Backend
Node.js
Express
🗄️ Database
MongoDB
🔐 Authentication
College email login
JWT-based authentication
🧾 6. Database Design (Simplified)
User
id
email
role (student/faculty/admin)
StudentProfile
userId
skills[]
projects[]
certificates[]
cgpa
department
verificationStatus
verifiedBy
faceEmbeddings[]
faceVerificationStatus
Faculty
userId
department
subjects
Opportunity
title
description
type
postedBy
department
deadline
Notification
userId
type
message
readStatus
createdAt
🔐 7. Security & Privacy
Requirements:
User consent for face data
Encrypt sensitive data
Prefer storing embeddings over raw images
Access control (faculty-only verification)
⚠️ 8. Critical Success Factors
🔥 1. Search Quality

If search is bad → product fails

🔥 2. Verification Trust

Faculty verification must be reliable

🔥 3. Low Friction Onboarding

Face system must feel smooth (video capture preferred)

🔥 4. Data Accuracy

Profiles must be complete and updated

🚀 9. MVP Scope
Build First:
Authentication
Student profile CRUD
Face capture + embedding storage
Faculty verification
Search + filters
Opportunity posts
Notifications
🧠 10. Future Enhancements
🤖 AI Layer
Smart recommendations
Auto team formation
📊 Analytics
Skill trends
Placement insights
🌐 Expansion
Multi-college system
Recruiter access
🧠 Final Product Statement

AcroIn is a faculty-verified, identity-backed student talent discovery platform that enables fast, accurate, and trustworthy skill-based search within a college ecosystem.



📘 AcroIn — Role-Based Authority & System Control Document (STRICT)
🧠 0. GLOBAL SYSTEM RULES (APPLY TO EVERYONE)

These are non-negotiable constraints across the platform:

🔒 Identity Rules
Every user MUST have:
Verified college email
Single account per email
Student WITHOUT face data → cannot be verified
Student WITHOUT profile completeness ≥ 40% → excluded from search
🔐 Access Control Layer (Backend Middleware)
requireAuth
requireRole("student" | "faculty" | "admin")
requireSameDepartment (faculty → student actions)
⚠️ System Integrity Rules
No user can:
Modify another user’s core data
Override verification manually (except admin)
All sensitive actions must be logged
👥 1. STUDENT ROLE — FULL SPEC
🎓 PURPOSE
Be discoverable based on skills
Maintain verified profile
Apply for opportunities
✅ PERMISSIONS (WHAT STUDENT CAN DO)
👤 Profile
Create profile (once)
Update own profile
Upload:
Skills
Projects
Certificates
Resume
Social links
🎥 Face System
Upload video for face capture
Re-upload face data
View face verification status
🔎 Discovery
View:
Opportunities
Notifications
Get:
Recommendations (future)
❌ RESTRICTIONS (VERY IMPORTANT)
🚫 Cannot:
Verify themselves
Access other students’ private data
Perform face search
Edit verification status
Post opportunities
🚫 Hidden Limitations
If:
profileCompleteness < 40

→ NOT shown in search results

🚫 Face Rules
If:
faceVerificationStatus !== "complete"

→ Cannot be verified by faculty

🧠 SYSTEM BEHAVIOR FOR STUDENT
🔹 Profile Completeness Calculation Trigger
On every profile update
🔹 Face Upload Flow
Upload video
→ extract frames
→ detect face
→ generate embeddings
→ store top N
→ update status
🔹 Verification Visibility
Student can ONLY see:
verified / not_verified
NOT who verified (optional for privacy)
👨‍🏫 2. FACULTY ROLE — FULL SPEC
🎯 PURPOSE
Verify students
Discover talent
Post opportunities
✅ PERMISSIONS
🔎 Search System
Search students using:
Skills
Filters
Face search
🧠 Face Search
Upload image
Get ranked results
✔ Verification System
Verify students

BUT ONLY:

faculty.department === student.department
📢 Opportunities
Create opportunity posts
Edit their own posts
Delete their own posts
❌ RESTRICTIONS
🚫 Cannot:
Verify students from other departments
Edit student data
Delete student profiles
Access embeddings directly
Promote/demote roles
🚫 Face System
Cannot store or download face data
Only gets similarity results
🧠 SYSTEM BEHAVIOR FOR FACULTY
🔹 Verification Flow
Check department match
Check faceVerificationStatus == complete
Check profile completeness >= 40

→ then allow verification
🔹 Search Ranking Priority

Faculty sees:

Verified students ranked higher
🔹 Face Search Output
top 5 matches
with similarity score
🛡️ 3. ADMIN ROLE — FULL SPEC
🎯 PURPOSE
Maintain system integrity
Manage users
Monitor activity
✅ PERMISSIONS
👥 User Management
Create/remove users
Assign roles:
student → faculty → admin
✔ Override Controls
Override verification status
Disable accounts
📊 Monitoring
View:
total users
verification stats
search activity
⚙️ System Control
Configure:
thresholds (face similarity)
feature flags
❌ RESTRICTIONS
🚫 Should NOT:
Manually edit student academic data
Modify embeddings
🧠 SYSTEM BEHAVIOR FOR ADMIN
🔹 Suspicious Activity Detection
Duplicate embeddings
Multiple accounts
🔹 Auto Cleanup
Delete:
inactive accounts
graduated students (future)
🧠 4. FEATURE ACCESS MATRIX (VERY IMPORTANT)
Feature	Student	Faculty	Admin
Profile CRUD	✅	❌	⚠️ limited
Face Upload	✅	❌	❌
Face Search	❌	✅	✅
Student Search	❌	✅	✅
Verification	❌	✅	✅
Opportunities Create	❌	✅	✅
Notifications	✅	✅	✅
Role Management	❌	❌	✅
🧠 5. CRITICAL SYSTEM GUARDS (MUST IMPLEMENT)
🔒 Middleware Examples
if (user.role !== "faculty") reject()

if (faculty.department !== student.department) reject()

if (student.faceVerificationStatus !== "complete") reject()
🧠 6. STATE MACHINE (IMPORTANT FOR BUG PREVENTION)
🔹 Student Verification State
none → partial → complete → verified
🔹 Allowed Transitions
From	To
none	partial
partial	complete
complete	verified
🧠 7. COPILOT CONTROL INSTRUCTIONS (VERY IMPORTANT)

Paste this into your project README or Copilot context:

🤖 Copilot Behavior Contract
You are working on an existing codebase (AcroIn).

STRICT RULES:

1. NEVER assume functionality
2. ALWAYS ask before:
   - changing existing logic
   - modifying database schema
   - altering API contracts
   - renaming variables or files

3. BEFORE writing code:
   - ask what already exists
   - ask for file structure
   - ask for current implementation

4. DO NOT:
   - overwrite working features
   - introduce breaking changes
   - refactor without permission

5. ALWAYS:
   - match existing coding style
   - reuse existing services/utilities
   - keep functions modular

6. IF something is unclear:
   ASK instead of guessing

7. FOR EVERY FEATURE:
   - confirm role permissions
   - confirm validation rules
   - confirm edge cases

8. WHEN ADDING NEW FEATURE:
   ask:
   - which role can access it?
   - what are restrictions?
   - what data model is affected?

9. PRIORITY:
   Stability > Clean Code > New Features
⚠️ FINAL REALITY CHECK

Your current system likely fails because:

❌ No strict role enforcement
❌ Missing state validation
❌ Copilot guessing instead of asking
❌ Inconsistent backend contracts

This doc fixes that.



















/internal/admin-bootstrap-setup-9x7