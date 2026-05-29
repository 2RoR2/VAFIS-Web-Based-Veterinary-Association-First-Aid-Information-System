# Local Testing Guide

This project can be tested locally with the frontend on `http://localhost:5173` and the API on `http://localhost:4000`.

## Start the App

Run these in separate terminals:

```powershell
npm.cmd run dev:server
npm.cmd run dev:client
```

Open the frontend:

```text
http://localhost:5173
```

Check the backend health endpoint:

```text
http://localhost:4000/api/health
```

## Code Testing

Run the Jest test suite:

```powershell
npm.cmd test
```

Run Jest in watch mode:

```powershell
npm.cmd run test:watch
```

Run Jest with coverage:

```powershell
npm.cmd run test:coverage
```

Run the localhost API smoke test after starting the backend:

```powershell
npm.cmd run dev:server
npm.cmd run test:localhost
```

Run the TypeScript check:

```powershell
npm.cmd run test:types
```

Run the production build check:

```powershell
npm.cmd run test:build
```

This project uses Jest for code tests and React Testing Library for component behavior.

Good first test cases:

- Login with pet owner, vet professional, and administrator accounts.
- API token refresh behavior in `app/services/api.ts`.
- Admin create/edit/delete flows.
- Guide, quiz, clinic, and feedback page loading states.

## API Performance Testing

Start the backend first:

```powershell
npm.cmd run dev:server
```

Run the default health endpoint performance test:

```powershell
npm.cmd run perf:api
```

Test another API endpoint:

```powershell
npm.cmd run perf:api -- http://localhost:4000/api/guides
```

Change request count and concurrency:

```powershell
$env:PERF_REQUESTS=500
$env:PERF_CONCURRENCY=25
npm.cmd run perf:api -- http://localhost:4000/api/health
```

Useful baseline targets:

- Health endpoint p95 latency should be very low, usually below `50 ms` on localhost.
- Database-backed list endpoints should stay stable under repeated requests.
- Failed requests should be `0` before increasing concurrency.

## Frontend Performance Testing

For quick browser checks, use Chrome DevTools Lighthouse against:

```text
http://localhost:5173
```

Recommended checks:

- Performance score
- Accessibility score
- Largest Contentful Paint
- Total Blocking Time
- Console errors during page navigation

For repeatable browser behavior tests, add Jest component tests around each important page flow.
