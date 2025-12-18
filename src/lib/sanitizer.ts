// Sanitization utilities for HTML inputs and filenames
export function sanitizeHtml(input: string): string {
  if (!input) return input;

  // Remove event handler attributes like onerror="..." or onclick='...'
  let out = input.replace(
    /on[a-zA-Z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^>\s]+)/gi,
    "",
  );

  // Neutralize javascript: and dangerous data URLs inside attributes
  out = out.replace(/javascript:\s*/gi, "");
  out = out.replace(/data:text\/html/gi, "");

  // Escape HTML entities
  out = out
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

  return out;
}

export function sanitizeFilename(name: string): string {
  if (!name) return name;

  // Remove null bytes
  let out = name.replace(/\0/g, "");

  // Remove/reduce dangerous command words (as whole words)
  const dangerousWords = [
    "rm",
    "sudo",
    "sh",
    "bash",
    "curl",
    "wget",
    "nc",
    "netcat",
    "python",
    "perl",
    "php",
    "scp",
    "mv",
    "cp",
    "dd",
  ];

  for (const w of dangerousWords) {
    const re = new RegExp("\\b" + w + "\\b", "gi");
    out = out.replace(re, "_");
  }

  // Remove shell metacharacters and subshells
  out = out.replace(/(\|\||&&|;|\||>|<|`|\$\([^\)]*\)|\$\{[^}]*\})/g, "_");

  // Allow only safe characters and replace others by underscore
  out = out.replace(/[^a-zA-Z0-9._-]/g, "_");

  // Collapse multiple underscores
  out = out.replace(/_+/g, "_");

  // Trim leading/trailing underscores or dots
  out = out.replace(/^[_\.]+|[_\.]+$/g, "");

  if (out === "") out = "file";

  return out;
}
