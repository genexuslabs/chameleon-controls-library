import { gzipSync, type ZlibOptions } from "zlib";

const GZIP_HEADER_CRC_OVERHEAD_ESTIMATION = 311;

/**
 * Estimate the Gzip size of a given string, using compression settings
 * similar to browsers/servers.
 * @param input - The string to compress and measure.
 * @returns The size in bytes after gzip compression.
 */
export function getGzipSize(input: string): number {
  const buffer = Buffer.from(input, "utf-8");

  // Use compression similar to servers (default level ~6)
  const options: ZlibOptions = { level: 6 };
  const gzipped = gzipSync(buffer, options);

  // Start with raw gzip size
  let size = gzipped.length;

  // Add Gzip header + CRC overhead estimation
  size += GZIP_HEADER_CRC_OVERHEAD_ESTIMATION;

  return size;
}
