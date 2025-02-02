import { it, expect, describe } from 'vitest';

describe('.env access', () => {
  it('should have env variable access', () => {
    expect(process.env.SOCKET_SERVER_PORT).toBeTruthy();
  });
});