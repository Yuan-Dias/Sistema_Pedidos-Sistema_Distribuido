import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  Layers,
  RefreshCw,
  Server,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { usePedidos } from '../hooks/usePedidos';
import { useProdutos } from '../hooks/useProdutos';
import { Produto } from '../types';

export const Vitrine: React.FC = () => {
  const { produtos, isLoading, error, refetch } = useProdutos();
  const { comprarItemDireto, isSubmitting } = usePedidos();
  const { addItem } = useCart();
  const { showInfo } = useToast();
  const [testingLock, setTestingLock] = useState(false);

  // Manipulador para adicionar ao carrinho com feedback visual
  const handleAddToCart = (produto: Produto) => {
    const success = addItem(produto, 1);
    if (success) {
      showInfo('Item Adicionado', `${produto.nome} foi adicionado ao seu carrinho.`);
    }
  };

  // Compra direta de um único item (1 clique)
  const handleBuyDirect = async (produto: Produto) => {
    await comprarItemDireto(produto.id, 1, () => {
      // Requisito 3 da Banca: Atualizar listagem de produtos imediatamente após HTTP 201
      refetch();
    });

    // Se houver conflito 409, também atualiza para que a UI mostre estoque zerado
    refetch();
  };

  /**
   * Ferramenta de Demonstração para a Banca Avaliadora:
   * Dispara duas requisições simultâneas contra o produto ID 3 (Torta Holandesa)
   * para evidenciar o funcionamento do Lock Pessimista (@Lock PESSIMISTIC_WRITE no PostgreSQL)
   */
  const handleSimularConcorrenciaR6 = async () => {
    const torta = produtos.find((p) => p.id === 3 || p.nome.toLowerCase().includes('torta'));
    const targetId = torta ? torta.id : 3;

    setTestingLock(true);
    showInfo(
      'Simulação de Concorrência R6 Disparada',
      'Enviando 2 requisições rigorosamente simultâneas para o produto com 1 unidade no estoque...'
    );

    try {
      // Disparo em paralelo rigoroso (Promise.all)
      const [res1, res2] = await Promise.allSettled([
        comprarItemDireto(targetId, 1, () => refetch()),
        comprarItemDireto(targetId, 1, () => refetch()),
      ]);

      console.log('Resultado do teste concorrente:', { res1, res2 });
      // Atualiza catálogo após o teste
      setTimeout(() => refetch(), 800);
    } finally {
      setTestingLock(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Banner Hero / Apresentação do Sistema Distribuído */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-bakery-950 text-white p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-bakery-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-bakery-500/20 text-bakery-300 border border-bakery-500/30 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sistema Distribuído Resiliente & Concorrente (IFBA)</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Cardápio Artesanal & Vitrine de Produtos
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Interface integrada aos microsserviços Spring Boot via chamadas desacopladas:{' '}
            <span className="text-amber-400 font-semibold">ms-catalogo (8082)</span> com Lock Pessimista,{' '}
            <span className="text-amber-400 font-semibold">ms-pedidos (8083)</span> via OpenFeign, e{' '}
            <span className="text-amber-400 font-semibold">ms-notificacao (8084)</span> via mensageria AMQP (RabbitMQ).
          </p>

          {/* Painel Rápido de Testes da Banca */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSimularConcorrenciaR6}
              disabled={testingLock || isSubmitting}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs sm:text-sm font-extrabold rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-stone-950 fill-stone-950" />
              <span>{testingLock ? 'Executando Concorrência...' : 'Simular Teste Concorrente (R6)'}</span>
            </button>

            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl border border-white/15 backdrop-blur-md transition-all active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar Catálogo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Cards de Status da Arquitetura Distribuída */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-stone-500 font-semibold">ms-catalogo (8082)</div>
            <div className="text-sm font-bold text-stone-800">
              {produtos.length} {produtos.length === 1 ? 'Produto ativo' : 'Produtos ativos'}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-stone-500 font-semibold">ms-pedidos (8083)</div>
            <div className="text-sm font-bold text-stone-800">Feign + Lock Pessimista</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-sky-100 text-sky-800 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-stone-500 font-semibold">ms-notificacao (8084)</div>
            <div className="text-sm font-bold text-stone-800">RabbitMQ Exchange AMQP</div>
          </div>
        </div>
      </section>

      {/* Grid de Produtos */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Vitrine de Delícias
            </h2>
            <p className="text-xs text-stone-500">
              Escolha seus itens ou adicione ao carrinho para finalizar em lote
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping" />
            <span>Catálogo sincronizado</span>
          </div>
        </div>

        {/* Feedback de Erro de Conexão com ms-catalogo */}
        {error && (
          <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3.5 text-rose-900">
            <AlertOctagon className="w-6 h-6 text-rose-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-bold text-sm">{error.title}</h4>
              <p className="text-xs sm:text-sm mt-0.5 leading-relaxed">{error.message}</p>
              <button
                onClick={() => refetch()}
                className="mt-3 px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition-colors"
              >
                Tentar reconectar ao ms-catalogo
              </button>
            </div>
          </div>
        )}

        {/* Estado de Carregamento (Skeleton) */}
        {isLoading && produtos.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((skeleton) => (
              <div
                key={skeleton}
                className="bg-white rounded-2xl p-5 border border-stone-200 space-y-4 animate-pulse"
              >
                <div className="h-44 bg-stone-200 rounded-xl" />
                <div className="h-5 bg-stone-200 rounded w-3/4" />
                <div className="h-4 bg-stone-100 rounded w-full" />
                <div className="h-8 bg-stone-200 rounded-xl w-1/2" />
              </div>
            ))}
          </div>
        ) : produtos.length === 0 && !isLoading && !error ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 text-stone-400">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-800">Nenhum produto encontrado</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Verifique se o banco de dados e o serviço <code>ms-catalogo</code> executaram a carga inicial (DataLoader).
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-bakery-600 text-white text-xs font-bold rounded-xl hover:bg-bakery-700"
            >
              Recarregar Catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {produtos.map((produto) => (
              <ProductCard
                key={produto.id}
                produto={produto}
                onAddToCart={handleAddToCart}
                onBuyDirect={handleBuyDirect}
                isSubmitting={isSubmitting}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
