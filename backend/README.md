# Study Room Platform - Backend

Backend server for Maxemo Study Room Platform built with Node.js, Express, and PostgreSQL.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

1. Install PostgreSQL if not already installed
2. Create a new database:

```sql
CREATE DATABASE studyroom_db;
```

### 3. Environment Configuration

1. Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

2. Update the `.env` file with your PostgreSQL credentials:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=studyroom_db
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
```

### 4. Run the Server

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

- `GET /` - Welcome message and API info
- `GET /health` - Health check endpoint

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM/Client:** node-postgres (pg)
- **Environment:** dotenv
- **CORS:** cors

## Project Structure

```
backend/
├── config/
│   └── database.js      # Database configuration
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment variables template
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies and scripts
├── README.md           # This file
└── server.js           # Main server file
```

## Next Steps

After setting up the server, you can:
1. Create database migrations
2. Add API routes for users, study rooms, and materials
3. Implement authentication
4. Add file upload functionality for PDFs
