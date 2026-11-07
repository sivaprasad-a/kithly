"use client";

/**
 * Shrinks an uploaded photo in the browser before it ever reaches the server.
 * Phase 2: upload to Cloudinary / S3 instead and store only the URL.
 */
export async function compressImage(file: File, maxSide: number, maxBytes = 260_000): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("That image could not be opened");
  });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let type = "image/webp";
  let q = 0.85;
  let out = canvas.toDataURL(type, q);
  if (!out.startsWith("data:image/webp")) {
    type = "image/jpeg";
    out = canvas.toDataURL(type, q);
  }
  while (out.length > maxBytes && q > 0.4) {
    q -= 0.1;
    out = canvas.toDataURL(type, q);
  }
  if (out.length > 390_000) throw new Error("That image is too large — try a smaller one");
  return out;
}
