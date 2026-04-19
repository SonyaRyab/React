import { useState, useRef, useEffect } from 'react';
import type { Reagent } from '../modules/types';
import { cosineSimilarity } from '../modules/math';

// Расширяем интерфейс для UI (добавляем score и видимость)
export interface IProcessedReagent extends Reagent {
    score: number;
    isVisible: boolean;
}

export const useReagentSearch = (initialItems: Reagent[]) => { 
    const [items, setItems] = useState<IProcessedReagent []>(
        initialItems.map(item => ({ ...item, score: 0, isVisible: true }))
    );
    
    const [imageEmbedding, setImageEmbedding] = useState<number[] | null>(null);
    const [ready, setReady] = useState(false);
    const [progress, setProgress] = useState(0);
    
    const workerRef = useRef<Worker | null>(null);

    // 1. Инициализация и получение текстовых векторов
    useEffect(() => {
        workerRef.current = new Worker(new URL('../workers/search.worker.ts', import.meta.url), {
            type: 'module'
        });

        workerRef.current.onmessage = (e) => {
            const { type, data } = e.data;

            switch (type) {
                case 'progress':
                    if (data.status === 'progress') setProgress(data.progress);
                    else if (data.status === 'ready') setReady(true);
                    break;
                
                case 'text_embeddings_ready':
                    setItems(prev => prev.map(item => ({
                        ...item,
                        embedding: data[item.id]
                    })));
                    setReady(true);
                    break;

                case 'image_embedding_ready':
                    setImageEmbedding(data);
                    break;
            }
        };

        workerRef.current.postMessage({ type: 'init', data: initialItems });

        return () => workerRef.current?.terminate();
    }, [initialItems]);

    // 2. Логика поиска и сортировки
    useEffect(() => {
        if (!imageEmbedding) return;

        setItems(prevItems => {
            // Если вектора описаний еще не посчитаны, нет смысла искать
            if (!prevItems[0].embedding) return prevItems;

            const threshold = 0.005;

            const processed = prevItems.map(item => {
                if (!item.embedding) return item; 
                
                const similarity = cosineSimilarity(imageEmbedding, item.embedding);
                
                return {
                    ...item,
                    score: similarity,
                    isVisible: similarity > threshold
                };
            });

            // Сортировка по убыванию рейтинга
            processed.sort((a, b) => b.score - a.score);
            
            return processed;
        });

    }, [imageEmbedding]);

    // 3. Методы управления
    const searchByImage = (file: File) => {
        workerRef.current?.postMessage({ type: 'image', data: file });
    };

    const resetSearch = () => {
        setImageEmbedding(null);
        // Сброс: возвращаем исходный порядок (по ID), обнуляем score
        setItems(prev => {
            const sortedById = [...prev].sort((a, b) => a.id - b.id);
            return sortedById.map(item => ({
                ...item,
                score: 0,
                isVisible: true
            }));
        });
    };

    return {
        items,
        ready,
        progress,
        imageEmbedding,
        searchByImage,
        resetSearch
    };
};