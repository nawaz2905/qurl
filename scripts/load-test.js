import http from "k6/http";
import { check, group, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

// ─── Custom Metrics ───────────────────────────────────────────────────────────
const errorRate = new Rate("error_rate");
const apiTrend = new Trend("api_response_time");

// ─── Load Test Configuration ─────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: "2m",  target: 100  },  // Warm-up
    { duration: "5m",  target: 500  },  // Ramp up to 500 users
    { duration: "8m",  target: 500  },  // Hold at 500 — observe stability
    { duration: "5m",  target: 1000 },  // Ramp up to 1k users
    { duration: "8m",  target: 1000 },  // Hold at 1k — observe stability
    { duration: "5m",  target: 1500 },  // Ramp up to 1.5k users (safe for 8GB)
    { duration: "8m",  target: 1500 },  // Hold at 1.5k — peak load
    { duration: "3m",  target: 0    },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000", "p(99)<3000"], // relaxed for high concurrency
    http_req_failed:   ["rate<0.02"],
    error_rate:        ["rate<0.05"],
  },
};

// ─── Config ───────────────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";

// Pool of 500 pre-seeded users — each VU picks one by index to avoid
// thundering herd on a single account at high concurrency.
const USER_POOL_SIZE = 500;

// ─── Helper: Random Think Time ────────────────────────────────────────────────
function thinkTime() {
  sleep(Math.random() * 2 + 0.5); // 0.5–2.5s random, avoids synchronized waves
}

// ─── Helper: Auth Headers ─────────────────────────────────────────────────────
function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

const JSON_HEADERS = { "Content-Type": "application/json" };

// ─── Flow 1: Signup ───────────────────────────────────────────────────────────
function flowSignup() {
  let token = null;

  group("Flow: Signup", () => {
    const payload = JSON.stringify({
      email: `testuser_${Date.now()}_${__VU}@loadtest.com`,
      password: "Test@1234",
      name: "Load Test User",
    });

    const res = http.post(`${BASE_URL}/api/v1/signup`, payload, {
      headers: JSON_HEADERS,
    });

    const ok = check(res, {
      "signup status is 201":        (r) => r.status === 201,
      "signup response time <1000ms":(r) => r.timings.duration < 1000,
    });

    errorRate.add(!ok);
    apiTrend.add(res.timings.duration);

    if (ok && res.json("token")) {
      token = res.json("token");
    }

    thinkTime();
  });

  return token;
}

// ─── Flow 2: Signin ───────────────────────────────────────────────────────────
function flowSignin() {
  let token = null;

  group("Flow: Signin", () => {
    // Each VU picks a user from the pool — prevents all 5k VUs hitting one account
    const userIndex = __VU % USER_POOL_SIZE;

    const payload = JSON.stringify({
      email: `testuser_${userIndex}@loadtest.com`,
      password: "Test@1234",
    });

    const res = http.post(`${BASE_URL}/api/v1/signin`, payload, {
      headers: JSON_HEADERS,
    });

    const ok = check(res, {
      "signin status is 200":        (r) => r.status === 200,
      "signin has token":            (r) => r.json("token") !== undefined,
      "signin response time <1000ms":(r) => r.timings.duration < 1000,
    });

    errorRate.add(!ok);
    apiTrend.add(res.timings.duration);

    if (ok) token = res.json("token");
    thinkTime();
  });

  return token;
}

// ─── Flow 3: Create Link (needs auth) ────────────────────────────────────────
function flowCreateLink(token) {
  let linkId = null;

  group("Flow: Create Link", () => {
    const payload = JSON.stringify({
      url: `https://example.com/test-${Date.now()}-${__VU}`,
    });

    const res = http.post(`${BASE_URL}/api/v1/link`, payload, {
      headers: authHeaders(token),
    });

    const ok = check(res, {
      "create link status is 201":         (r) => r.status === 201,
      "create link has id":                (r) => r.json("id") !== undefined,
      "create link response time <1200ms": (r) => r.timings.duration < 1200,
    });

    errorRate.add(!ok);
    apiTrend.add(res.timings.duration);

    if (ok) linkId = res.json("id");
    thinkTime();
  });

  return linkId;
}

// ─── Flow 4: Get Links (needs auth) ──────────────────────────────────────────
function flowGetLinks(token) {
  group("Flow: Get Links", () => {
    const res = http.get(`${BASE_URL}/api/v1/links`, {
      headers: authHeaders(token),
    });

    const ok = check(res, {
      "get links status is 200":         (r) => r.status === 200,
      "get links response time <1000ms": (r) => r.timings.duration < 1000,
    });

    errorRate.add(!ok);
    apiTrend.add(res.timings.duration);
    thinkTime();
  });
}

// ─── Flow 5: Delete Link (needs auth) ────────────────────────────────────────
function flowDeleteLink(token, linkId) {
  group("Flow: Delete Link", () => {
    const res = http.del(`${BASE_URL}/api/v1/link/${linkId}`, null, {
      headers: authHeaders(token),
    });

    const ok = check(res, {
      "delete link status is 200 or 204": (r) => [200, 204].includes(r.status),
      "delete response time <1000ms":     (r) => r.timings.duration < 1000,
    });

    errorRate.add(!ok);
    apiTrend.add(res.timings.duration);
    thinkTime();
  });
}

// ─── Main Virtual User Scenario ───────────────────────────────────────────────
export default function () {
  const token = flowSignin();

  if (!token) {
    flowSignup();
    return;
  }

  // Weighted flows based on realistic usage patterns
  const rand = Math.random();

  if (rand < 0.40) {
    // 40% — browse links only
    flowGetLinks(token);
  } else if (rand < 0.75) {
    // 35% — create a link then view all
    const linkId = flowCreateLink(token);
    flowGetLinks(token);
  } else {
    // 25% — create then delete a link
    const linkId = flowCreateLink(token);
    if (linkId) flowDeleteLink(token, linkId);
  }
}
