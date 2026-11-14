import React, { createContext, useContext, useMemo, useState } from 'react';
import { CartItem, Produto } from '../types';

interface CartContextData {
  items: CartItem[];
  addItem: (produto: Produto, quantidade?: number) => boolean;
  removeItem: (produtoId: number) => void;
  updateQuantity: (produtoId: number, quantidade: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addItem = (produto: Produto, quantidade = 1): boolean => {
    if (produto.quantidadeEstoque <= 0) return false;

    setItems((prevItems) => {
      const existing = prevItems.find((item) => item.produto.id === produto.id);
      if (existing) {
        const novaQtd = existing.quantidade + quantidade;
        const qtdFinal = Math.min(novaQtd, produto.quantidadeEstoque);
        return prevItems.map((item) =>
          item.produto.id === produto.id ? { ...item, quantidade: qtdFinal } : item
        );
      }
      return [...prevItems, { produto, quantidade: Math.min(quantidade, produto.quantidadeEstoque) }];
    });

    return true;
  };

  const removeItem = (produtoId: number) => {
    setItems((prev) => prev.filter((item) => item.produto.id !== produtoId));
  };

  const updateQuantity = (produtoId: number, quantidade: number) => {
    if (quantidade <= 0) {
      removeItem(produtoId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.produto.id === produtoId) {
          const clamped = Math.min(quantidade, item.produto.quantidadeEstoque);
          return { ...item, quantidade: clamped };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = useMemo(
    () => items.reduce((acc, curr) => acc + curr.quantidade, 0),
    [items]
  );

  const totalAmount = useMemo(
    () => items.reduce((acc, curr) => acc + curr.produto.preco * curr.quantidade, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextData => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser utilizado dentro de um CartProvider');
  }
  return context;
};
