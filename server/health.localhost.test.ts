/**
 * @jest-environment node
 */

const apiBaseUrl = process.env.VAFIS_API_BASE_URL ?? 'http://localhost:4000/api';

describe('localhost API health check', () => {
  it('responds with ok status', async () => {
    const response = await fetch(`${apiBaseUrl}/health`);
    const body = await response.json();

    expect(response.ok).toBe(true);
    expect(body).toEqual({ status: 'ok' });
  });
});
