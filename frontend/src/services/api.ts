import axios, { AxiosError, AxiosInstance } from 'axios';
import {
  CriarPedidoPayload,
  NotificacaoHistorico,
  PedidoResponse,
  Produto,
} from '../types';

/**
 * URLs dos Microsserviços:
 * Em ambiente Vite, o proxy configurado em vite.config.ts redireciona:
 *   /api/catalogo     -> http://localhost:8082
 *   /api/pedidos      -> http://localhost:8083
 *   /api/notificacoes -> http://localhost:8084
 *
 * Isso elimina bloqueios de CORS no navegador sem exigir mudanças nas anotações do Spring Boot.
 * Caso configurado via VITE_USE_DIRECT_URLS=true, aponta diretamente para as portas locais.
 */
const useDirect = import.meta.env.VITE_USE_DIRECT_URLS === 'true';

export const CATALOGO_BASE_URL = useDirect
  ? (import.meta.env.VITE_CATALOGO_URL || 'http://localhost:8082')
  : '/api/catalogo';

export const PEDIDOS_BASE_URL = useDirect
  ? (import.meta.env.VITE_PEDIDOS_URL || 'http://localhost:8083')
  : '/api/pedidos';

export const NOTIFICACAO_BASE_URL = useDirect
  ? (import.meta.env.VITE_NOTIFICACAO_URL || 'http://localhost:8084')
  : '/api/notificacoes';

/**
 * Cria instâncias customizadas do Axios com timeout e cabeçalhos padrão
 */
const createApiClient = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      Accept: 'application/json',
    },
  });

  return instance;
};

export const catalogoApi = createApiClient(CATALOGO_BASE_URL);
export const pedidosApi = createApiClient(PEDIDOS_BASE_URL);
export const notificacaoApi = createApiClient(NOTIFICACAO_BASE_URL);

/**
 * Estrutura padronizada de erro retornada para a camada de visualização
 */
export interface NormalizedApiError {
  status: number;
  title: string;
  message: string;
  isLockConflict: boolean;
  isServiceUnavailable: boolean;
  originalError: unknown;
}

/**
 * Tratamento centralizado de erros conforme os Requisitos da Banca:
 * 1. HTTP 409 (Lock Pessimista): Concorrência na última unidade
 * 2. HTTP 503 / 500 (Tolerância a Falhas): Microsserviço de pedidos falhou ao contatar o catálogo
 * 3. Demais cenários de rede / indisponibilidade
 */
export const handleApiError = (error: unknown): NormalizedApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    const status = axiosError.response?.status || 0;
    const backendMessage = axiosError.response?.data?.message;

    // 1. Requisito R6 - Concorrência e Lock Pessimista (HTTP 409)
    if (status === 409) {
      return {
        status: 409,
        title: 'Estoque Esgotado!',
        message: 'Ops! Outro cliente comprou o último item neste exato segundo. Estoque esgotado!',
        isLockConflict: true,
        isServiceUnavailable: false,
        originalError: error,
      };
    }

    // 2. Requisito R5 - Tolerância a Falhas e Resiliência (HTTP 503 ou 500)
    if (status === 503 || status === 500) {
      return {
        status,
        title: 'Serviço Indisponível',
        message: 'Serviço temporariamente indisponível. Tente novamente.',
        isLockConflict: false,
        isServiceUnavailable: true,
        originalError: error,
      };
    }

    // HTTP 404 - Recurso não encontrado
    if (status === 404) {
      return {
        status: 404,
        title: 'Não Encontrado',
        message: backendMessage || 'O recurso solicitado não foi encontrado no sistema.',
        isLockConflict: false,
        isServiceUnavailable: false,
        originalError: error,
      };
    }

    // Falha de Conexão (ex: serviço offline ou porta inacessível)
    if (axiosError.code === 'ERR_NETWORK' || !axiosError.response) {
      return {
        status: 0,
        title: 'Falha de Conexão',
        message: 'Serviço temporariamente indisponível. Verifique se os microsserviços estão em execução.',
        isLockConflict: false,
        isServiceUnavailable: true,
        originalError: error,
      };
    }

    return {
      status,
      title: 'Erro na Requisição',
      message: backendMessage || axiosError.message || 'Ocorreu um erro inesperado ao processar sua solicitação.',
      isLockConflict: false,
      isServiceUnavailable: false,
      originalError: error,
    };
  }

  return {
    status: -1,
    title: 'Erro Inesperado',
    message: error instanceof Error ? error.message : 'Falha desconhecida na operação.',
    isLockConflict: false,
    isServiceUnavailable: false,
    originalError: error,
  };
};

/**
 * Serviços da API tipados
 */

// ms-catalogo (Porta 8082)
export const catalogoService = {
  listarProdutos: async (): Promise<Produto[]> => {
    const response = await catalogoApi.get<Produto[]>('/produtos');
    return response.data;
  },
  buscarPorId: async (id: number): Promise<Produto> => {
    const response = await catalogoApi.get<Produto>(`/produtos/${id}`);
    return response.data;
  },
};

// ms-pedidos (Porta 8083)
export const pedidosService = {
  criarPedido: async (payload: CriarPedidoPayload): Promise<PedidoResponse> => {
    const response = await pedidosApi.post<PedidoResponse>('/pedidos', payload);
    return response.data;
  },
  listarPedidos: async (): Promise<PedidoResponse[]> => {
    const response = await pedidosApi.get<PedidoResponse[]>('/pedidos');
    return response.data;
  },
  buscarPorId: async (id: number): Promise<PedidoResponse> => {
    const response = await pedidosApi.get<PedidoResponse>(`/pedidos/${id}`);
    return response.data;
  },
};

// ms-notificacao (Porta 8084)
export const notificacaoService = {
  listarNotificacoes: async (): Promise<NotificacaoHistorico[]> => {
    const response = await notificacaoApi.get<NotificacaoHistorico[]>('/notificacoes');
    return response.data;
  },
};
