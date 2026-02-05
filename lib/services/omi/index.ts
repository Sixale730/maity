/**
 * Omi Services Index
 *
 * Central export for all Omi-related services.
 */

// Embeddings
export {
  generateEmbedding,
  generateEmbeddingsBatch,
  EMBEDDING_DIMENSIONS,
  type Embedding,
} from './embeddings.service.js';

// Communication Analysis
export {
  analyzeCommunication,
  aggregateFeedback,
  type TranscriptSegment,
  type CommunicationFeedback,
  type CommunicationObservations,
  type CommunicationCounters,
} from './communication-analyzer.service.js';

// Memory Extraction
export {
  extractMemoriesFromTranscript,
  extractMemoriesFromSegments,
  MemoryCategory,
  type ExtractedMemory,
} from './memory-extractor.service.js';

// Chunked Processing
export {
  processLongTranscript,
  splitAtSentenceBoundaries,
  type ActionItem,
  type ConversationEvent,
  type ProcessedConversation,
} from './chunked-processor.service.js';
