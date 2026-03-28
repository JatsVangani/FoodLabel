/** Strip data-URI prefix from base64-encoded image strings */
export function stripBase64Prefix(imageBase64: string): string {
  const commaIndex = imageBase64.indexOf(",");
  return commaIndex !== -1 ? imageBase64.substring(commaIndex + 1) : imageBase64;
}

/** Strip markdown code fences and trim whitespace from a JSON response */
export function cleanJsonResponse(raw: string): string {
  return raw.trim().replace(/^```json\n?|```$/g, "").trim();
}
