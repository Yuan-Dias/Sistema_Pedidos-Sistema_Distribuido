import { useCallback, useEffect, useRef, useState } from 'react';
import { handleApiError, NormalizedApiError, notificacaoService } from '../services/api';
import { NotificacaoHistorico } from '../types';

interface UseNotificacoesOptions {
  pollingIntervalMs?: number;
  initialAutoPoll?: boolean;
}

interface UseNotificacoesReturn {
  notificacoes: NotificacaoHistorico[];
  isLoading: boolean;
  isPolling: boolean;
  error: NormalizedApiError | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
  togglePolling: () => void;
  setPollingInterval: (ms: number) => void;
  pollingInterval: number;
}

/**
 * Hook customizado para monitoramento em tempo real da Cozinha (ms-notificacao: 8084)
 * Permite que a banca acompanhe o consumo das mensagens da fila RabbitMQ (R4/R5).
 */
export const useNotificacoes = ({
  pollingIntervalMs = 3000,
  initialAutoPoll = true,
}: UseNotificacoesOptions = {}): UseNotificacoesReturn => {
  const [notificacoes, setNotificacoes] = useState<NotificacaoHistorico[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(initialAutoPoll);
  const [pollingInterval, setPollingInterval] = useState<number>(pollingIntervalMs);
  const [error, setError] = useState<NormalizedApiError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const timerRef = useRef<number | null>(null);

  const fetchNotificacoes = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const data = await notificacaoService.listarNotificacoes();
      setNotificacoes(data);
      setLastUpdated(new Date());
    } catch (err) {
      const normalized = handleApiError(err);
      setError(normalized);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, []);

  const togglePolling = useCallback(() => {
    setIsPolling((prev) => !prev);
  }, []);

  // Polling em background para refletir mensagens consumidas do RabbitMQ
  useEffect(() => {
    fetchNotificacoes(false);

    if (isPolling) {
      timerRef.current = window.setInterval(() => {
        fetchNotificacoes(true);
      }, pollingInterval);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [fetchNotificacoes, isPolling, pollingInterval]);

  return {
    notificacoes,
    isLoading,
    isPolling,
    error,
    lastUpdated,
    refetch: () => fetchNotificacoes(false),
    togglePolling,
    setPollingInterval,
    pollingInterval,
  };
};
