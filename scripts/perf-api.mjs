import { performance } from 'node:perf_hooks';

const targetUrl = process.argv[2] ?? 'http://localhost:4000/api/health';
const totalRequests = Number(process.env.PERF_REQUESTS ?? 100);
const concurrency = Number(process.env.PERF_CONCURRENCY ?? 10);

if (!Number.isFinite(totalRequests) || totalRequests < 1) {
  throw new Error('PERF_REQUESTS must be a positive number.');
}

if (!Number.isFinite(concurrency) || concurrency < 1) {
  throw new Error('PERF_CONCURRENCY must be a positive number.');
}

const durations = [];
let completed = 0;
let failed = 0;
let nextRequest = 0;

const percentile = (values, p) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
};

const runRequest = async () => {
  const start = performance.now();

  try {
    const response = await fetch(targetUrl);
    await response.arrayBuffer();

    if (!response.ok) {
      failed += 1;
    }
  } catch {
    failed += 1;
  } finally {
    durations.push(performance.now() - start);
    completed += 1;
  }
};

const worker = async () => {
  while (nextRequest < totalRequests) {
    nextRequest += 1;
    await runRequest();
  }
};

const startedAt = performance.now();
await Promise.all(Array.from({ length: Math.min(concurrency, totalRequests) }, worker));
const totalDuration = performance.now() - startedAt;

const successful = completed - failed;
const requestsPerSecond = completed / (totalDuration / 1000);
const average = durations.reduce((sum, value) => sum + value, 0) / durations.length;

console.log(`Target: ${targetUrl}`);
console.log(`Requests: ${completed} (${successful} successful, ${failed} failed)`);
console.log(`Concurrency: ${concurrency}`);
console.log(`Total time: ${totalDuration.toFixed(0)} ms`);
console.log(`Throughput: ${requestsPerSecond.toFixed(2)} req/s`);
console.log(`Latency avg: ${average.toFixed(2)} ms`);
console.log(`Latency p50: ${percentile(durations, 50).toFixed(2)} ms`);
console.log(`Latency p95: ${percentile(durations, 95).toFixed(2)} ms`);
console.log(`Latency p99: ${percentile(durations, 99).toFixed(2)} ms`);
