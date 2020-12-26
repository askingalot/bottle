export function hello(arg) {
  return "Hello, " + arg;
}

export function add(a, b) { return a + b; }

export const yell = (text) => {
  return `${text}!!!!`.toUpperCase();
}

export function sayThreeWords(one, two, three) {
  return [one, two, three].join(" ");
}

export function bye() {
  return 'bye';
}