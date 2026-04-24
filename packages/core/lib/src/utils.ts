import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(fullName: string) {
  // 1. Trim leading/trailing spaces and split the string by one or more spaces
  const names = fullName.trim().split(/\s+/);

  // 2. Get the first initial (always from the first word)
  let initials = names[0] ? names[0].charAt(0) : "";

  // 3. Get the second initial based on the number of words
  if (names.length > 1) {
    // If there are multiple words, use the initial of the last word
    initials += names[names.length - 1]?.charAt(0);
  } else if (names.length === 1 && (names[0]?.length ?? 0) >= 2) {
    // If only one word and it has 2+ characters, use the second character
    initials += names[0]?.charAt(1);
  }

  // 4. Return the initials in uppercase
  return initials.toUpperCase();
}
