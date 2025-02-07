/**
 * Function used in combination with await to sleep for some amount of time.
 * 
 * e.g.: await(sleep)
 * @param ms length of time to sleep in ms
 */
export function sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}

export function getMonthName(monthNumber: number): string | undefined {
  switch (monthNumber) {
    case 1:
      return "January";
    case 2:
      return "February";
    case 3:
      return "March";
    case 4:
      return "April";
    case 5:
      return "May";
    case 6:
      return "June";
    case 7:
      return "July";
    case 8:
      return "August";
    case 9:
      return "September";
    case 10:
      return "October";
    case 11:
      return "November";
    case 12:
      return "December";
    default:
      return undefined; // Or throw an error if you prefer
  }
}


/**
 * This function does nothing. 
 * 
 * Good for when you want a function that does a little less than something.
 */
export function NothingFunction(..._: any[]) {}