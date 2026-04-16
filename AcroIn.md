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