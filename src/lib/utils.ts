export function projectMark(title: string) {
  const words = title
    .replace(/[()]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0].replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase();
  }

  return words
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export function projectHref(id: string) {
  return `/projects/${id.replace(/\.mdx$/, "")}/`;
}

export function withTrailingSlash(path: string) {
  if (path === "/") return path;
  return path.endsWith("/") ? path : `${path}/`;
}
