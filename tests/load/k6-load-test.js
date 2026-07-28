import http from 'k6/http';
import { check, sleep } from 'k6';

// Enterprise Load Testing Configuration
export const options = {
  stages: [
    { duration: '30s', target: 50 }, // Ramp up to 50 concurrent users
    { duration: '1m', target: 50 },  // Maintain 50 concurrent users
    { duration: '30s', target: 200 }, // Spike to 200 concurrent users
    { duration: '1m', target: 200 }, // Maintain 200 concurrent users
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    // 95% of requests must complete below 500ms
    http_req_duration: ['p(95)<500'],
    // Error rate must be less than 1%
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // 1. Visit Homepage
  const resHome = http.get(`${BASE_URL}/`);
  check(resHome, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads within 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);

  // 2. Visit Shop Page (Simulating browsing)
  const resShop = http.get(`${BASE_URL}/shop`);
  check(resShop, {
    'shop status is 200': (r) => r.status === 200,
  });
  sleep(2);

  // 3. API Healthcheck (Simulating backend load)
  const resHealth = http.get(`${BASE_URL}/api/health`);
  // If the health endpoint doesn't exist yet, this might 404 locally, but in enterprise it should exist
  // We'll just check if it returns a response under 200ms
  check(resHealth, {
    'healthcheck response time < 200ms': (r) => r.timings.duration < 200,
  });
  sleep(1);
}
