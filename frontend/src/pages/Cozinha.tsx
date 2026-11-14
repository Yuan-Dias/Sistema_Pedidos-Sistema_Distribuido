import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChefHat,
  Clock,
  Pause,
  Play,
  Rabbit,
  Receipt,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useNotificacoes } from '../hooks/useNotificacoes';
import { formatDateTime, formatTimeOnly } from '../utils/formatters';

export const Cozinha: React.FC = () => {
  const {
    notificacoes,
    isLoading,
    isPolling,
    lastUpdated,
    refetch,
    togglePolling,
    pollingInterval,
    error,
  } = useNotificacoes({ pollingIntervalMs: 3000, initialAutoPoll: true });

  const [searchTerm, setSearchTerm] = useState('');

  // Filtragem de fichas por ID de pedido ou conteúdo
  const notificacoesFiltradas = notificacoes.filter((n) => {
    return (
      n.pedidoId.toString().includes(searchTerm) ||
      n.mensagem.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Cabeçalho do KDS (Kitchen Display System) */}
      <section className="bg-stone-900 rounded-3xl p-6 sm:p-8 text-white border border-stone-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full">
            <ChefHat className="w-4 h-4" />
            <span>KDS — Kitchen Display System & Fichas de Preparo</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Painel da Cozinha (Visão Operacional)
          </h1>

          <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
            Consumo assíncrono via <strong>RabbitMQ (Porta 5672)</strong> e API REST do{' '}
            <strong>ms-notificacao (Porta 8084)</strong>. As mensagens são retidas na fila
            mesmo se a cozinha estiver temporariamente offline (Requisitos R4 e R5).
          </p>
        </div>

        {/* Controles de Polling e Atualização */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-stone-800/80 p-3 rounded-2xl border border-stone-700/80">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-700 hover:bg-stone-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
            title="Buscar novas notificações agora"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Atualizar</span>
          </button>

          <button
            onClick={togglePolling}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isPolling
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/40'
                : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
            }`}
          >
            {isPolling ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Auto-Refresh Ativo ({pollingInterval / 1000}s)</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Auto-Refresh Pausado</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Alerta de Demonstração para a Banca: Teste R5 */}
      <section className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-4 text-amber-900">
        <div className="p-2.5 bg-amber-500/20 text-amber-700 rounded-xl flex-shrink-0">
          <Rabbit className="w-6 h-6" />
        </div>
        <div className="text-xs sm:text-sm leading-relaxed space-y-1">
          <h4 className="font-extrabold text-amber-950 flex items-center gap-2">
            <span>Roteiro de Demonstração da Resiliência (Requisito R5)</span>
          </h4>
          <p className="text-amber-900/90">
            Para testar a durabilidade da fila RabbitMQ:{' '}
            <strong>1.</strong> Pare o serviço <code>ms-notificacao</code> (Ctrl+C no terminal).{' '}
            <strong>2.</strong> Faça compras na Vitrine (elas serão salvas com sucesso no banco de pedidos).{' '}
            <strong>3.</strong> Religue o <code>ms-notificacao</code>. As fichas retidas no RabbitMQ serão consumidas e aparecerão automaticamente nesta tela!
          </p>
        </div>
      </section>

      {/* Barra de Filtros e Estatísticas */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Barra de Busca */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por #Pedido ou texto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-bakery-500 shadow-xs"
          />
        </div>

        {/* Status de Sincronização */}
        <div className="flex items-center gap-3 text-xs text-stone-500 self-end sm:self-auto">
          {lastUpdated && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              Última checagem: <strong>{formatTimeOnly(lastUpdated.toISOString())}</strong>
            </span>
          )}

          <span className="bg-stone-200 text-stone-700 font-bold px-2.5 py-1 rounded-lg">
            Total: {notificacoes.length} fichas
          </span>
        </div>
      </div>

      {/* Erro de conexão com o ms-notificacao */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-900 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <div>
            <strong>ms-notificacao (8084) indisponível:</strong> {error.message}
          </div>
        </div>
      )}

      {/* Grid de Fichas de Pedido (Estilo Kanban de Cozinha) */}
      {notificacoesFiltradas.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-stone-200">
          <Receipt className="w-16 h-16 text-stone-300 mx-auto mb-3 stroke-1" />
          <h3 className="text-lg font-bold text-stone-800">Nenhum pedido na fila de preparo</h3>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'Nenhum resultado corresponde à sua pesquisa.'
              : 'Assim que um cliente confirmar um pedido na Vitrine, a comanda aparecerá aqui em tempo real.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notificacoesFiltradas.map((notificacao) => (
            <div
              key={notificacao.id}
              className="relative bg-amber-50/40 rounded-2xl border-2 border-dashed border-stone-300 p-5 shadow-sm hover:shadow-md transition-all hover:border-bakery-400 flex flex-col justify-between"
            >
              {/* Estilo de Clipe de Comanda / Ficha Superior */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-3 bg-stone-300 rounded-full shadow-inner border border-stone-400/50" />

              <div>
                {/* Cabeçalho da Ficha */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-bakery-700" />
                    <span className="font-mono text-sm font-black text-stone-900">
                      PEDIDO #{notificacao.pedidoId}
                    </span>
                  </div>

                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {notificacao.status}
                  </span>
                </div>

                {/* Conteúdo / Mensagem Formatada da Cozinha */}
                <div className="mt-4 space-y-2">
                  <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
                      Instruções da Ficha
                    </span>
                    <p className="text-xs font-mono font-medium text-stone-800 leading-relaxed whitespace-pre-wrap">
                      {notificacao.mensagem}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rodapé da Ficha com Carimbo de Tempo e Origem AMQP */}
              <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between text-[11px] text-stone-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  {formatDateTime(notificacao.dataProcessamento)}
                </span>

                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                  <Rabbit className="w-3 h-3 text-amber-700" />
                  RabbitMQ AMQP
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
