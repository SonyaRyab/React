import { useState, useRef, useEffect } from 'react';
import type { Reagent } from '../modules/types';
import { cosineSimilarity } from '../modules/math';
import { getMediaUrl } from '../modules/media';

export interface IProcessedReagent extends Reagent {
  score: number;
  isVisible: boolean;
  embedding?: number[];
  imageEmbedding?: number[];
}

export const useReagentSearch = (initialItems: Reagent[]) => {
  const [items, setItems] = useState<IProcessedReagent[]>(
    initialItems.map(item => ({
      ...item,
      img: getMediaUrl(item.img),
      score: 0,
      isVisible: true,
    }))
  );

  const [imageEmbedding, setImageEmbedding] = useState<number[] | null>(null);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const normalizedItems: IProcessedReagent[] = initialItems.map(item => ({
      ...item,
      img: getMediaUrl(item.img),
      score: 0,
      isVisible: true,
    }));

    setItems(normalizedItems);
    setReady(false);
    setProgress(0);

    workerRef.current?.terminate();

    workerRef.current = new Worker(
      new URL('../workers/search.worker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (e) => {
      const { type, data } = e.data;

      switch (type) {
        case 'progress':
          if (data.status === 'progress') {
            setProgress(data.progress ?? 0);
          } else if (data.status === 'ready') {
            setProgress(100);
            setReady(true);
          }
          break;

        case 'init_embeddings_ready': {
          const { textEmbeddings, imageEmbeddings } = data;

          setItems(prev =>
            prev.map(item => ({
              ...item,
              embedding: textEmbeddings[item.id],
              imageEmbedding: imageEmbeddings[item.id],
            }))
          );

          setReady(true);
          break;
        }

        case 'image_embedding_ready':
          setImageEmbedding(data);
          break;

        case 'error':
          console.error('Worker error:', data);
          break;
      }
    };

    workerRef.current.postMessage({
      type: 'init',
      data: normalizedItems.map(item => ({
        id: item.id,
        description: item.description,
        img: item.img,
      })),
    });

    return () => workerRef.current?.terminate();
  }, [initialItems]);

  useEffect(() => {
    if (!imageEmbedding) return;

    setItems(prevItems => {
      if (!prevItems.length) return prevItems;

      const threshold = 0.15;

      const processed = prevItems.map(item => {
        if (!item.imageEmbedding) {
          return {
            ...item,
            score: 0,
            isVisible: false,
          };
        }

        const similarity = cosineSimilarity(imageEmbedding, item.imageEmbedding);

        return {
          ...item,
          score: similarity,
          isVisible: similarity > threshold,
        };
      });

      processed.sort((a, b) => b.score - a.score);
      return processed;
    });
  }, [imageEmbedding]);

  const searchByImage = (file: File) => {
    workerRef.current?.postMessage({ type: 'image', data: file });
  };

  const resetSearch = () => {
    setImageEmbedding(null);

    const normalizedItems: IProcessedReagent[] = initialItems
      .map(item => ({
        ...item,
        img: getMediaUrl(item.img),
        score: 0,
        isVisible: true,
      }))
      .sort((a, b) => a.id - b.id);

    setItems(normalizedItems);
  };

  return {
    items,
    ready,
    progress,
    imageEmbedding,
    searchByImage,
    resetSearch,
  };
};