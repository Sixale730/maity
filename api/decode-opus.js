import { OpusDecoder } from 'opus-decoder';

const CORS_ORIGINS = (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim());

/**
 * Vercel serverless function to decode OPUS audio to WAV
 *
 * POST /api/decode-opus
 * Body: {
 *   opusData: "base64 string of OPUS audio"
 * }
 *
 * Returns: {
 *   wavData: "base64 string of WAV audio"
 * }
 */
export default async function handler(req, res) {
  // CORS handling
  const origin = req.headers.origin || req.headers.referer || '';
  if (CORS_ORIGINS.some(o => origin.includes(o))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const { opusData } = req.body;

    if (!opusData || typeof opusData !== 'string') {
      return res.status(400).json({ error: 'MISSING_OPUS_DATA' });
    }

    console.log('[decode-opus] Starting OPUS decode, data length:', opusData.length);

    // Decode base64 to binary
    const opusBinary = Buffer.from(opusData, 'base64');
    console.log('[decode-opus] OPUS binary size:', opusBinary.length, 'bytes');

    // Initialize OPUS decoder (16kHz, mono)
    const decoder = new OpusDecoder({
      sampleRate: 16000,
      channels: 1,
    });

    // Decode OPUS to PCM
    // Note: opus-decoder expects Ogg Opus format
    const pcmData = await decoder.decode(opusBinary);

    if (!pcmData || pcmData.length === 0) {
      throw new Error('Failed to decode OPUS data - no PCM output');
    }

    console.log('[decode-opus] PCM decoded, samples:', pcmData.length);

    // Convert Float32Array PCM to WAV format
    const wavBuffer = convertPCMToWAV(pcmData, 16000, 1);

    console.log('[decode-opus] WAV created, size:', wavBuffer.length, 'bytes');

    // Convert WAV buffer to base64
    const wavData = wavBuffer.toString('base64');

    // Cleanup
    await decoder.free();

    return res.status(200).json({
      ok: true,
      wavData,
      stats: {
        opusSize: opusBinary.length,
        pcmSamples: pcmData.length,
        wavSize: wavBuffer.length,
      }
    });

  } catch (error) {
    console.error('[decode-opus] ERROR:', error);
    return res.status(500).json({
      error: 'DECODE_FAILED',
      message: error.message,
    });
  }
}

/**
 * Convert Float32Array PCM audio to WAV format
 * @param {Float32Array} pcmData - PCM audio samples (-1 to 1)
 * @param {number} sampleRate - Sample rate in Hz
 * @param {number} channels - Number of audio channels
 * @returns {Buffer} WAV file buffer
 */
function convertPCMToWAV(pcmData, sampleRate, channels) {
  const bitsPerSample = 16;
  const dataSize = pcmData.length * (bitsPerSample / 8);
  const fileSize = 44 + dataSize;

  // Create WAV header
  const wavHeader = Buffer.alloc(44);

  // "RIFF" chunk descriptor
  wavHeader.write('RIFF', 0);
  wavHeader.writeUInt32LE(fileSize - 8, 4);
  wavHeader.write('WAVE', 8);

  // "fmt " sub-chunk
  wavHeader.write('fmt ', 12);
  wavHeader.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  wavHeader.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  wavHeader.writeUInt16LE(channels, 22);
  wavHeader.writeUInt32LE(sampleRate, 24);
  wavHeader.writeUInt32LE(sampleRate * channels * (bitsPerSample / 8), 28); // ByteRate
  wavHeader.writeUInt16LE(channels * (bitsPerSample / 8), 32); // BlockAlign
  wavHeader.writeUInt16LE(bitsPerSample, 34);

  // "data" sub-chunk
  wavHeader.write('data', 36);
  wavHeader.writeUInt32LE(dataSize, 40);

  // Convert Float32 PCM to Int16 PCM
  const int16Data = Buffer.alloc(dataSize);
  for (let i = 0; i < pcmData.length; i++) {
    const s = Math.max(-1, Math.min(1, pcmData[i]));
    const sample = s < 0 ? s * 0x8000 : s * 0x7FFF;
    int16Data.writeInt16LE(Math.round(sample), i * 2);
  }

  // Combine header and data
  return Buffer.concat([wavHeader, int16Data]);
}
