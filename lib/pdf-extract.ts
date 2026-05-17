import { extractText } from "unpdf";

/**
 * Extract raw text from a PDF buffer without using AI.
 * This ensures no content is lost — every word in the PDF is captured.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const { text } = await extractText(new Uint8Array(buffer));
  return text.join("\n");
}
