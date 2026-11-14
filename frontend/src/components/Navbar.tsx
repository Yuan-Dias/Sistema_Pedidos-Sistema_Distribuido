import React from 'react';
import { ChefHat, ShoppingBag, Store, UtensilsCrossed } from 'lucide-react';
import { useCart } from '../context/CartContext';

export type ActiveTab = 'vitrine' | 'cozinha';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  notificacoesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  notificacoesCount = 0,
}) => {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Marca */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('vitrine')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-bakery-500 to-bakery-700 flex items-center justify-center text-white shadow-md shadow-bakery-600/30">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  Doce Encanto
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-bakery-100 text-bakery-800 px-2 py-0.5 rounded-full border border-bakery-200 hidden sm:inline-block">
                  Pâtisserie & Bistrô
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">
                Projeto Distribuído — IFBA (Spring Cloud & RabbitMQ)
              </p>
            </div>
          </div>

          {/* Abas de Navegação (Visão Cliente vs Visão Cozinha) */}
          <nav className="flex items-center bg-stone-100 p-1.5 rounded-2xl border border-stone-200/80">
            <button
              onClick={() => onTabChange('vitrine')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'vitrine'
                  ? 'bg-white text-bakery-800 shadow-sm border border-stone-200/50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Vitrine (Cliente)</span>
            </button>

            <button
              onClick={() => onTabChange('cozinha')}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'cozinha'
                  ? 'bg-white text-bakery-800 shadow-sm border border-stone-200/50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>Cozinha (KDS)</span>
              {notificacoesCount > 0 && (
                <span className="ml-1 bg-bakery-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full animate-pulse">
                  {notificacoesCount}
                </span>
              )}
            </button>
          </nav>

          {/* Botão do Carrinho */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 rounded-2xl bg-stone-100 hover:bg-bakery-50 text-stone-700 hover:text-bakery-700 border border-stone-200 hover:border-bakery-300 transition-all active:scale-95"
              aria-label="Abrir carrinho de compras"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-bakery-600 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-bounce border-2 border-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
