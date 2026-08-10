import "server-only";

import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;

/** The only formats the shop accepts for a product photo. */
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const ACCEPT_ATTRIBUTE = "image/jpeg,image/png,image/webp,image/avif";

/**
 * Checks the first bytes of the file rather than trusting the type the
 * browser claims. A renamed .exe does not get written to a public folder.
 */
function sniff(bytes: Uint8Array): string | null {
  const ascii = (start: number, length: number) =>
    String.fromCharCode(...bytes.slice(start, start + length));

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";

  if (
    bytes[0] === 0x89 &&
    ascii(1, 3) === "PNG" &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a
  )
    return "png";

  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return "webp";

  // AVIF and other ISO base media files start with a size then "ftyp".
  if (ascii(4, 4) === "ftyp") {
    const brand = ascii(8, 4);
    if (brand === "avif" || brand === "avis" || brand === "mif1") return "avif";
  }

  return null;
}

export type UploadResult =
  | { ok: true; path: string }
  | { ok: false; message: string };

/**
 * Writes an uploaded photo into public/uploads under a random name and
 * returns the path to store on the product.
 */
export async function saveProductPhoto(file: File): Promise<UploadResult> {
  if (file.size === 0) return { ok: false, message: "That file is empty." };

  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      message: "That photo is over 6 MB. Please save a smaller copy.",
    };
  }

  if (!ALLOWED[file.type]) {
    return {
      ok: false,
      message: "Photos need to be JPG, PNG, WEBP or AVIF.",
    };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const actual = sniff(bytes);

  if (!actual) {
    return {
      ok: false,
      message: "That file is not a JPG, PNG, WEBP or AVIF image.",
    };
  }

  // The uploaded name is thrown away. It never touches the filesystem.
  const filename = `${randomBytes(16).toString("hex")}.${actual}`;
  const directory = path.join(process.cwd(), "public", "uploads");

  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, filename), bytes);

  return { ok: true, path: `/uploads/${filename}` };
}

/** Removes a photo the shop no longer shows. Missing files are ignored. */
export async function deleteProductPhoto(imagePath: string | null) {
  if (!imagePath || !imagePath.startsWith("/uploads/")) return;

  const filename = path.basename(imagePath);
  if (!/^[a-f0-9]{32}\.(jpg|png|webp|avif)$/.test(filename)) return;

  await fs
    .unlink(path.join(process.cwd(), "public", "uploads", filename))
    .catch(() => undefined);
}
