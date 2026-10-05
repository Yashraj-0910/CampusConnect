# 🎓 CampusConnect — Campus Compass

<p align="center">
  <strong>A Next-Gen Full-Stack Campus Engagement, Club Recruitment & Student Mentorship Platform.</strong>
</p>

<p align="center">
  <a href="https://github.com/Yashraj-0910/CampusConnect">
    <img src="https://img.shields.io/badge/GitHub-CampusConnect-181717?style=for-the-badge&logo=github" alt="GitHub">
  </a>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Sequelize-ORM-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white" alt="Sequelize">
  <img src="https://img.shields.io/badge/Socket.IO-Realtime-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO">
  <img src="https://img.shields.io/badge/Vite-Build_Tool-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

---

## 📌 Overview

**CampusConnect**, also known as **Campus Compass**, is a full-stack campus engagement platform designed to bring students, clubs, coordinators, mentors, and college administration together in one centralized system.

Traditional college communication is often fragmented across:

- 💬 WhatsApp groups
- 📌 Notice boards
- 📝 Google Forms
- 📧 Scattered announcements
- 📊 Manual registration tracking

CampusConnect solves this by providing a centralized platform for **club discovery, recruitment, event registration, mentorship, student guidance, administration, and real-time notifications**.

> **One platform. One campus. Connected.**

---

## 🎯 Problem Statement

College students often struggle to discover opportunities and stay updated because information is distributed across multiple channels.

### Common Problems

| Problem | Traditional Approach | CampusConnect Solution |
|---|---|---|
| Club discovery | WhatsApp / word of mouth | 🔎 Centralized club directory |
| Club recruitment | Google Forms | 📝 Built-in applications |
| Application tracking | Manual spreadsheets | 📊 Personal dashboards |
| Event registration | Separate forms | 🎟️ Integrated RSVP system |
| Freshman guidance | Informal senior advice | 🗺️ 6-phase roadmap |
| Student questions | Random group messages | 👨‍🏫 Mentor Q&A |
| Notifications | Manual messages | ⚡ Real-time WebSockets |
| Registration expiry | Manual checking | 🤖 Automated cron jobs |

---

# 🌟 Feature Highlights

### 🔐 Secure Authentication

- JWT-based authentication
- Role-based authorization
- Password hashing using `bcryptjs`
- Secure password reset workflow
- Cryptographically generated reset tokens
- One-hour password reset token expiry
- Transactional password reset emails through Brevo

---

### 🧠 Smart Club Matching

CampusConnect includes a rule-based recommendation algorithm that evaluates a student's interests against club information.

| Matching Signal | Weight |
|---|---:|
| Club Name Match | +35% |
| Description Match | +20% |
| Category Match | +15% |
| Interest / Domain Compatibility | Context-based |

This allows students to discover clubs that better align with their interests instead of manually browsing every club.

---

### 🗺️ Freshman Milestone Roadmap

A structured **6-phase roadmap** helps first-year students understand their college journey.

The roadmap provides guidance around:

- 🎓 Academic preparation
- 🧑‍🤝‍🧑 Social & campus involvement
- 🏆 Clubs and competitions
- 💻 Technical development
- 🚀 Career preparation
- 🌱 Personal growth

---

### 🎟️ Event Management & RSVP

Club coordinators can create and manage events with:

- Event descriptions
- Registration deadlines
- Participant capacity
- Event rules
- Banner/image uploads
- Participant tracking
- Photo galleries
- Registration status

---

### ⚡ Real-Time Notifications

Powered by **Socket.IO**, CampusConnect can deliver user-specific real-time notifications without requiring page refreshes.

Examples include:

- ✅ Club application approval
- ❌ Club application rejection
- ⏳ Waitlist updates
- 🎟️ Event-related notifications
- 💬 Mentor question responses

---

### 🤖 Automated Background Jobs

`node-cron` runs scheduled backend maintenance tasks.

One key job executes around midnight to automatically identify and close expired club registration windows.

This reduces manual administrative work and keeps registration data consistent.

---

### 👨‍🏫 Student Mentorship

Students can:

- Browse verified mentors
- View mentor skills
- View department information
- View previous club experience
- Ask questions
- Receive answers through interactive Q&A threads

---

# 🏗️ System Architecture

```mermaid
flowchart TB

    User["👤 Users"]

    subgraph Frontend["🖥️ React Frontend"]
        UI["React 19 + Vite"]
        Router["React Router"]
        Context["AuthContext / SocketContext"]
        Axios["Axios API Client"]
        Motion["Framer Motion"]
    end

    subgraph Backend["⚙️ Node.js Backend"]
        Express["Express.js"]
        Auth["JWT Authentication"]
        Controllers["Controllers"]
        Middleware["RBAC Middleware"]
        Routes["REST API Routes"]
        Socket["Socket.IO Server"]
        Cron["Node-Cron Jobs"]
    end

    subgraph Database["🗄️ Data Layer"]
        Sequelize["Sequelize ORM"]
        PostgreSQL[("PostgreSQL")]
    end

    subgraph Services["☁️ External Services"]
        Brevo["Brevo Email API"]
        Storage["Multer File Uploads"]
    end

    User --> UI
    UI --> Router
    UI --> Context
    UI --> Axios
    UI --> Motion

    Axios --> Express
    Express --> Routes
    Routes --> Middleware
    Middleware --> Auth
    Routes --> Controllers

    Controllers --> Sequelize
    Sequelize --> PostgreSQL

    Controllers --> Socket
    Socket --> UI

    Cron --> PostgreSQL
    Controllers --> Brevo
    Controllers --> Storage
🗃️ High-Level Data Relationships
👥 Role-Based Access Control

📁 Project Structure
CampusConnect/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── # Database & environment configuration
│   │   │
│   │   ├── controllers/
│   │   │   └── # Auth, clubs, events, mentors & admin logic
│   │   │
│   │   ├── jobs/
│   │   │   └── # Node-cron background jobs
│   │   │
│   │   ├── middleware/
│   │   │   └── # Authentication & role guards
│   │   │
│   │   ├── models/
│   │   │   └── # Sequelize PostgreSQL models
│   │   │
│   │   ├── routes/
│   │   │   └── # REST API routes
│   │   │
│   │   ├── sockets/
│   │   │   └── # Socket.IO event handlers
│   │   │
│   │   └── utils/
│   │       └── # Seeders & helper utilities
│   │
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── # Navbar, Footer, ProtectedRoute, etc.
│   │   │
│   │   ├── context/
│   │   │   └── # AuthContext & SocketContext
│   │   │
│   │   ├── pages/
│   │   │   └── # Home, Clubs, Dashboard, Mentors, Roadmap, etc.
│   │   │
│   │   └── services/
│   │       └── # Axios API client
│   │
│   └── package.json
│
└── README.md
🌐 REST API Reference
🔐 Authentication
Method	Endpoint	Description
POST	/api/auth/register	Register a new user
POST	/api/auth/login	Authenticate user
POST	/api/auth/forgot-password	Request password reset
🏢 Clubs
Method	Endpoint	Description
GET	/api/clubs	Get all clubs
GET	/api/clubs/:id	Get club details
POST	/api/clubs/:id/register	Apply to a club
🎟️ Events
Method	Endpoint	Description
GET	/api/events	Get available events
POST	/api/events/:id/register	Register for an event
GET	/api/events/my-events	Get user's registered events
👨‍🏫 Mentors
Method	Endpoint	Description
GET	/api/mentors	Get available mentors
POST	/api/mentors/:id/questions	Ask a mentor a question
PUT	/api/mentors/questions/:qId/answer	Answer a question
🏢 Coordinator
Method	Endpoint	Description
GET	/api/coordinator/my-club	Get coordinator's club
PUT	/api/coordinator/applications/:id	Update application status
🛡️ Admin
Method	Endpoint	Description
GET	/api/admin/dashboard	Campus analytics dashboard
POST	/api/admin/assign-coordinator	Assign club coordinator
🔐 Authentication & Security Flow
⚡ Real-Time Notification Architecture

CampusConnect uses Socket.IO rooms to support user-specific notifications.

                 ┌─────────────────────┐
                 │   Express Backend    │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   Socket.IO Server  │
                 └──────────┬──────────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
        User Room A    User Room B    User Room C
             │              │              │
             ▼              ▼              ▼
          Student       Coordinator       Mentor
Example Events
application:approved
application:rejected
application:waitlisted
event:reminder
mentor:answer

This enables instant UI updates without requiring users to refresh the page.

⏰ Automated Background Jobs

The backend uses node-cron for scheduled maintenance.

Registration Expiry Workflow
                 Midnight
                    │
                    ▼
          ┌───────────────────┐
          │ Cron Job Executes  │
          └─────────┬─────────┘
                    │
                    ▼
       Find expired registrations
                    │
                    ▼
          Update registration
               status
                    │
                    ▼
          Close registration
              window
                    │
                    ▼
          Database remains
              consistent
🚀 Getting Started
📋 Prerequisites

Make sure the following are installed:

Node.js v18+
PostgreSQL
npm
Git

Verify your installation:

node --version
npm --version
psql --version
git --version
1️⃣ Clone the Repository
git clone https://github.com/Yashraj-0910/CampusConnect.git

cd CampusConnect
2️⃣ Backend Setup

Navigate to the backend:

cd backend

Install dependencies:

npm install

Create a .env file:

PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=campus_compass
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret

BREVO_API_KEY=your_brevo_api_key

Run the database seeder:

npm run seed

Start the backend development server:

npm run dev

Backend API:

http://localhost:5000
3️⃣ Frontend Setup

Open another terminal:

cd frontend

Install dependencies:

npm install

Start the Vite development server:

npm run dev

The frontend will typically be available at:

http://localhost:5173
🔑 Environment Variables

Never commit secrets to GitHub.

Variable	Description	Example
PORT	Backend server port	5000
DB_HOST	PostgreSQL host	localhost
DB_PORT	PostgreSQL port	5432
DB_NAME	Database name	campus_compass
DB_USER	PostgreSQL username	postgres
DB_PASSWORD	PostgreSQL password	********
JWT_SECRET	JWT signing secret	your_secret
BREVO_API_KEY	Brevo API credential	your_api_key

⚠️ Security: Add .env to .gitignore and never commit API keys, passwords, JWT secrets, or database credentials.

🧪 Development Workflow
Developer
    │
    ├── Frontend
    │      └── React + Vite
    │
    ├── REST API
    │      └── Express.js
    │
    ├── Authentication
    │      └── JWT + bcryptjs
    │
    ├── Database
    │      └── PostgreSQL + Sequelize
    │
    ├── Realtime
    │      └── Socket.IO
    │
    └── Background Tasks
           └── node-cron
💡 Key Engineering Decisions
Why React?

React provides a component-based architecture that makes complex role-based interfaces easier to maintain and reuse.

Why PostgreSQL?

The platform contains highly relational data such as users, clubs, applications, events, registrations, mentors, and questions. PostgreSQL provides strong relational consistency for these workflows.

Why Sequelize?

Sequelize simplifies database interaction while allowing models and relationships to remain organized within the Node.js backend.

Why Socket.IO?

Polling would require repeated API requests to check whether something changed. Socket.IO enables the server to push important events directly to connected clients.

Why JWT?

JWT provides a stateless authentication mechanism suitable for REST APIs and role-based access control.

Why node-cron?

Some tasks should happen automatically without user interaction. Scheduled jobs allow the backend to perform database maintenance reliably.

📊 Core Application Flow
📈 Platform Benefits
🎓 For Students
Discover relevant clubs faster
Apply without external forms
Track applications
Register for events
Receive real-time updates
Connect with senior mentors
Follow a structured freshman roadmap
🏢 For Club Coordinators
Centralize club management
Review applications
Manage recruitment
Publish announcements
Create events
Track participants
🛡️ For Administrators
Monitor campus activity
View signup trends
Manage clubs
Assign coordinators
Centralize campus engagement data
🧩 Scalability Considerations

CampusConnect was structured with separation of concerns in mind.

Frontend
Components
    ↓
Pages
    ↓
Context
    ↓
Services
    ↓
REST API
Backend
Routes
   ↓
Middleware
   ↓
Controllers
   ↓
Models
   ↓
PostgreSQL

This separation makes individual modules easier to test, maintain, and extend.

Potential future improvements include:

Redis caching
Horizontal backend scaling
Cloud object storage
Containerized deployment
CI/CD pipelines
Database indexing optimization
Centralized logging
Rate limiting
API documentation with OpenAPI/Swagger
🔮 Future Roadmap
 📱 Progressive Web App support
 🔔 Advanced notification preferences
 📊 More detailed analytics
 🔎 Advanced club filtering
 🤖 Improved recommendation engine
 📧 Event reminder automation
 ☁️ Cloud deployment
 🐳 Docker containerization
 🔄 CI/CD pipeline
 🧪 Automated unit & integration testing
 📚 Swagger/OpenAPI documentation
 ⚡ Redis-based caching
🤝 Contributing

Contributions are welcome!

1. Fork the repository
git fork https://github.com/Yashraj-0910/CampusConnect
2. Clone your fork
git clone https://github.com/<your-username>/CampusConnect.git
3. Create a feature branch
git checkout -b feature/your-feature
4. Make your changes

Follow the existing project structure and coding conventions.

5. Commit your changes
git add .

git commit -m "feat: add your feature"
6. Push the branch
git push origin feature/your-feature
7. Open a Pull Request

Provide a clear explanation of:

What changed
Why it changed
How it was tested
Any additional considerations
🐛 Bug Reports & Feature Requests

If you find a bug or have an improvement idea, please open a GitHub Issue with:

Title:
Problem:
Steps to Reproduce:
Expected Behavior:
Actual Behavior:
Screenshots:
Additional Context:
📜 License

This project is licensed under the MIT License.

You are free to use, modify, and distribute this project in accordance with the license terms.

👨‍💻 Author
Yashraj Belanekar

Information Technology Engineering Student | Full-Stack Developer

Interested in:

☕ Java & Backend Development
🌐 Full-Stack Engineering
🗄️ Database Systems
☁️ Cloud & DevOps
🧠 Problem Solving
