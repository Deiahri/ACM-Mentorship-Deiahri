import { it, expect, describe } from 'vitest';

describe('Ensures currently in testing mode', () => {
    it('should be in testing mode', () => {
        // testing requires testing mode, as sockets may try to connect with "bearer testing" token,
        // which is only allowed when testing = true.
        expect(process.env.TESTING).toBe("true");
    });
});