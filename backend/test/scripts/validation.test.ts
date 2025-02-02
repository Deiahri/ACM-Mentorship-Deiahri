import { expect, describe, it } from 'vitest';
import { isValidNames, isValidUsername, MAX_NAME_LENGTH, MAX_USERNAME_LENGTH, MIN_USERNAME_LENGTH } from '../../src/scripts/validation';

describe('Tests validation script.isValidNames', () => {
  it('should fail if no names are provided', () => {
    expect(() => isValidNames('', '', '')).toThrowError();
  });

  const NameTooLong = 'n'.repeat(MAX_NAME_LENGTH + 1);
  const NameJustRight = 'n'.repeat(MAX_NAME_LENGTH - 1);
  it('should fail if any names are too long', () => {
    expect(() => isValidNames(NameTooLong, NameJustRight, NameJustRight)).toThrowError();
    expect(() => isValidNames(NameJustRight, NameTooLong, NameJustRight)).toThrowError();
    expect(() => isValidNames(NameJustRight, NameJustRight, NameTooLong)).toThrowError();
  });

  it('should pass without middle name', () => {
    expect(() => isValidNames(NameJustRight, undefined, NameJustRight)).not.toThrowError();
  });
});

const usernameTooLong = 'n'.repeat(MAX_USERNAME_LENGTH + 1);
const usernameTooShort = 'n'.repeat(MIN_USERNAME_LENGTH - 1);
const usernameMIN = 'n'.repeat(MIN_USERNAME_LENGTH);
const usernameMAX = 'n'.repeat(MAX_USERNAME_LENGTH);
describe('Tests validation script.isValidUsername', () => {
  it('should fail if too long or too short', async () => {
    await expect(isValidUsername(usernameTooLong)).rejects.toThrowError();
    await expect(isValidUsername(usernameTooShort)).rejects.toThrowError();
  });

  it('should fail if username contains spaces', async () => {
    await expect(isValidUsername('hee mee')).rejects.toThrowError();
  });

  const illegalChars = ['^', '%', '!', '(', ')', '&', '#']
  it('should fail if username includes illegal characters', async () => {
    for (let illegalChar of illegalChars) {
      await expect(isValidUsername('hee'+illegalChar+'mee')).rejects.toThrowError();
    }
  });

  const highlyUnlikelyUsername = 'xQ7pL2mR9vZ4tY8wK1oN3cF5gH6jU';
  it('should pass if just right', async () => {
    // this setup alerts dev if username is in use, as that's the only way this test will fail.
    try {
      isValidUsername(highlyUnlikelyUsername.substring(0, MAX_USERNAME_LENGTH));
    } catch {
      throw new Error('Highly unlikely username ('+highlyUnlikelyUsername+') is in use.');
    }
  });
});