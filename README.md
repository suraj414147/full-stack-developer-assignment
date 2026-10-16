# Full Stack Developer Assignment

This ZIP contains the two assignment folders:

- `react-restaurant-task/` — Savour restaurant discovery UI, Fastor OTP APIs, and restaurant listing.
- `nodejs-crm-task/` — Node.js + Express + MongoDB CRM REST API.

## 1. React restaurant task

Requirements: Node.js LTS and npm.

Open a terminal in `react-restaurant-task/` (the folder that contains its `package.json`) and run:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

The frontend uses the endpoints visible in the provided Postman screenshots:

- `POST https://staging.fastor.ai/v1/pwa/user/register` with `phone` and `dial_code`, URL-encoded.
- `POST https://staging.fastor.ai/v1/pwa/user/login` with `phone`, `otp`, and `dial_code`, URL-encoded.
- `GET https://staging.fastor.ai/v1/m/restaurant?city_id=118` with `Authorization: Bearer <JWT>`.

The screenshots show `+91` as the dial code and `123456` as a default/test OTP. Actual OTP acceptance, staging server availability, API response shape, and browser CORS policy depend on the external Fastor staging service. If the API is unavailable or rejects the request, the UI displays preview restaurant cards and an error message; preview data is not live API data.

Build check:

```bash
npm run build
```

## 2. Node.js CRM task

Open a separate terminal in `nodejs-crm-task/` and run:

```bash
npm install
```

Copy `.env.example` to `.env`, set `MONGODB_URI` and a strong `JWT_SECRET`, and make sure MongoDB is running. Then run:

```bash
npm run dev
```

Follow `nodejs-crm-task/README.md` for the API endpoints and test steps.

## Before submitting

1. Install dependencies and run the checks in both task folders.
2. Test the Fastor OTP and restaurant requests against the live staging API.
3. Confirm the final response fields in Postman and compare them with the frontend's token/list extraction.
4. Never commit `.env` files, JWTs, passwords, or real OTPs.
5. Upload the extracted assignment folder to the repository required by the recruiter.
