// validateNumber
export function validateNumber(value: string): string {
  // Get the current value of the input
  let inputValue = value;

  // Create a regular expression pattern to allow only numbers
  const regexPattern = /^[0-9]*$/;

  if (!regexPattern.test(inputValue)) {
    // If it doesn't match, remove the invalid characters
    inputValue = inputValue.replace(/[^0-9]/g, "");
  }

  return inputValue;
}

// validateTextNumber
export function validateTextNumber(value: string): string {
  let inputValue = value;
  // Create a regular expression pattern to allow letters, numbers, and spaces
  const regexPattern = /^[A-Za-z0-9\s]*$/;

  if (!regexPattern.test(inputValue)) {
    // If it doesn't match, remove the invalid characters
    inputValue = inputValue.replace(/[^A-Za-z0-9\s]/g, "");
  }

  return inputValue;
}

// validateText
export function validateText(value: string): string {
  let inputValue = value;
  // Create a regular expression pattern to allow letters, and spaces
  const regexPattern = /^[A-Za-z\s]*$/;

  if (!regexPattern.test(inputValue)) {
    // If it doesn't match, remove the invalid characters
    inputValue = inputValue.replace(/[^A-Za-z\s]/g, "");
  }

  return inputValue;
}

// validateSlug
export function validateSlug(value: string): string {
  let inputValue = value;
  // Create a regular expression pattern to allow letters, numbers, and a single dash (-) between them
  const regexPattern = /^[A-Za-z0-9]+(-[A-Za-z0-9]+)?$/;

  if (!regexPattern.test(inputValue)) {
    // If it doesn't match, remove the invalid characters
    inputValue = inputValue.replace(/[^A-Za-z0-9-]/g, "");
    // Remove any extra dashes to ensure only one dash is allowed
    inputValue = inputValue.replace(/-{2,}/g, "-").replace(/^-|-$/g, "");
  }

  return inputValue;
}

// validateUsername
export function validateUsername(value: string): string {
  let inputValue = value;
  // Create a regular expression pattern to allow letters and numbers
  const regexPattern = /^[A-Za-z0-9]*$/;

  if (!regexPattern.test(inputValue)) {
    // If it doesn't match, remove the invalid characters
    inputValue = inputValue.replace(/[^A-Za-z0-9]/g, "");
  }

  return inputValue;
}

// validateEmail
export function validateEmail(value: string): string {
  let inputValue = value;
  // Create a regular expression pattern to allow letters, numbers, "@", and "." characters
  const regexPattern = /^[A-Za-z0-9@.]*$/;

  if (!regexPattern.test(inputValue)) {
    // If it doesn't match, remove the invalid characters
    inputValue = inputValue.replace(/[^A-Za-z0-9@.]/g, "");
  }

  // Count occurrences of "@" and "."
  const atCount = (inputValue.match(/@/g) || []).length;
  const dotCount = (inputValue.match(/\./g) || []).length;

  // If there are more than one "@" or more than one ".", remove extra occurrences
  if (atCount > 1) {
    inputValue = inputValue.replace(/@/g, (match, offset) =>
      offset === inputValue.indexOf("@") ? match : "",
    );
  }
  if (dotCount > 1) {
    inputValue = inputValue.replace(/\./g, (match, offset) =>
      offset === inputValue.indexOf(".") ? match : "",
    );
  }

  return inputValue;
}

// validateMobile
export function validateMobile(value: string): string {
  // Get the current value of the input
  let inputValue = value;

  // Create a regular expression pattern to allow only numbers
  const regexPattern = /^[0-9]*$/;

  if (!regexPattern.test(inputValue)) {
    // If it doesn't match, remove the invalid characters
    inputValue = inputValue.replace(/[^0-9]/g, "");
  }

  if (inputValue.length > 10) {
    inputValue = inputValue.slice(0, 10);
  }

  return inputValue;
}

// validateOTP
export function validateOTP(value: string): string {
  // Get the current value of the input
  let inputValue = value;

  // Create a regular expression pattern to allow only numbers
  const regexPattern = /^[0-9]*$/;

  if (!regexPattern.test(inputValue)) {
    // If it doesn't match, remove the invalid characters
    inputValue = inputValue.replace(/[^0-9]/g, "");
  }

  if (inputValue.length > 4) {
    inputValue = inputValue.slice(0, 4);
  }

  return inputValue;
}

// validatePincode
export function validatePincode(value: string) {
  // Get the current value of the input
  let inputValue = value;

  // Create a regular expression pattern to allow only numbers
  const regexPattern = /^[0-9]*$/;

  if (!regexPattern.test(inputValue)) {
    // If it doesn't match, remove the invalid characters
    inputValue = inputValue.replace(/[^0-9]/g, "");
  }

  if (inputValue.length > 6) {
    inputValue = inputValue.slice(0, 6);
  }

  return inputValue;
}

// validateUrl
export function validateUrl(value: string): string {
  let inputValue = value;
  // Create a regular expression pattern to allow characters suitable for a URL
  const regexPattern = /^[A-Za-z0-9-._~:/?#\[\]@!$&'()*+,;=%]*$/;

  if (!regexPattern.test(inputValue)) {
    // If it doesn't match, remove the invalid characters
    inputValue = inputValue.replace(
      /[^A-Za-z0-9-._~:/?#\[\]@!$&'()*+,;=%]/g,
      "",
    );
  }

  return inputValue;
}
