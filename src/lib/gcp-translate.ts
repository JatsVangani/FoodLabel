import { TranslationServiceClient } from "@google-cloud/translate";

/**
 * Google Cloud Translation — translate food labels from other languages to English.
 * Useful when users upload labels in non-English languages.
 * Requires GOOGLE_APPLICATION_CREDENTIALS or running on GCP with appropriate IAM.
 */

let _client: TranslationServiceClient | null = null;

function getTranslateClient(): TranslationServiceClient {
  if (_client) return _client;
  _client = new TranslationServiceClient();
  return _client;
}

export interface TranslationResult {
  translatedText: string;
  detectedLanguage: string;
  confidence: number;
}

/** Translate food label text to English */
export async function translateToEnglish(
  text: string,
  projectId: string
): Promise<TranslationResult> {
  const client = getTranslateClient();
  const parent = `projects/${projectId}/locations/global`;

  const [response] = await client.translateText({
    parent,
    contents: [text],
    targetLanguageCode: "en",
    mimeType: "text/plain",
  });

  const translation = response.translations?.[0];
  if (!translation) {
    return { translatedText: text, detectedLanguage: "en", confidence: 0 };
  }

  return {
    translatedText: translation.translatedText || text,
    detectedLanguage: translation.detectedLanguageCode || "unknown",
    confidence: 1.0,
  };
}

/** Detect the language of food label text */
export async function detectLanguage(
  text: string,
  projectId: string
): Promise<{ language: string; confidence: number }> {
  const client = getTranslateClient();
  const parent = `projects/${projectId}/locations/global`;

  const [response] = await client.detectLanguage({
    parent,
    content: text,
    mimeType: "text/plain",
  });

  const detected = response.languages?.[0];
  return {
    language: detected?.languageCode || "unknown",
    confidence: detected?.confidence ?? 0,
  };
}
