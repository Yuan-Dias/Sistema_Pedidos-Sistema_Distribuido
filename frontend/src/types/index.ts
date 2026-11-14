/**
 * Tipagens estritas do Domínio da Confeitaria / Sistema de Pedidos Distribuído
 */

export interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  quantidadeEstoque: number;
}

export interface ItemPedidoRequest {
  produtoId: number;
  quantidade: number;
}

export interface CriarPedidoPayload {
  itens: ItemPedidoRequest[];
}

export interface ItemPedidoResponse {
  id: number;
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export type StatusPedido = 'CRIADO' | 'CONFIRMADO' | 'CANCELADO' | 'PROCESSADO';

export interface PedidoResponse {
  id: number;
  dataCriacao: string;
  status: StatusPedido;
  valorTotal: number;
  itens: ItemPedidoResponse[];
}

export interface NotificacaoHistorico {
  id: number;
  pedidoId: number;
  mensagem: string;
  dataProcessamento: string;
  status: string;
}

export interface CartItem {
  produto: Produto;
  quantidade: number;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

export interface ApiErrorDetail {
  timestamp?: string;
  status: number;
  error: string;
  message: string;
}
