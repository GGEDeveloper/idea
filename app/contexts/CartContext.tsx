'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Tipos para os itens do carrinho
export interface CartItem {
  id: string;
  ean?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  brand?: string;
}

// Tipos para o contexto do carrinho
interface CartContextType {
  cartItems: CartItem[];
  cart: CartItem[]; // Alias para compatibilidade
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export { CartContext };

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializa o carrinho do localStorage apenas no cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('cartItems');
      if (localData) {
        try {
          const parsedData = JSON.parse(localData);
          // Garante que o que foi parseado é um array, caso contrário retorna array vazio
          setCartItems(Array.isArray(parsedData) ? parsedData : []);
        } catch (error) {
          console.error("Erro ao ler 'cartItems' do localStorage:", error);
          localStorage.removeItem('cartItems'); // Limpa dados corrompidos
          setCartItems([]);
        }
      }
      setIsInitialized(true);
    }
  }, []);

  // Salva o carrinho no localStorage sempre que ele mudar (apenas no cliente)
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  const addToCart = (product: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        // Se o item já existe, atualiza a quantidade
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        // Se o item não existe, adiciona ao carrinho
        return [...prevItems, { ...product, quantity }];
      }
    });
    
    // Mostra notificação (pode usar toast se disponível)
    if (typeof window !== 'undefined') {
      console.log(`${product.name} (x${quantity}) adicionado ao carrinho!`);
    }
  };

  const removeFromCart = (productId: string) => {
    const itemToRemove = cartItems.find(item => item.id === productId);
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    
    if (itemToRemove && typeof window !== 'undefined') {
      console.log(`${itemToRemove.name} removido do carrinho.`);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
    if (typeof window !== 'undefined') {
      console.log('Carrinho esvaziado!');
    }
  };

  const getCartTotal = (): number => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  
  const getTotalItems = (): number => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value: CartContextType = {
    cartItems,
    cart: cartItems, // Alias para compatibilidade
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getTotalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}; 