import type { SharedPayload } from "@/lib/types";

function toBase64Url(value: string) {
  return value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const remainder = padded.length % 4;

  if (!remainder) {
    return padded;
  }

  return `${padded}${"=".repeat(4 - remainder)}`;
}

export function encodeSharePayload(payload: SharedPayload) {
  const json = JSON.stringify(payload);
  const encoded =
    typeof window === "undefined"
      ? Buffer.from(json, "utf-8").toString("base64")
      : btoa(unescape(encodeURIComponent(json)));

  return toBase64Url(encoded);
}

export function decodeSharePayload(token: string) {
  try {
    const decoded =
      typeof window === "undefined"
        ? Buffer.from(fromBase64Url(token), "base64").toString("utf-8")
        : decodeURIComponent(escape(atob(fromBase64Url(token))));
    return JSON.parse(decoded) as SharedPayload;
  } catch {
    return null;
  }
}
