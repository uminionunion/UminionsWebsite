
// Import the 'clsx' library and its 'ClassValue' type. 'clsx' is a tiny utility for constructing `className` strings conditionally.
import { clsx, type ClassValue } from 'clsx';
// Import the 'tailwind-merge' library. 'twMerge' is a function that merges Tailwind CSS classes in JS without style conflicts.
import { twMerge } from 'tailwind-merge';

/**
 * A utility function that combines class names from 'clsx' and merges them with 'tailwind-merge'.
 * This is useful for creating dynamic and conditional class strings for components,
 * ensuring that Tailwind CSS classes are applied correctly without conflicts.
 * @param inputs - A list of class values (strings, objects, arrays).
 * @returns A single string of merged and optimized class names.
 */
export function cn(...inputs: ClassValue[]) {
  // First, 'clsx' processes the inputs to generate a single class string.
  // Then, 'twMerge' takes that string and resolves any conflicting Tailwind classes.
  return twMerge(clsx(inputs));
}
