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

    static async init(progress_callback?: (data: any) => void) {
        if (!this.tokenizer) {
            // Используем q8 для баланса качества и скорости
            const options = { device: 'wasm', dtype: 'q8' } as const;

            this.tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID, { progress_callback });
            this.processor = await AutoProcessor.from_pretrained(MODEL_ID, { progress_callback });
            this.textModel = await SiglipTextModel.from_pretrained(MODEL_ID, {...options, progress_callback });
            this.visionModel = await SiglipVisionModel.from_pretrained(MODEL_ID, {...options, progress_callback });
        }
    }
}

self.addEventListener('message', async (event) => {
    const { type, data } = event.data;

    try {
        if (type === 'init') {
            await SiglipService.init((msg) => {
                self.postMessage({ type: 'progress', data: msg });
            });

            const items = data;
            const embeddings: Record<number, number[]> = {};

            // Все описания РАЗОМ
            const descriptions = items.map((item: any) => item.description);
            
            // max_length нужен для одинаковой длины 
            const text_inputs = await SiglipService.tokenizer(descriptions, { 
                padding: 'max_length', 
                truncation: true,
            });

            // Получаем выход текстовой модели, мы заэмбеддили все описания за раз, сделав 1 эмбеддинг
            const { pooler_output: textOutput } = await SiglipService.textModel(text_inputs);

            // Размерность выхода SigLIP base = 768
            const embeddingSize = 768; 

            for (let i = 0; i < items.length; i++) {
                const start = i * embeddingSize;
                const end = start + embeddingSize;
                // Этот кусок - вектор для одного описания
                const textVector = textOutput.data.slice(start, end);
                
                const itemId = items[i].id; 
                embeddings[itemId] = Array.from(textVector);
            }

            self.postMessage({ type: 'text_embeddings_ready', data: embeddings });
        }

        // Если загрузили картинку
        if (type === 'image') {
            // Считываем
            const imageUrl = URL.createObjectURL(data); 
            // RawImage - утилита для работы с изображениями, без нее процессор может воспринять картинку как текст, и visionModel выдаст ошибку
            const image = await RawImage.read(imageUrl);
            
            // Обрабатываем картинку и получаем вектор
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