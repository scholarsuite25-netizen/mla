import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

/**
 * Overlays a buyer watermark on each page of a PDF. Pure-JS, no native deps.
 * This is a purchase deterrent, not unbreakable DRM (spec §5).
 */
export async function watermarkPdf(
  input: Uint8Array,
  text: string
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(input);
  if (doc.getPageCount() === 0) return input;

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const color = rgb(0.63, 0.2, 0.16);

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    page.drawText(text, {
      x: width / 2 - 110,
      y: height / 2 - 6,
      size: 12,
      font,
      color,
      rotate: degrees(-30),
      opacity: 0.35,
    });
    page.drawText(`MLA licensed to ${text}`, {
      x: width / 2 - 130,
      y: height / 2 - 22,
      size: 9,
      font,
      color,
      rotate: degrees(-30),
      opacity: 0.3,
    });
  }

  return await doc.save();
}