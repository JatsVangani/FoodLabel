import { ImageAnnotatorClient } from "@google-cloud/vision";

/**
 * Google Cloud Vision — OCR text extraction from food label images.
 * Used as an alternative/supplement to Gemini for label text extraction.
 * Requires GOOGLE_APPLICATION_CREDENTIALS or running on GCP with appropriate IAM.
 */

let _client: ImageAnnotatorClient | null = null;

function getVisionClient(): ImageAnnotatorClient {
  if (_client) return _client;
  _client = new ImageAnnotatorClient();
  return _client;
}

export interface OcrResult {
  text: string;
  confidence: number;
  locale: string;
}

/** Extract text from a food label image using Cloud Vision OCR */
export async function extractTextFromImage(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<OcrResult> {
  const client = getVisionClient();
  const base64Data = imageBase64.includes(",")
    ? imageBase64.split(",")[1]
    : imageBase64;

  const [result] = await client.textDetection({
    image: { content: base64Data },
  });

  const annotations = result.textAnnotations;
  if (!annotations || annotations.length === 0) {
    return { text: "", confidence: 0, locale: "en" };
  }

  const fullText = annotations[0].description || "";
  const locale = annotations[0].locale || "en";
  const confidence =
    result.fullTextAnnotation?.pages?.[0]?.confidence ?? 0;

  return { text: fullText.trim(), confidence, locale };
}

/** Detect labels/objects in a food product image */
export async function detectFoodLabels(
  imageBase64: string
): Promise<string[]> {
  const client = getVisionClient();
  const base64Data = imageBase64.includes(",")
    ? imageBase64.split(",")[1]
    : imageBase64;

  const [result] = await client.labelDetection({
    image: { content: base64Data },
  });

  return (result.labelAnnotations || [])
    .filter((label: { score?: number | null }) => (label.score ?? 0) > 0.7)
    .map((label: { description?: string | null }) => label.description || "")
    .filter(Boolean);
}
