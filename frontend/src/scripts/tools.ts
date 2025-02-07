/**
 * Function used in combination with await to sleep for some amount of time.
 * 
 * e.g.: await(sleep)
 * @param ms length of time to sleep in ms
 */
export function sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}

/**
 * This function does nothing. 
 * 
 * Good for when you want a function that does a little less than something.
 */
export function NothingFunction(..._: any[]) {}