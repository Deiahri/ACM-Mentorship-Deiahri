/**
 * Returns a promise that resolves after `ms` milliseconds.
 * @param ms length of time in ms
 * @returns 
 */
export function sleep(ms: number) {
  return new Promise((res) => setTimeout(() => res(true), ms));
}