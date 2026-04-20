import {
  env,
  AutoTokenizer,
  AutoProcessor,
  SiglipTextModel,
  SiglipVisionModel,
  RawImage
} from '@huggingface/transformers';

env.allowLocalModels = false;
env.allowRemoteModels = true;

const MODEL_ID = 'Xenova/siglip-base-patch16-224';

class SiglipService {
  static tokenizer: any = null;
  static processor: any = null;
  static textModel: any = null;
  static visionModel: any = null;
  static textEmbeddingsMap: Record<number, number[]> = {};

  static async init(progress_callback?: (data: any) => void) {
    if (!this.tokenizer) {
      const options = { device: 'wasm', dtype: 'q8' } as const;

      this.tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID, { progress_callback });
      this.processor = await AutoProcessor.from_pretrained(MODEL_ID, { progress_callback });
      this.textModel = await SiglipTextModel.from_pretrained(MODEL_ID, { ...options, progress_callback });
      this.visionModel = await SiglipVisionModel.from_pretrained(MODEL_ID, { ...options, progress_callback });
    }
  }

  static async getTextEmbeddings(texts: string[]) {
    const textInputs = await this.tokenizer(texts, {
      padding: "max_length",
      truncation: true,
    });

    const { pooler_output } = await this.textModel(textInputs);
    const embeddingSize = 768;
    const result: number[][] = [];

    for (let i = 0; i < texts.length; i++) {
      const start = i * embeddingSize;
      const end = start + embeddingSize;
      result.push(Array.from(pooler_output.data.slice(start, end)));
    }

    return result;
  }
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

self.addEventListener('message', async (event) => {
  const { type, data } = event.data;

  try {
    if (type === 'init') {
      await SiglipService.init((msg) => {
        self.postMessage({ type: 'progress', data: msg });
      });

      const items = data as { id: number; description: string }[];
      const descriptions = items.map((item) => item.description);
      const vectors = await SiglipService.getTextEmbeddings(descriptions);

      const embeddings: Record<number, number[]> = {};
      for (let i = 0; i < items.length; i++) {
        embeddings[items[i].id] = vectors[i];
      }

      SiglipService.textEmbeddingsMap = embeddings;
      self.postMessage({ type: 'text_embeddings_ready', data: embeddings });
    }

    if (type === 'similar') {
      const { items, currentId, limit = 3 } = data as {
        items: { id: number; description: string }[];
        currentId: number;
        limit?: number;
      };

      await SiglipService.init();

      if (!Object.keys(SiglipService.textEmbeddingsMap).length) {
        const descriptions = items.map((item) => item.description);
        const vectors = await SiglipService.getTextEmbeddings(descriptions);

        const embeddings: Record<number, number[]> = {};
        for (let i = 0; i < items.length; i++) {
          embeddings[items[i].id] = vectors[i];
        }

        SiglipService.textEmbeddingsMap = embeddings;
      }

      const currentEmbedding = SiglipService.textEmbeddingsMap[currentId];
      if (!currentEmbedding) {
        self.postMessage({ type: 'similar_ready', data: [] });
        return;
      }

      const similar = items
        .filter((item) => item.id !== currentId)
        .map((item) => ({
          ...item,
          similarity: cosineSimilarity(currentEmbedding, SiglipService.textEmbeddingsMap[item.id]),
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      self.postMessage({ type: 'similar_ready', data: similar });
    }

    if (type === 'image') {
      await SiglipService.init();

      const imageUrl = URL.createObjectURL(data as File);
      const image = await RawImage.read(imageUrl);

      const imageInputs = await SiglipService.processor(image);
      const { pooler_output } = await SiglipService.visionModel(imageInputs);

      self.postMessage({
        type: 'image_embedding_ready',
        data: Array.from(pooler_output.data)
      });

      URL.revokeObjectURL(imageUrl);
    }
  } catch (error) {
    console.error(error);
    self.postMessage({ type: 'error', data: error });
  }
});