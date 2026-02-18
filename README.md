# Maxemo Combined Study Platform

This is my submission for the Maxemo Full Stack Assessment: a study room platform designed for students to share materials, notes, and collaborate effectively.

## Live Demo

-   **Frontend Application**: [https://studyroom.ijas.space/login](https://studyroom.ijas.space/)
-   **API Documentation**: [https://studyroom-backend-vuzs.onrender.com/api-docs](https://studyroom-backend-vuzs.onrender.com/api-docs)

## 🎯 Project Overview

This platform enables students to:
-   **Create & Customize Profiles**: Manage personal information and view joined study groups.
-   **Discover & Join Study Rooms**: Browse active study rooms with real-time capacity checks.
-   **Share Knowledge**: Upload and download study materials (PDFs) securely within rooms.
-   **Maintain Quality**: Report inappropriate content to keep the community safe.

## 📂 Project Structure

```
StudyRoom/
├── backend/                # Node.js/Express Backend
│   ├── config/             # Database and Swagger config
│   ├── controllers/        # Request handlers
│   ├── database/           # SQL init scripts
│   ├── middleware/         # Auth and error handling middleware
│   ├── routes/             # API route definitions
│   ├── scripts/            # Database migration scripts
│   ├── uploads/            # Local file storage (for dev)
│   ├── server.js           # Entry point
│   └── package.json
│
├── frontend/               # Vue 3 Frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── stores/         # Pinia state management
│   │   ├── utils/          # API helpers
│   │   ├── views/          # Page components
│   │   ├── App.vue         # Root component
│   │   └── main.js         # Entry point
│   └── package.json
│
└── DEPLOYMENT.md           # Guide for deploying to Render/Vercel
```

## ⚙️ Setup and Configuration

### 1. Clone the Repository
Start by cloning the project to your local machine:

```bash
git clone https://github.com/Muhammedijas981/StudyRoom.git
cd StudyRoom
```

### 2. Backend Configuration (`backend/.env`)

Navigate to the backend directory and create a `.env` file:

```bash
cd backend
# Create .env file
```

Add the following configuration to `backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# PostgreSQL Database Configuration for localhost
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=studyroom_db
# DB_USER=postgres
# DB_PASSWORD=root

# Paste your connection string here (Local or Production):
DATABASE_URL=postgresql://user:password@host:port/database_name
```

### 3. Frontend Configuration (`frontend/.env`)

Navigate to the frontend directory and create a `.env` file:

```bash
cd ../frontend
# Create .env file
```

Add the following configuration to `frontend/.env`:

```env
# URL where your backend is hosted (Localhost or Production URL)
VITE_API_URL=http://localhost:5000
```

*Note: For production, replace `http://localhost:5000` with your hosted backend URL (e.g., on Render).*

## 🚀 Key Features

### Core Functionality
1.  **User Profiles**: 
    -   Registration with form validation.
    -   Profile management (Avatar upload, Bio, Major).
    -   Dashboard showing joined rooms and activity stats.

2.  **Study Room Management**:
    -   Create rooms with topics and member limits.
    -   **One-click Join**: Smart logic prevents duplicate joins and respects room capacity.
    -   **Leave Confirmation**: Modal dialog to prevent accidental exits.
    -   **Search**: Filter rooms instantly by name or topic.

3.  **Material Sharing**:
    -   **Drag-and-Drop Upload**: Seamless file sharing for room members.
    -   **Access Control**: Only members can upload; anyone can view (configurable).
    -   **Download & Preview**: Direct download links and new-tab previews for PDFs.

4.  **Reporting System**:
    -   Flag inappropriate materials with comments.
    -   Admin-ready backend endpoints for reviewing reports.

## 🛠 Technology Stack

-   **Frontend**: Vue.js 3 (Composition API), Pinia (State Management), Vue Router.
-   **Backend**: Node.js, Express.js.
-   **Database**: PostgreSQL.
-   **API Documentation**: Swagger
-   **Testing**: Manual verification + API testing via Swagger.

## 📚 API Documentation

The backend features fully integrated Swagger documentation.

-   **Live Documentation**: [https://studyroom-backend-vuzs.onrender.com/api-docs](https://studyroom-backend-vuzs.onrender.com/api-docs)
-   **Local Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---
*Built for the Maxemo Full Stack Assessment.*
