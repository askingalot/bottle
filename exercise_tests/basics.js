/*
 * Instructions: 
 *   For each function
 *   1. Carefully read the function's requirement
 *   2. Write javascript within the body of the function to fulfil the requirement
 *   3. Use the app's user interface to test your code
 */

// Return an HTML <H3> tag displays "JavaScript doesn't love me."
// Example result: "<H3>JavaScript doesn't love me</H3>"
export function howDoesJavaScriptFeel() {
  return "<H3>JavaScript doesn't love me</H3>";
}


// Return a greeting to the person named in the function's argument
// Example result: "Hello, Joan!"
export function greet(name) {
  return `Hello, ${name}!`;
}


// Return the result of adding a and b
// Example result: 4
export function add(a, b) { 
  return a + b;
}


// Return the text in upper case and followed by three exclamation points
// Example result: "HEY, Y'ALL, THIS BUFFET'S GOT CRAB LEGS!!!""
export const yell = (text) => {
  return text.toUpperCase() + '!!!';
}


// Return a string that repeats the message the number of times specified in numTimes
// Example result: "HelloHelloHello"
export function repeat(message, numTimes) {
  return message.repeat(numTimes);
}


// Same as the repeat function above, except each repetition should be separated by sepString
// Example result: "Yo, Yo, Yo"
export function repeatSep(message, numTimes, sepString) {
  return numTimes > 0 
    ? (message + sepString).repeat(numTimes - 1) + message
    : '';
}


// Return an array containing each of the parameters
// Example result ["foo", "bar", "baz"]
export function toArray(first, second, third) {
  return [first, second, third];
}

