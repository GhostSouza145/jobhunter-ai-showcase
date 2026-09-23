import pdfParse from 'pdf-parse';

/** Extrai o texto bruto de um PDF de currículo. */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  return result.text;
}
