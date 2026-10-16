import axios from "axios";

// Endpoints confirmed from the supplied Postman screenshots.
export const FASTOR_API = {
  register: "https://staging.fastor.ai/v1/pwa/user/register",
  login: "https://staging.fastor.ai/v1/pwa/user/login",
  restaurants: "https://staging.fastor.ai/v1/m/restaurant?city_id=118",
};

// Postman uses x-www-form-urlencoded for registration and login.
function formBody(payload) {
  const body = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) body.set(key, String(value));
  });
  return body;
}

const requestConfig = {
  timeout: 20000,
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
};

export async function registerWithOtp(payload) {
  return axios.post(FASTOR_API.register, formBody(payload), requestConfig);
}

export async function loginWithOtp(payload) {
  return axios.post(FASTOR_API.login, formBody(payload), requestConfig);
}

export async function fetchRestaurants(token) {
  if (!token) throw new Error("Please log in first to load restaurants.");
  return axios.get(FASTOR_API.restaurants, {
    timeout: 20000,
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function extractToken(payload) {
  return payload?.data?.token ?? payload?.data?.access_token ?? payload?.token ?? payload?.access_token ?? payload?.data?.data?.token ?? null;
}

export function extractRestaurants(payload) {
  const candidates = [payload, payload?.data, payload?.restaurants, payload?.data?.restaurants, payload?.data?.data, payload?.data?.items, payload?.items];
  return candidates.find(Array.isArray) ?? null;
}
