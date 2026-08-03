export function toTitleCase(str: string): string {
  if (str.includes(" ")) {
    let array = str.split(" ");
    let result = "";
    for (let val of array) {
      result +=
        val.charAt(0).toUpperCase() + val.substring(1).toLowerCase() + " ";
    }
    result = result.trim();
    return result;
  } else {
    return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
  }
}
