/**
 * Function used in combination with await to sleep for some amount of time.
 * 
 * e.g.: await(sleep)
 * @param ms length of time to sleep in ms
 */
export function sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}