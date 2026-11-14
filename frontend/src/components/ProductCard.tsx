import React from 'react';
import { AlertCircle, Flame, Package, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Produto } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ProductCardProps {
  produto: Produto;
  onAddToCart: (produto: Produto) => void;
  onBuyDirect: (produto: Produto) => void;
  isSubmitting?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  produto,
  onAddToCart,
  onBuyDirect,
  isSubmitting = false,
}) => {
  const isOutOfStock = produto.quantidadeEstoque <= 0;
  const isLastItem = produto.quantidadeEstoque === 1;

  // Imagens temáticas ilustrativas baseadas nos dados do DataLoader
  const getProductImage = (nome: string) => {
    const lower = nome.toLowerCase();
    if (lower.includes('cenoura') || lower.includes('bolo')) {
      return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80';
    }
    if (lower.includes('coxinha') || lower.includes('frango')) {
      return 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80';
    }
    if (lower.includes('holandesa') || lower.includes('torta')) {
      return 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80';
  };

  return (
    <div
      className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden border transition-all duration-300 shadow-sm hover:shadow-xl ${
        isOutOfStock
          ? 'border-stone-200 opacity-80'
          : isLastItem
          ? 'border-amber-300 ring-2 ring-amber-100 hover:-translate-y-1'
          : 'border-stone-200/80 hover:border-bakery-400 hover:-translate-y-1'
      }`}
    >
      {/* Imagem do Produto e Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-stone-100">
        <img
          src={getProductImage(produto.nome)}
          alt={produto.nome}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isOutOfStock ? 'grayscale contrast-75' : ''
          }`}
          loading="lazy"
        />

        {/* Overlay escuro em caso de esgotado */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-rose-600/95 text-white font-black text-xs uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-rose-400">
              <AlertCircle className="w-3.5 h-3.5" />
              Esgotado
            </span>
          </div>
        )}

        {/* Badge de ID de Produto (útil para auditoria acadêmica) */}
        <div className="absolute top-3 left-3 bg-stone-900/70 backdrop-blur-md text-white text-[11px] font-mono font-medium px-2.5 py-1 rounded-md shadow-sm">
          ID #{produto.id}
        </div>

        {/* Badge de Estoque */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1 shadow-sm">
              0 unid.
            </span>
          ) : isLastItem ? (
            <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-2.5 py-1 rounded-full border border-amber-300 flex items-center gap-1 shadow-sm animate-pulse">
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              Última Unidade! (1 un.)
            </span>
          ) : (
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1 shadow-sm">
              <Package className="w-3.5 h-3.5 text-emerald-600" />
              {produto.quantidadeEstoque} em estoque
            </span>
          )}
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-bold text-lg text-stone-900 leading-snug group-hover:text-bakery-600 transition-colors">
          {produto.nome}
        </h3>

        <p className="mt-1.5 text-xs text-stone-500 line-clamp-2 leading-relaxed flex-1">
          {produto.descricao || 'Delicioso item artesanal preparado com ingredientes frescos da casa.'}
        </p>

        {/* Destaque Acadêmico para o item de teste R6 */}
        {isLastItem && (
          <div className="mt-3 p-2 bg-amber-50/80 rounded-lg border border-amber-200 text-[11px] text-amber-900 leading-tight">
            ⚡ <strong>Alvo do Teste R6:</strong> Item com estoque = 1 para validação de concorrência com Lock Pessimista.
          </div>
        )}

        {/* Preço e Ações */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
          <div>
            <span className="block text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
              Preço
            </span>
            <span className="text-xl font-black text-bakery-700">
              {formatCurrency(produto.preco)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão Adicionar ao Carrinho */}
            <button
              onClick={() => onAddToCart(produto)}
              disabled={isOutOfStock || isSubmitting}
              title={isOutOfStock ? 'Item esgotado no estoque' : 'Adicionar ao carrinho'}
              className="p-2.5 rounded-xl border border-stone-200 text-stone-700 hover:text-bakery-600 hover:border-bakery-300 hover:bg-bakery-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>

            {/* Botão Comprar Imediato */}
            <button
              onClick={() => onBuyDirect(produto)}
              disabled={isOutOfStock || isSubmitting}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isOutOfStock
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                  : 'bg-bakery-600 hover:bg-bakery-700 text-white shadow-bakery-600/20 active:scale-95'
              }`}
            >
              {isOutOfStock ? (
                <span>Esgotado</span>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Comprar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
