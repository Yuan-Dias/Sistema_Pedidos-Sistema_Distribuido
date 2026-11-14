import React from 'react';
import { AlertTriangle, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ItemPedidoRequest, PedidoResponse } from '../types';
import { formatCurrency } from '../utils/formatters';

interface CartModalProps {
  onCheckout: (
    itens: ItemPedidoRequest[],
    onSuccessCallback?: (pedido: PedidoResponse) => void
  ) => Promise<PedidoResponse | null>;
  isSubmitting: boolean;
  onSuccessOrder?: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  onCheckout,
  isSubmitting,
  onSuccessOrder,
}) => {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalAmount, isCartOpen, setIsCartOpen } =
    useCart();

  if (!isCartOpen) return null;

  const handleConfirmOrder = async () => {
    if (items.length === 0) return;

    const payloadItens: ItemPedidoRequest[] = items.map((item) => ({
      produtoId: item.produto.id,
      quantidade: item.quantidade,
    }));

    const result = await onCheckout(payloadItens, () => {
      clearCart();
      setIsCartOpen(false);
      if (onSuccessOrder) {
        onSuccessOrder();
      }
    });

    // Se o pedido teve conflito ou erro, o hook usePedidos já disparou os toasts vermelhos adequados
    if (!result) {
      // Deixa o modal aberto para que o usuário revise o que falhou
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity"
        onClick={() => !isSubmitting && setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-bakery-100 text-bakery-700 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-900">Seu Carrinho</h2>
                <p className="text-xs text-stone-500">
                  {totalItems} {totalItems === 1 ? 'item selecionado' : 'itens selecionados'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              disabled={isSubmitting}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de Itens */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-stone-400">
                <ShoppingBag className="w-16 h-16 stroke-1 text-stone-300 mb-3" />
                <p className="font-semibold text-stone-600">Seu carrinho está vazio</p>
                <p className="text-xs text-stone-400 mt-1 max-w-[200px]">
                  Explore os itens da nossa confeitaria e adicione suas guloseimas favoritas!
                </p>
              </div>
            ) : (
              items.map(({ produto, quantidade }) => {
                const subtotal = produto.preco * quantidade;
                const isMax = quantidade >= produto.quantidadeEstoque;

                return (
                  <div
                    key={produto.id}
                    className="flex items-center gap-3.5 p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/30 hover:bg-white hover:border-bakery-200 transition-all shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-stone-400">#{produto.id}</span>
                        <h4 className="text-sm font-bold text-stone-800 truncate">
                          {produto.nome}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-stone-500">
                          {formatCurrency(produto.preco)} un.
                        </span>
                        <span className="text-xs font-semibold text-bakery-700">
                          Total: {formatCurrency(subtotal)}
                        </span>
                      </div>

                      {isMax && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1 border border-amber-200">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Qtd. máxima disponível ({produto.quantidadeEstoque})
                        </span>
                      )}
                    </div>

                    {/* Controles de Quantidade */}
                    <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-1 shadow-sm">
                      <button
                        onClick={() => updateQuantity(produto.id, quantidade - 1)}
                        disabled={isSubmitting}
                        className="p-1 rounded text-stone-500 hover:text-stone-800 hover:bg-stone-100 disabled:opacity-40"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="w-7 text-center font-bold text-xs text-stone-800">
                        {quantidade}
                      </span>

                      <button
                        onClick={() => updateQuantity(produto.id, quantidade + 1)}
                        disabled={isSubmitting || isMax}
                        className="p-1 rounded text-stone-500 hover:text-stone-800 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Remover Item */}
                    <button
                      onClick={() => removeItem(produto.id)}
                      disabled={isSubmitting}
                      className="p-2 text-stone-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Remover do carrinho"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Rodapé e Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-stone-200 bg-stone-50 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-stone-500 text-xs">
                  <span>Itens Selecionados</span>
                  <span>{totalItems} un.</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-stone-200">
                  <span className="font-bold text-stone-800">Valor Total</span>
                  <span className="text-2xl font-black text-bakery-700">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Nota de Integração de Microsserviços para a Banca */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-900 leading-tight">
                ℹ️ <strong>Fluxo Distribuído:</strong> Ao clicar em confirmar, o payload será despachado para o <code>ms-pedidos (Porta 8083)</code>, que fará a baixa concorrente com Lock Pessimista no <code>ms-catalogo (8082)</code> e emitirá o evento no RabbitMQ para o <code>ms-notificacao (8084)</code>.
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearCart}
                  disabled={isSubmitting}
                  className="px-4 py-3 border border-stone-300 text-stone-600 rounded-xl text-xs font-semibold hover:bg-stone-100 transition-colors disabled:opacity-50"
                >
                  Limpar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-bakery-600 hover:bg-bakery-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-bakery-600/20 active:scale-98 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processando Checkout...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Confirmar Pedido</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
