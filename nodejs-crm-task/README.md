# CRM Lead Management REST API

A Node.js + Express REST API for a small CRM system. Employees/counselors register and log in with JWT authentication. Prospective clients can submit an enquiry through a public form endpoint without authentication. Authenticated employees can see unclaimed enquiries, claim one, and retrieve only the enquiries claimed by their own account.

## Tech stack
- Node.js and Express
- MongoDB with Mongoose
- JWT (Bearer token) authentication
- bcrypt password hashing
- express-validator request validation

## Requirements
- Node.js 18 or later
- MongoDB running locally, or a MongoDB Atlas connection string

## Setup and run (Windows / VS Code)

1. Extract the ZIP and open this folder in VS Code.
2. Open Terminal in this folder.
3. Install packages:
   ```bash
   npm install
   ```
4. Create your environment file by copying `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```
   You can also copy it manually in File Explorer. Set `JWT_SECRET` to a long random secret and update `MONGODB_URI` if needed.
5. Make sure MongoDB is running locally, or paste your MongoDB Atlas connection string into `MONGODB_URI`.
6. Start the API:
   ```bash
   npm run dev
   ```
   Or use `npm start` for normal mode.
7. Open `http://localhost:5000` to see the API index and `http://localhost:5000/health` for a health check.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (default 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign/verify JWT tokens |
| `JWT_EXPIRES_IN` | Token lifetime (default `1d`) |
| `CORS_ORIGIN` | Allowed frontend origin; comma-separated origins are supported |

## API endpoints

All responses are JSON. Protected routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Register an employee/counselor |
| POST | `/api/auth/login` | No | Login and receive JWT |
| GET | `/api/auth/me` | Yes | Get current logged-in employee |
| POST | `/api/leads/public` | **No** | Public prospective-client enquiry form |
| GET | `/api/leads/unclaimed` | Yes | List public/unclaimed enquiries |
| POST | `/api/leads/:id/claim` | Yes | Claim one unclaimed enquiry |
| GET | `/api/leads/mine` | Yes | List enquiries claimed by the current employee |
| GET | `/api/leads/:id` | Yes | Read an unclaimed lead or a lead claimed by the current employee |
| GET | `/health` | No | Health check |

### 1. Register an employee

`POST /api/auth/register`

```json
{
  "name": "Asha Sharma",
  "email": "asha@example.com",
  "password": "StrongPass123",
  "role": "counselor"
}
```

`role` is optional and may be `employee` or `counselor`. The API returns an employee object and JWT. Passwords are hashed and never returned.

### 2. Login

`POST /api/auth/login`

```json
{
  "email": "asha@example.com",
  "password": "StrongPass123"
}
```

Copy the returned `token` and use it for protected requests:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### 3. Submit a public enquiry (no authentication)

`POST /api/leads/public`

```json
{
  "name": "Rahul Verma",
  "email": "rahul@example.com",
  "phone": "9876543210",
  "courseInterest": "Full Stack Development",
  "message": "Please share the next batch details."
}
```

New enquiries are stored with `status: "unclaimed"`.

### 4. Fetch unclaimed enquiries

`GET /api/leads/unclaimed`

Requires a valid employee JWT. All authenticated employees can see unclaimed public enquiries.

### 5. Claim an enquiry

`POST /api/leads/LEAD_ID/claim`

Requires a valid employee JWT. The operation atomically changes the lead to `claimed`, assigns `claimedBy` to the logged-in employee, and records `claimedAt`. If another employee already claimed it, the API returns `409 Conflict`; two employees cannot claim the same lead successfully.

### 6. Fetch enquiries claimed by the logged-in employee

`GET /api/leads/mine`

Requires a valid employee JWT. It returns only the leads whose `claimedBy` matches the logged-in employee.

## Suggested test flow (Postman)

1. Register employee A; save token A.
2. Register employee B; save token B.
3. Submit a public enquiry without an Authorization header.
4. Call `GET /api/leads/unclaimed` with token A and copy a lead ID.
5. Claim it with token A.
6. Call `GET /api/leads/mine` with token A; the lead should appear.
7. Call `GET /api/leads/mine` with token B; that lead should not appear.
8. Try claiming the same lead with token B; expect `409 Conflict`.
9. Try `/api/leads/unclaimed` without a token; expect `401 Unauthorized`.

## Data model and business rules

- Each employee/counselor account is linked to a unique email address.
- Public enquiries require no authentication.
- Unclaimed enquiries are visible to all logged-in employees.
- Claiming a lead is a one-time operation.
- Claimed enquiries are private to the employee who claimed them.
- JWT is checked on every protected route.
- Request input is validated; passwords are hashed with bcrypt.

## Project structure

```text
crm-backend-assignment/
├── src/
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── models/Employee.js
│   ├── models/Lead.js
│   ├── routes/auth.routes.js
│   ├── routes/leads.routes.js
│   ├── utils/asyncHandler.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Notes
- This repository implements the backend REST API requested in the assignment email; no frontend was required in the email shown.
- Keep `.env` and secrets out of GitHub. Commit `.env.example`, not `.env`.
- The API has been authored to meet the stated acceptance criteria, but you should run it locally and test the endpoints with Postman before submission.
