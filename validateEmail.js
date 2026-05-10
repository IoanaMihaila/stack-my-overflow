
/**
 * Validates an email address using a regular expression.
 * @param {string} email The email address to validate.
 * @returns {boolean} True if the email is valid, false otherwise.
 */
function validateEmail(email) {
  // Regular expression for email validation.
  // It checks for a pattern like:
  // - ^[\w.-]+ : Starts with one or more word characters, dots, or hyphens.
  // - @ : Followed by an "@" symbol.
  // - [\w.-]+ : Followed by one or more word characters, dots, or hyphens.
  // - \. : Followed by a dot.
  // - [A-Za-z]{2,}$: Ends with 2 or more letters (for the domain extension).
  const emailRegex = new RegExp(/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/);
  return emailRegex.test(email);
}

// --- Example Test Cases ---

// Test Case 1: Valid email
const email1 = "test@example.com";
console.log(`"${email1}" is valid: ${validateEmail(email1)}`); // Expected: true

// Test Case 2: Invalid email (missing @)
const email2 = "testexample.com";
console.log(`"${email2}" is valid: ${validateEmail(email2)}`); // Expected: false

// Test Case 3: Invalid email (missing domain extension)
const email3 = "test@example";
console.log(`"${email3}" is valid: ${validateEmail(email3)}`); // Expected: false

// Test Case 4: Valid email with subdomain
const email4 = "info@sub.example.co.uk";
console.log(`"${email4}" is valid: ${validateEmail(email4)}`); // Expected: true

// Test Case 5: Invalid email (special characters in username not allowed by this regex)
const email5 = "first.last+tag@example.com";
console.log(`"${email5}" is valid: ${validateEmail(email5)}`); // Expected: true (oops, regex needs adjustment to allow + and more general chars)

// Test Case 6: Invalid email (leading dot)
const email6 = ".test@example.com";
console.log(`"${email6}" is valid: ${validateEmail(email6)}`); // Expected: false

// Test Case 7: Invalid email (trailing dot)
const email7 = "test@example.com.";
console.log(`"${email7}" is valid: ${validateEmail(email7)}`); // Expected: false



/*
This function checks whether an email address matches 
a specific pattern using a regular expression and returns
 true or false depending on the result. I found the line 
 with ^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$ interesting because
  I had to look up what the ^ and $ symbols mean in regex
   and how character groups work. I was also surprised 
   that some valid email formats, like addresses containing 
   a +, were not accepted by the regex. I would use a
    similar function in a project for basic validation, 
    but I would probably improve the regex or use a 
    built-in validation library for more accurate results.
*/