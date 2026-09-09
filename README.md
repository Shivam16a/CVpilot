<div align="center">

  <br />

  <!-- 🚀 Brand Title with Exact Icon Alignment -->
  <h1>
  <a
    href="https://cvpilot-jade.vercel.app/"
    target="_blank"
    style="text-decoration: none; color: #ffffff;"
  >
    <img
      src="./client/public/CVPilot.svg"
      width="46"
      height="46"
      alt="CVPilot Logo"
      style="vertical-align: middle; margin-right: 6px;"
    />
    <span style="vertical-align: middle; color: #ffffff;">
      CV<span style="color: #00D2FF;">Pilot</span>
    </span>
  </a>
</h1>


  <p>
    <b>Next-Gen AI Resume &amp; Career Copilot</b>
  </p>

  <!-- 🌐 Live Production Badge -->
  <p>
    <a href="https://cvpilot-jade.vercel.app/" target="_blank">
      <img src="https://img.shields.io/badge/LIVE_APP-cvpilot--jade.vercel.app-00D2FF?style=for-the-badge&logo=vercel&logoColor=black" alt="Live Demo" />
    </a>
  </p>

  <p>
    <code>👉 Live Deployment: <a href="https://cvpilot-jade.vercel.app/">https://cvpilot-jade.vercel.app/</a></code>
  </p>

  <br />

  <!-- Tech Stack Badges -->
  <p>
    <img src="https://img.shields.io/badge/MERN-Full%20Stack-0284c7?style=for-the-badge&logo=mongodb&logoColor=white" alt="MERN Stack" />
    <img src="https://img.shields.io/badge/React%2018-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
    <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Gemini-AI-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
    <img src="https://img.shields.io/badge/Brevo-REST%20API-0092FF?style=for-the-badge&logo=brevo&logoColor=white" alt="Brevo" />
  </p>

  <br />

  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=3000&pause=1000&color=38BDF8&center=true&vCenter=true&width=750&lines=Build+better+resumes;Match+your+resume+with+real+job+descriptions;Get+AI-powered+career+insights;Keep+your+career+data+secure;Create+ATS-friendly+resumes+in+minutes" alt="CVPilot Features" />

  <br /><br />

  <a href="#-overview">Overview</a> • <a href="#-features">Features</a> • <a href="#-architecture">Architecture</a> • <a href="#-tech-stack">Tech Stack</a> • <a href="#-security">Security</a> • <a href="#-setup">Setup</a> • <a href="#-api-reference">API</a>

  <br /><br />

</div>
---

# 📌 Overview

**CVPilot** is an AI-powered career platform designed to make the job application process easier.

It combines a resume builder, ATS analysis, job-description matching, cover-letter generation, and an AI career assistant into one platform.

The goal is simple:

> **Create a better resume, understand what employers are looking for, and apply with more confidence.**

Instead of relying on complicated visual resume layouts, CVPilot uses a clean, structured, single-column format designed to keep resume content easy for both people and Applicant Tracking Systems (ATS) to read.

CVPilot also includes **Sentinel**, a security layer that monitors suspicious requests, rate-limits sensitive endpoints, and can temporarily quarantine abusive IP addresses.

---

# 🚀 Features

<table>
<tr>
<td width="50%">

<h3 align="center">🎯 Smart Resume Builder</h3>

<ul>
<li><b>ATS-friendly structure:</b> Clean, semantic, single-column resume layouts.</li>
<li><b>One-page optimization:</b> Helps keep resumes concise and easy to scan.</li>
<li><b>PDF export:</b> Generates selectable, readable resume PDFs.</li>
<li><b>Structured data:</b> Keeps personal, education, experience, skills, and project information organized.</li>
</ul>

</td>

<td width="50%">

<h3 align="center">🧠 AI Career Tools</h3>

<ul>
<li><b>ATS Analysis:</b> Reviews resume content and highlights areas that can be improved.</li>
<li><b>Job Matching:</b> Compares your resume with a target job description.</li>
<li><b>Keyword Analysis:</b> Identifies relevant skills and keywords that may be missing.</li>
<li><b>Cover Letters:</b> Creates customized cover letters based on your profile and target role.</li>
</ul>

</td>
</tr>

<tr>
<td width="50%">

<h3 align="center">🛡️ Sentinel Security</h3>

<ul>
<li><b>Route monitoring:</b> Detects suspicious requests and endpoint probing.</li>
<li><b>Rate limiting:</b> Helps protect authentication endpoints from abuse.</li>
<li><b>IP quarantine:</b> Suspicious IP addresses can be blocked.</li>
<li><b>Security alerts:</b> Important incidents can trigger administrator notifications.</li>
</ul>

</td>

<td width="50%">

<h3 align="center">⚡ Reliable Cloud Services</h3>

<ul>
<li><b>HTTPS email delivery:</b> Uses the Brevo REST API instead of relying on SMTP connections.</li>
<li><b>AI fallback handling:</b> Helps the application remain usable when AI services are temporarily unavailable.</li>
<li><b>Separated deployment:</b> Frontend and backend can be deployed independently.</li>
<li><b>Cloud database:</b> Uses MongoDB Atlas for persistent application data.</li>
</ul>

</td>
</tr>
</table>

---

# 🏗️ Architecture

CVPilot follows a simple client-server architecture.

```text
                         ┌──────────────────────────┐
                         │       User / Browser     │
                         └────────────┬─────────────┘
                                      │
                                      │ HTTPS
                                      ▼
                         ┌──────────────────────────┐
                         │      React + Vite SPA    │
                         │        Frontend          │
                         └────────────┬─────────────┘
                                      │
                                      │ REST API
                                      ▼
                         ┌──────────────────────────┐
                         │    Express.js Backend    │
                         │       Node.js            │
                         └────────────┬─────────────┘
                                      │
                   ┌──────────────────┴──────────────────┐
                   │                                     │
                   ▼                                     ▼
        ┌─────────────────────┐              ┌─────────────────────┐
        │   Sentinel Layer    │              │   Core Controllers  │
        │                     │              │                     │
        │ • Rate Limiting     │              │ • Authentication    │
        │ • IP Blocking       │              │ • Resume Engine     │
        │ • Route Protection  │              │ • AI Features       │
        │ • Security Alerts   │              │ • Payments          │
        └──────────┬──────────┘              └──────────┬──────────┘
                   │                                    │
                   └────────────────┬───────────────────┘
                                    │
                                    ▼
                         ┌──────────────────────────┐
                         │      MongoDB Atlas       │
                         │                          │
                         │ • Users                  │
                         │ • Resumes                │
                         │ • Blocked IPs            │
                         └──────────────────────────┘
                                    │
                     ┌──────────────┼──────────────┐
                     │              │              │
                     ▼              ▼              ▼
                Gemini AI        Brevo         Razorpay
                AI Services      Email API      Payments
```

---

# 💻 Tech Stack

<div align="center">

| Area                 | Technologies                           |
| :------------------- | :------------------------------------- |
| **Frontend**         | React 18, Vite, Zustand, React Router  |
| **UI & Styling**     | Bootstrap 5, Custom CSS, Glassmorphism |
| **Backend**          | Node.js 20, Express.js 4, Axios        |
| **Database**         | MongoDB Atlas, Mongoose                |
| **Authentication**   | JWT, Bcrypt.js, OTP verification       |
| **AI**               | Google Gemini API                      |
| **Email**            | Brevo REST API                         |
| **Payments**         | Razorpay                               |
| **Frontend Hosting** | Vercel                                 |
| **Backend Hosting**  | Render                                 |

</div>

---

# 🧠 AI Career Engine

CVPilot uses AI to help users improve their job applications instead of simply generating generic content.

### ATS Analysis

The ATS analyzer reviews resume information and provides:

* Resume scoring
* Missing keywords
* Content improvement suggestions
* Section-level feedback
* Priority recommendations

### Job Description Matching

Users can provide a target job description and compare it with their resume.

The system can identify:

* Matching skills
* Missing skills
* Important keywords
* Relevant experience
* Potential gaps

### AI Cover Letters

CVPilot can generate personalized cover letters using information such as:

* Candidate experience
* Skills
* Projects
* Target position
* Job description
* Company context

### Career Assistant

The AI assistant provides a conversational interface for resume and career-related questions.

---

# 📄 Resume Engine

CVPilot focuses on creating resumes that are easy to read and easy to parse.

The resume engine follows a structured approach:

```text
User Profile
     │
     ▼
Resume Data
     │
     ▼
Structured Resume Model
     │
     ▼
Content Optimization
     │
     ▼
ATS-Friendly Layout
     │
     ▼
PDF Export
```

### Design Principles

* Single-column layout
* Clear section hierarchy
* Consistent typography
* Minimal decorative elements
* Selectable text
* Structured content
* Easy scanning for recruiters

The system also includes a compact layout approach to help keep important information within a one-page resume whenever possible.

---

# 🛡️ Security

## CVPilot Sentinel

**Sentinel** is the security layer between incoming requests and the application's core services.

Its purpose is to provide a basic zero-trust boundary around sensitive endpoints.

```text
                 Incoming Request
                        │
                        ▼
                ┌───────────────┐
                │  Extract IP   │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │ Blacklist     │
                │ Check         │
                └───────┬───────┘
                        │
                ┌───────┴────────┐
                │                │
             Blocked           Clean
                │                │
                ▼                ▼
           HTTP 403       Route Evaluation
                                 │
                         ┌───────┴────────┐
                         │                │
                       Valid            Probe
                         │                │
                         ▼                ▼
                    Controller      Quarantine
                                      IP
                                        │
                                        ▼
                                  Security Alert
```

### Security Features

**IP Detection**

The server evaluates proxy-related headers such as `x-forwarded-for` to identify the originating client IP.

**Route Protection**

Unexpected access to sensitive or non-existent routes can be treated as suspicious activity.

**IP Quarantine**

Suspicious clients can be stored in the `blockedips` collection and denied future requests.

**Rate Limiting**

Authentication-related endpoints are protected against excessive repeated requests.

**Password Security**

Passwords are hashed using Bcrypt before being stored.

**JWT Authentication**

Authenticated API requests use JSON Web Tokens for session authorization.

**OTP Verification**

Short-lived OTPs are used for account verification and password recovery flows.

---

# ✉️ Transactional Email

CVPilot uses the **Brevo REST API** for transactional email delivery.

Instead of depending on direct SMTP socket connections, the backend communicates with the email provider through HTTPS.

```text
CVPilot Backend
      │
      │ HTTPS / 443
      ▼
  Brevo REST API
      │
      ▼
 User Email
```

This approach is useful for cloud deployments where outbound SMTP connections may be restricted or unreliable.

Emails can be used for:

* Account verification
* Password recovery
* Security alerts
* Platform notifications

---

# 💳 Payments

CVPilot integrates with **Razorpay** for payment processing.

The backend is responsible for verifying payment information before updating subscription-related user data.

```text
User
 │
 ▼
Frontend
 │
 ▼
Razorpay Checkout
 │
 ▼
Payment Response
 │
 ▼
Backend Verification
 │
 ▼
Subscription Update
```

---

# ⚙️ Environment Configuration

Create environment files for both the frontend and backend.

## Server Environment

Create:

```text
server/.env
```

Example:

```ini
PORT=6050
NODE_ENV=production

CLIENT_URL=https://cvpilot-jade.vercel.app

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/cvpilot?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE=7d

# Brevo
BREVO_API_KEY=your_brevo_api_key
SENDER_EMAIL=support@cvpilot.in

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

> **Important:** Never commit `.env` files, API keys, database credentials, JWT secrets, or payment secrets to Git.

Add them to `.gitignore`:

```gitignore
.env
.env.local
.env.production
```

---

# 📦 Installation

## 1. Clone the Repository

```bash
git clone https://github.com/Shivam16a/CVpilot
cd cvpilot
```

## 2. Install and Run the Backend

```bash
cd server

npm install

npm run dev
```

The backend will run on:

```text
http://localhost:6050
```

## 3. Install and Run the Frontend

Open another terminal:

```bash
cd client

npm install

npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

---

# 📡 API Reference

## Authentication

Base route:

```text
/api/auth
```

| Method | Endpoint           | Description                                      | Auth |
| :----- | :----------------- | :----------------------------------------------- | :--- |
| `POST` | `/register`        | Creates a new account and sends verification OTP | No   |
| `POST` | `/verify-otp`      | Verifies account OTP                             | No   |
| `POST` | `/login`           | Authenticates user and returns JWT               | No   |
| `POST` | `/forgot-password` | Sends password-reset OTP                         | No   |
| `POST` | `/reset-password`  | Verifies OTP and updates password                | No   |

---

## AI Career Engine

Base route:

```text
/api/ai
```

| Method | Endpoint        | Description                                  | Auth |
| :----- | :-------------- | :------------------------------------------- | :--- |
| `POST` | `/analyze-ats`  | Analyzes resume for ATS-related improvements | JWT  |
| `POST` | `/match-jd`     | Matches resume against a job description     | JWT  |
| `POST` | `/cover-letter` | Generates a tailored cover letter            | JWT  |
| `POST` | `/chat-agent`   | Provides an AI-powered career assistant      | JWT  |

---

# 📁 Project Structure

A typical project structure looks like this:

```text
cvpilot/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── utils/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

# 🌐 Deployment

CVPilot is designed to keep the frontend and backend independently deployable.

### Frontend

The React/Vite application can be deployed to:

```text
Vercel
```

### Backend

The Express API can be deployed to:

```text
Render
```

### Database

MongoDB Atlas provides the persistent database layer.

### External Services

```text
Google Gemini  → AI functionality
Brevo          → Transactional emails
Razorpay       → Payments
MongoDB Atlas  → Database
Vercel         → Frontend
Render         → Backend
```

---

# 🔐 Production Checklist

Before deploying CVPilot to production:

* [ ] Configure production environment variables
* [ ] Use a strong JWT secret
* [ ] Restrict MongoDB network access
* [ ] Configure CORS correctly
* [ ] Never expose API keys in the frontend
* [ ] Enable HTTPS
* [ ] Configure rate limits
* [ ] Verify Razorpay payments on the backend
* [ ] Keep `.env` files out of Git
* [ ] Configure production email sender
* [ ] Monitor backend errors and security events
* [ ] Test authentication and password recovery flows

---

# 📊 Core Data Models

CVPilot primarily works with the following data collections:

```text
users
├── Account information
├── Authentication data
├── Subscription information
└── Verification / OTP data

resumes
├── Personal information
├── Education
├── Experience
├── Skills
├── Projects
└── Resume preferences

blockedips
├── IP address
├── Reason
├── Detection information
└── Block status
```

---

# 🎯 Project Goals

CVPilot is built around a few simple ideas:

**Keep resumes readable.**

Good resumes should work for both humans and automated systems.

**Make AI useful.**

AI should provide practical feedback rather than generate unnecessary content.

**Keep the application secure.**

Authentication, rate limiting, and monitoring should be part of the architecture from the beginning.

**Keep the infrastructure simple.**

The frontend, backend, database, AI, email, and payment services should remain independently manageable.

---

# 🚧 Future Improvements

Some areas that can be expanded in future versions include:

* Resume version history
* More resume templates
* Advanced job tracking
* Application status management
* Interview preparation
* LinkedIn profile optimization
* More detailed ATS benchmarking
* Resume analytics
* Admin security dashboard
* Redis-based distributed rate limiting
* Background job processing
* More AI career workflows

---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

If you would like to contribute:

```bash
# Fork the repository

# Create a feature branch
git checkout -b feature/your-feature

# Make your changes

# Commit your changes
git commit -m "Add your feature"

# Push the branch
git push origin feature/your-feature
```

Then open a Pull Request.

---

# 📄 License

This project is currently intended for personal and educational use.


---

<div align="center">

<br />

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=500&size=18&duration=3500&pause=1000&color=38BDF8&center=true&vCenter=true&width=600&lines=Build+your+resume.;Understand+your+career+gaps.;Apply+with+confidence.;Powered+by+CVPilot." alt="CVPilot Closing Animation" />

<br /><br />

**CVPilot — AI Resume Builder Application 🚀**

<br />

</div>
