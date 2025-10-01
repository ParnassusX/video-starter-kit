import { useState, useEffect } from 'react';
import { REPLICATE_MODELS, type ReplicateModel } from '@/lib/replicate';

export function useReplicateModels() {
  const [models, setModels] = useState<ReplicateModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        // In a real app, you might fetch this from your API
        // const response = await fetch('/api/replicate');
        // const data = await response.json();
        // setModels(data);
        
        // For now, we'll use the locally defined models
        setModels(REPLICATE_MODELS);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch models'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, []);

  const getModelById = (id: string) => {
    return models.find(model => model.id === id);
  };

  const getModelsByCategory = (category: string) => {
    return models.filter(model => model.category === category);
  };

  return {
    models,
    isLoading,
    error,
    getModelById,
    getModelsByCategory,
  };
}
