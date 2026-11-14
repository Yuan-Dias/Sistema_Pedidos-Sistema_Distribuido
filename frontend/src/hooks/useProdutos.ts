import { useCallback, useEffect, useState } from 'react';
import { catalogoService, handleApiError, NormalizedApiError } from '../services/api';
import { Produto } from '../types';

interface UseProdutosReturn {
  produtos: Produto[];
  isLoading: boolean;
  error: NormalizedApiError | null;
  refetch: () => Promise<void>;
}

/**
 * Hook customizado para consulta e gerenciamento do catálogo de produtos (ms-catalogo: 8082)
 */
export const useProdutos = (autoFetch = true): UseProdutosReturn => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchProdutos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await catalogoService.listarProdutos();
      setProdutos(data);
    } catch (err) {
      const normalized = handleApiError(err);
      setError(normalized);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchProdutos();
    }
  }, [autoFetch, fetchProdutos]);

  return {
    produtos,
    isLoading,
    error,
    refetch: fetchProdutos,
  };
};
