import React, { useState } from 'react';
import { CartModal } from './components/CartModal';
import { ActiveTab, Navbar } from './components/Navbar';
import { ToastContainer } from './components/ToastContainer';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { useNotificacoes } from './hooks/useNotificacoes';
import { usePedidos } from './hooks/usePedidos';
import { useProdutos } from './hooks/useProdutos';
import { Cozinha } from './pages/Cozinha';
import { Vitrine } from './pages/Vitrine';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('vitrine');
  const { enviarPedido, isSubmitting } = usePedidos();
  const { refetch: refetchProdutos } = useProdutos(false);
  const { notificacoes } = useNotificacoes({ initialAutoPoll: true, pollingIntervalMs: 4000 });

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans text-stone-800">
      {/* Toast Notification Layer */}
      <ToastContainer />

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notificacoesCount={notificacoes.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'vitrine' ? <Vitrine /> : <Cozinha />}
      </main>

      {/* Slide-over Cart Modal */}
      <CartModal
        onCheckout={enviarPedido}
        isSubmitting={isSubmitting}
        onSuccessOrder={() => {
          // Atualiza produtos para refletir novo estoque
          refetchProdutos();
        }}
      />

      {/* Rodapé Acadêmico */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-stone-500 space-y-2">
          <p className="font-semibold text-stone-700">
            Sistema de Pedidos Distribuído — Confeitaria & Lanchonete (Trabalho Acadêmico)
          </p>
          <p>
            Desenvolvido com <strong>React</strong>, <strong>TypeScript</strong>, <strong>Tailwind CSS</strong>, <strong>Vite</strong> & <strong>Axios</strong>.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-1 font-mono text-[11px] text-stone-400">
            <span>ms-catalogo: 8082 (JPA Lock Pessimista)</span>
            <span>•</span>
            <span>ms-pedidos: 8083 (OpenFeign)</span>
            <span>•</span>
            <span>ms-notificacao: 8084 (RabbitMQ 5672)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </ToastProvider>
  );
};

export default App;
