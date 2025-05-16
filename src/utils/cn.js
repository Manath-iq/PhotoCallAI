/**
 * Merges multiple class name strings, removing duplicates and handling conditionals
 * @param {...string} inputs - Class name strings to merge
 * @returns {string} - Single merged class name string
 */
export function cn(...inputs) {
  return inputs
    .filter(Boolean)
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter((value, index, array) => array.indexOf(value) === index)
    .join(' ');
} 