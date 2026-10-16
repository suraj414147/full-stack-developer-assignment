# Savour — React Restaurant Discovery

A responsive React + Vite restaurant discovery interface with search, cuisine filters, restaurant cards, detail modal, OTP registration/login, and Fastor restaurant API integration.

## Requirements and setup

Install Node.js LTS (includes npm), then run these commands from this folder:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

Create a production build with:

```bash
npm run build
```

## Fastor API integration

Configured from the supplied Postman screenshots:

| Request | Method | Request fields |
|---|---|---|
| Register and get OTP | POST | `phone`, `dial_code` |
| Login with OTP | POST | `phone`, `otp`, `dial_code` |
| Fetch restaurants | GET | `city_id=118` query parameter and `Authorization: Bearer <JWT>` header |

Endpoints:

- `https://staging.fastor.ai/v1/pwa/user/register`
- `https://staging.fastor.ai/v1/pwa/user/login`
- `https://staging.fastor.ai/v1/m/restaurant?city_id=118`

Registration and login use `application/x-www-form-urlencoded`, matching the Postman screenshots. The frontend stores the JWT returned by login in local storage and sends it to the restaurant endpoint. The UI accepts common token and restaurant-list response shapes; if the live API returns a different shape, update `src/api.js` accordingly.

The screenshot shows `+91` as the dial code and `123456` as a default/test OTP. Do not assume this OTP will work outside the staging environment. Live API availability, actual token response fields, and browser CORS policy are controlled by the external API. If the live request fails, the UI shows preview cards and an error message rather than claiming the preview is live data.

## Main files

- `frontend/src/App.jsx` — UI, OTP flow, search/filter, restaurant cards.
- `frontend/src/api.js` — Fastor endpoints, URL-encoded auth requests, token/list extraction.
- `frontend/src/styles.css` — responsive styling.
- `backend/src/server.js` — included Express demo API.

## Troubleshooting

- If `npm install` fails, check the internet connection and Node.js/npm installation, then retry.
- If browser requests show a CORS error, the staging API must allow browser origins or requests must be routed through a server-side proxy.
- If login succeeds but restaurants do not load, inspect the login response in Postman and confirm the JWT field name and restaurant response array shape.
