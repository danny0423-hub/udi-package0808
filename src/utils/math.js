// math.js

export function add(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('參數必須是數字');
  }
  return a + b;
}

export function subtract(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('參數必須是數字');
  }
  return a - b;
} 