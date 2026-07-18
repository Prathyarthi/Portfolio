import { extractText, getDocumentProxy } from "unpdf";

export const MAX_RESUME_PDF_PAGES = 20;
export const MAX_RESUME_EXTRACTED_TEXT_CHARS = 100_000;

export class PdfLimitError extends Error {
  constructor(
    message: string,
    readonly code: "PAGE_LIMIT" | "TEXT_LIMIT",
  ) {
    super(message);
    this.name = "PdfLimitError";
  }
}

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
  buffer: Buffer,
  limits: {
    maxPages?: number;
    maxChars?: number;
  } = {},
): Promise<{ text: string; quality: PdfExtractionQuality }> {
  const maxPages = limits.maxPages ?? MAX_RESUME_PDF_PAGES;
  const maxChars = limits.maxChars ?? MAX_RESUME_EXTRACTED_TEXT_CHARS;
  const document = await getDocumentProxy(new Uint8Array(buffer));

  try {
    if (document.numPages > maxPages) {
      throw new PdfLimitError(
        `PDF must contain at most ${maxPages} pages`,
        "PAGE_LIMIT",
      );
    }

    const { text, totalPages } = await extractText(document);
    const pageCount = totalPages ?? text.length;
    const pages: string[] = [];
    let joinedLength = 0;

    text.forEach((pageText, index) => {
      const body = pageText.trim();
      if (!body) return;

      const page = `--- Page ${index + 1} of ${pageCount} ---\n${body}`;
      joinedLength += page.length + (pages.length > 0 ? 2 : 0);
      if (joinedLength > maxChars) {
        throw new PdfLimitError(
          `Extracted PDF text must be at most ${maxChars} characters`,
          "TEXT_LIMIT",
        );
      }
      pages.push(page);
    });

    const joined = pages.join("\n\n");

    return {
      text: joined,
      quality: assessPdfExtractionQuality(joined, pageCount),
    };
  } finally {
    await document.destroy();
  }
}
