export function generateSlug(title: string) {
  return title
    .toLowerCase() // Convert to lowercase
    .replace(/[^\w\s-]/g, " ") // Remove all non-word characters (punctuation, spaces, etc.)
    .trim() // Trim any leading or trailing whitespace
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with a single hyphen
}
