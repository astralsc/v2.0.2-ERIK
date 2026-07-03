const fs = require("fs");
const path = require("path");
const lzma = require("lzma-native");

/**
 * LZMA CSV Encoder/Decoder Utility
 *
 * A utility for encoding and decoding files using LZMA compression
 * with a custom header format.
 */

/**
 * Convert length to bytes array (little-endian)
 * @private
 * @param {number} dataLen - Length to convert
 * @param {number} maxLen - Maximum number of bytes (default: 4)
 * @returns {Array<number>} Array of bytes
 */
function lenToBytes(dataLen, maxLen = 4) {
  const data = [];

  while (dataLen > 0) {
    const item = dataLen % 256;
    dataLen = Math.floor(dataLen / 256);
    data.push(item);
  }

  while (data.length < maxLen) {
    data.push(0);
  }

  return data;
}

/**
 * Encode (compress) a file or buffer using LZMA with custom header format
 *
 * @param {string|Buffer} input - File path or Buffer to encode
 * @param {Object} options - Encoding options
 * @param {string} [options.outputPath] - Output file path (required if saving to file)
 * @param {boolean} [options.returnBuffer=false] - Return Buffer instead of writing to file
 * @param {number} [options.maxLen=4] - Maximum bytes for size encoding
 * @returns {Buffer|string} Encoded Buffer if returnBuffer=true, otherwise output file path
 *
 * @example
 * // Encode file to file
 * const outputPath = encode('input.txt', { outputPath: 'output.csv' });
 *
 * @example
 * // Encode buffer and get result as buffer
 * const data = Buffer.from('Hello World');
 * const encoded = encode(data, { returnBuffer: true });
 *
 * @example
 * // Encode file and get buffer
 * const encoded = encode('input.txt', { returnBuffer: true });
 */
function encode(input, options = {}) {
  const { outputPath = null, returnBuffer = false, maxLen = 4 } = options;

  // Read input data
  let data;
  if (Buffer.isBuffer(input)) {
    data = input;
  } else if (typeof input === "string") {
    data = fs.readFileSync(input);
  } else {
    throw new Error("Input must be a file path (string) or Buffer");
  }

  // LZMA compression options matching the Python implementation
  const lzmaOptions = {
    preset: lzma.PRESET_DEFAULT,
    check: lzma.CHECK_NONE,
    filters: [
      {
        id: lzma.FILTER_LZMA1,
        options: {
          dictSize: 256 * 1024,
          lc: 3,
          lp: 0,
          pb: 2,
          mode: lzma.MODE_NORMAL,
        },
      },
    ],
  };

  // Compress using LZMA
  const packData = lzma.compressSync(data, lzmaOptions);

  // Build custom header
  const lzmaData = [];

  // Copy first 5 bytes from compressed data (LZMA properties)
  for (let i = 0; i < 5; i++) {
    lzmaData.push(packData[i]);
  }

  // Add original data size as 4 bytes (little-endian)
  const dataSize = lenToBytes(data.length, maxLen);
  for (const size of dataSize) {
    lzmaData.push(size);
  }

  // Copy remaining compressed data starting from index 13
  for (let i = 13; i < packData.length; i++) {
    lzmaData.push(packData[i]);
  }

  const outputBuffer = Buffer.from(lzmaData);

  // Return buffer or write to file
  if (returnBuffer) {
    return outputBuffer;
  } else {
    if (!outputPath) {
      throw new Error("outputPath is required when returnBuffer is false");
    }
    fs.writeFileSync(outputPath, outputBuffer);
    return outputPath;
  }
}

/**
 * Decode (decompress) an encoded file or buffer
 *
 * @param {string|Buffer} input - File path or Buffer to decode
 * @param {Object} options - Decoding options
 * @param {string} [options.outputPath] - Output file path (required if saving to file)
 * @param {boolean} [options.returnBuffer=false] - Return Buffer instead of writing to file
 * @returns {Buffer|string|null} Decoded Buffer if returnBuffer=true, output file path if successful, null on error
 *
 * @example
 * // Decode file to file
 * const outputPath = decode('input.csv', { outputPath: 'output.txt' });
 *
 * @example
 * // Decode buffer and get result as buffer
 * const encoded = Buffer.from(...);
 * const decoded = decode(encoded, { returnBuffer: true });
 *
 * @example
 * // Decode file and get buffer
 * const decoded = decode('input.csv', { returnBuffer: true });
 */
function decode(input, options = {}) {
  const { outputPath = null, returnBuffer = false } = options;

  try {
    // Read input data
    let data;
    if (Buffer.isBuffer(input)) {
      data = input;
    } else if (typeof input === "string") {
      data = fs.readFileSync(input);
    } else {
      throw new Error("Input must be a file path (string) or Buffer");
    }

    // Reconstruct standard LZMA format
    const tempdata = Buffer.alloc(data.length + 4);

    // Copy first 8 bytes (5 bytes properties + 3 bytes from size)
    data.copy(tempdata, 0, 0, 8);

    // Insert 4 zero bytes at position 8 (extending size to 8 bytes)
    tempdata[8] = 0;
    tempdata[9] = 0;
    tempdata[10] = 0;
    tempdata[11] = 0;

    // Copy remaining bytes starting from position 12 in tempdata
    data.copy(tempdata, 12, 8);

    // Decompress using LZMA
    const unpackData = lzma.decompressSync(tempdata);

    // Return buffer or write to file
    if (returnBuffer) {
      return unpackData;
    } else {
      if (!outputPath) {
        throw new Error("outputPath is required when returnBuffer is false");
      }
      fs.writeFileSync(outputPath, unpackData);
      return outputPath;
    }
  } catch (error) {
    console.error("Decoding error:", error.message);
    return null;
  }
}

/**
 * Encode a file and automatically generate output filename
 *
 * @param {string} filePath - Input file path
 * @param {string} [suffix='.encoded.csv'] - Suffix for output file
 * @returns {string} Path to encoded file
 *
 * @example
 * const encoded = encodeFile('document.txt');
 * // Creates: document.encoded.csv
 */
function encodeFile(filePath, suffix = ".encoded.csv") {
  const basename = path.basename(filePath, path.extname(filePath));
  const outputPath = path.join(path.dirname(filePath), basename + suffix);

  return encode(filePath, { outputPath });
}

/**
 * Decode a file and automatically generate output filename
 *
 * @param {string} filePath - Input file path
 * @param {string} [outputDir] - Output directory (defaults to 'decoded' in current directory)
 * @returns {string|null} Path to decoded file, or null on error
 *
 * @example
 * const decoded = decodeFile('document.encoded.csv');
 * // Creates: decoded/document.encoded
 */
function decodeFile(filePath, outputDir = null) {
  const basename = path.basename(filePath, path.extname(filePath));
  const decodedDir = outputDir || path.join(process.cwd(), "decoded");

  // Create output directory if it doesn't exist
  if (!fs.existsSync(decodedDir)) {
    fs.mkdirSync(decodedDir, { recursive: true });
  }

  const outputPath = path.join(decodedDir, basename);

  return decode(filePath, { outputPath });
}

/**
 * Encode data from a buffer
 *
 * @param {Buffer} buffer - Data to encode
 * @returns {Buffer} Encoded data
 *
 * @example
 * const data = Buffer.from('Hello World');
 * const encoded = encodeBuffer(data);
 */
function encodeBuffer(buffer) {
  return encode(buffer, { returnBuffer: true });
}

/**
 * Decode data from a buffer
 *
 * @param {Buffer} buffer - Encoded data
 * @returns {Buffer|null} Decoded data, or null on error
 *
 * @example
 * const encoded = Buffer.from(...);
 * const decoded = decodeBuffer(encoded);
 */
function decodeBuffer(buffer) {
  return decode(buffer, { returnBuffer: true });
}

/**
 * Encode a string
 *
 * @param {string} str - String to encode
 * @param {string} [encoding='utf8'] - String encoding
 * @returns {Buffer} Encoded data
 *
 * @example
 * const encoded = encodeString('Hello World');
 */
function encodeString(str, encoding = "utf8") {
  const buffer = Buffer.from(str, encoding);
  return encodeBuffer(buffer);
}

/**
 * Decode to a string
 *
 * @param {Buffer|string} input - Encoded data (Buffer or file path)
 * @param {string} [encoding='utf8'] - String encoding
 * @returns {string|null} Decoded string, or null on error
 *
 * @example
 * const decoded = decodeString(encodedBuffer);
 */
function decodeString(input, encoding = "utf8") {
  const buffer = decode(input, { returnBuffer: true });
  return buffer ? buffer.toString(encoding) : null;
}

/**
 * Get the original size of an encoded file without decompressing
 *
 * @param {string|Buffer} input - Encoded file path or Buffer
 * @returns {number} Original file size in bytes
 *
 * @example
 * const size = getOriginalSize('document.encoded.csv');
 * console.log(`Original size: ${size} bytes`);
 */
function getOriginalSize(input) {
  let data;
  if (Buffer.isBuffer(input)) {
    data = input;
  } else {
    data = fs.readFileSync(input);
  }

  // Read size from bytes 5-8 (little-endian)
  let size = 0;
  for (let i = 0; i < 4; i++) {
    size += data[5 + i] * Math.pow(256, i);
  }

  return size;
}

// Export all functions
module.exports = {
  // Core functions (flexible)
  encode,
  decode,

  // File-based functions (convenience)
  encodeFile,
  decodeFile,

  // Buffer-based functions (convenience)
  encodeBuffer,
  decodeBuffer,

  // String-based functions (convenience)
  encodeString,
  decodeString,

  // Utility functions
  getOriginalSize,
};
