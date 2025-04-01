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

export function getMonthNumber(monthName: string): number | undefined {
  if (typeof monthName !== "string") {
    return undefined; // Or throw an error: throw new Error("Invalid input: Month name must be a string.");
  }

  const lowerCaseMonth = monthName.trim().toLowerCase();

  switch (lowerCaseMonth) {
    case "january":
      return 1;
    case "february":
      return 2;
    case "march":
      return 3;
    case "april":
      return 4;
    case "may":
      return 5;
    case "june":
      return 6;
    case "july":
      return 7;
    case "august":
      return 8;
    case "september":
      return 9;
    case "october":
      return 10;
    case "november":
      return 11;
    case "december":
      return 12;
    default:
      return undefined; // Or throw an error:  throw new Error("Invalid month name: " + monthName);
  }
}

/**
 * This function does nothing.
 *
 * Good for when you want a function that does a little less than something.
 */
export function NothingFunction(..._: any[]) {}

const options: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};
export function unixToDateString(unixTimestamp: number): string {
  const date = new Date(unixTimestamp);
  return date.toLocaleDateString("en-US", options);
}
