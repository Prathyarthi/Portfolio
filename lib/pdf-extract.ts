import { extractText } from "unpdf";

export type PdfExtractionQuality = {
  charCount: number;
  pageCount: number;
  isLikelyIncomplete: boolean;
  hints: string[];
};

/**
 * Heuristic check for PDFs where text extraction missed headers, contact blocks, etc.
 * Used to tell the AI that the input may be partial — not to reject the upload.
 */
export function assessPdfExtractionQuality(text: string, pageCount: number): PdfExtractionQuality {
  const trimmed = text.trim();
  const hints: string[] = [];

  if (trimmed.length < 200) hints.push("very_little_text");
  if (pageCount > 0 && trimmed.length / pageCount < 400) {
    hints.push("low_text_per_page");
  }
  if (!/[@\u0040]/.test(trimmed) && !/\+?\d[\d\s().-]{7,}/.test(trimmed)) {
    hints.push("no_contact_patterns");
  }
  if (!/\b(education|university|college|b\.?tech|b\.?sc|m\.?sc|mba|ph\.?d|bachelor|master)\b/i.test(trimmed)) {
    hints.push("no_education_keywords");
  }
  if (/^[\s]*(?:summary|profile|objective|experience|skills)\b/i.test(trimmed)) {
    hints.push("starts_mid_resume");
  }

  return {
    charCount: trimmed.length,
    pageCount,
    isLikelyIncomplete: hints.length >= 2,
    hints,
  };
}

/**
 * Extract raw text from a PDF buffer without using AI.
 * Page markers help the model understand layout when sections span pages.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const { text, totalPages } = await extractText(new Uint8Array(buffer));
  const pageCount = totalPages ?? text.length;

  return text
    .map((pageText, index) => {
      const body = pageText.trim();
      if (!body) return "";
      return `--- Page ${index + 1} of ${pageCount} ---\n${body}`;
    })
    .filter(Boolean)
    .join("\n\n");
}

export async function extractTextAndQualityFromPdf(
  buffer: Buffer
): Promise<{ text: string; quality: PdfExtractionQuality }> {
  const { text, totalPages } = await extractText(new Uint8Array(buffer));
  const pageCount = totalPages ?? text.length;
  const joined = text
    .map((pageText, index) => {
      const body = pageText.trim();
      if (!body) return "";
      return `--- Page ${index + 1} of ${pageCount} ---\n${body}`;
    })
    .filter(Boolean)
    .join("\n\n");

  return {
    text: joined,
    quality: assessPdfExtractionQuality(joined, pageCount),
  };
}
