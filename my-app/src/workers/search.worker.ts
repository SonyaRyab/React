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
  static imageEmbeddingsMap: Record<number, number[]> = {};

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
      padding: 'max_length',
      truncation: true,
    });

    const { pooler_output } = await this.textModel(textInputs);
    const embeddingSize = 768;
    const raw = Array.from(pooler_output.data as ArrayLike<number>);
    const result: number[][] = [];

    for (let i = 0; i < texts.length; i++) {
      const start = i * embeddingSize;
      const end = start + embeddingSize;
      result.push(raw.slice(start, end));
    }

    return result;
  }

  static async getImageEmbeddingFromUrl(imageUrl: string): Promise<number[]> {
    const image = await RawImage.read(imageUrl);
    const imageInputs = await this.processor(image);
    const { pooler_output } = await this.visionModel(imageInputs);
    return Array.from(pooler_output.data as ArrayLike<number>);
  }

  static async getImageEmbeddingFromFile(file: File): Promise<number[]> {
    const objectUrl = URL.createObjectURL(file);

    try {
      const image = await RawImage.read(objectUrl);
      const imageInputs = await this.processor(image);
      const { pooler_output } = await this.visionModel(imageInputs);
      return Array.from(pooler_output.data as ArrayLike<number>);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  const length = Math.min(vecA.length, vecB.length);

  for (let i = 0; i < length; i++) {
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

      const items = data as {
        id: number;
        description: string;
        img?: string;
      }[];

      const descriptions = items.map((item) => item.description || '');
      const textVectors = await SiglipService.getTextEmbeddings(descriptions);

      const textEmbeddings: Record<number, number[]> = {};
      for (let i = 0; i < items.length; i++) {
        textEmbeddings[items[i].id] = textVectors[i];
      }
      SiglipService.textEmbeddingsMap = textEmbeddings;

      const imageEmbeddings: Record<number, number[]> = {};
      for (const item of items) {
        if (!item.img) continue;

        try {
          const vector = await SiglipService.getImageEmbeddingFromUrl(item.img);
          imageEmbeddings[item.id] = vector;
        } catch (err) {
          console.warn(`Не удалось получить эмбеддинг изображения для id=${item.id}`, err);
        }
      }
      SiglipService.imageEmbeddingsMap = imageEmbeddings;

      self.postMessage({
        type: 'init_embeddings_ready',
        data: {
          textEmbeddings,
          imageEmbeddings,
        },
      });

      self.postMessage({
        type: 'progress',
        data: { status: 'ready', progress: 100 },
      });
    }

    if (type === 'similar') {
      const { items, currentId, limit = 3 } = data as {
        items: { id: number; description: string }[];
        currentId: number;
        limit?: number;
      };

      await SiglipService.init();

      if (!Object.keys(SiglipService.textEmbeddingsMap).length) {
        const descriptions = items.map((item) => item.description || '');
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
          similarity: cosineSimilarity(
            currentEmbedding,
            SiglipService.textEmbeddingsMap[item.id]
          ),
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      self.postMessage({ type: 'similar_ready', data: similar });
    }

    if (type === 'image') {
      await SiglipService.init();

      const uploadedImageEmbedding = await SiglipService.getImageEmbeddingFromFile(data as File);

      self.postMessage({
        type: 'image_embedding_ready',
        data: uploadedImageEmbedding,
      });

      const rankedByImage = Object.entries(SiglipService.imageEmbeddingsMap)
        .map(([id, embedding]) => ({
          id: Number(id),
          score: cosineSimilarity(uploadedImageEmbedding, embedding),
        }))
        .sort((a, b) => b.score - a.score);

      self.postMessage({
        type: 'image_search_ready',
        data: rankedByImage,
      });
    }
  } catch (error) {
    console.error(error);
    self.postMessage({
      type: 'error',
      data: error instanceof Error ? error.message : String(error),
    });
  }
});