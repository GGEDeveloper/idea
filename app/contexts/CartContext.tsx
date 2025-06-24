'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

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
  isInitialized: boolean;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const [authHydrated, setAuthHydrated] = useState(false);
  
  // Safely access auth context
  let registerCartClearCallback: any = undefined;
  let isAuthenticated = false;
  
  try {
    const authContext = useAuth();
    registerCartClearCallback = authContext.registerCartClearCallback;
    isAuthenticated = authContext.isAuthenticated;
    
    // Mark auth as hydrated once we can successfully use it
    if (!authHydrated) {
      setAuthHydrated(true);
    }
  } catch (error) {
    // Auth context not ready yet, use defaults
    console.log('[CartContext] AuthContext não disponível ainda, usando valores padrão');
  }

  // Função para limpar completamente o carrinho
  const clearCartCompletely = () => {
    console.log('[CartContext] Limpando carrinho completamente...');
    setCartItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cartItems');
    }
  };

  // Função para sincronizar carrinho com servidor
  const syncCartWithServer = async () => {
    if (!isAuthenticated || cartItems.length === 0) return;
    
    try {
      console.log('[CartContext] Sincronizando carrinho com servidor...');
      for (const item of cartItems) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            brand: item.brand,
            ean: item.ean
          })
        });
      }
      console.log('[CartContext] Sincronização com servidor concluída');
    } catch (error) {
      console.error('[CartContext] Erro na sincronização com servidor:', error);
    }
  };

  // Registrar função de limpeza no AuthContext
  useEffect(() => {
    if (authHydrated && registerCartClearCallback && isInitialized) {
      registerCartClearCallback(clearCartCompletely);
      console.log('[CartContext] Função de limpeza registrada no AuthContext');
    }
  }, [registerCartClearCallback, isInitialized, authHydrated]);

  // Sincronizar carrinho quando utilizador faz login
  useEffect(() => {
    if (authHydrated && isAuthenticated && isInitialized && cartItems.length > 0) {
      syncCartWithServer();
    }
  }, [isAuthenticated, isInitialized, authHydrated]);

  // Inicializa o carrinho do localStorage apenas no cliente
  useEffect(() => {
    console.log('[CartContext] Inicializando carrinho...');
    setIsLoading(true);
    
    if (typeof window !== 'undefined') {
      try {
        const localData = localStorage.getItem('cartItems');
        
        if (localData && localData !== 'undefined' && localData !== 'null') {
          try {
            const parsedData = JSON.parse(localData);
            
            // Garantir que é um array válido
            if (Array.isArray(parsedData)) {
              // Validar que todos os itens têm as propriedades necessárias
              const validItems = parsedData.filter(item => 
                item && 
                typeof item === 'object' && 
                item.id && 
                item.name && 
                typeof item.price === 'number' && 
                typeof item.quantity === 'number'
              );
              
              console.log(`[CartContext] ${validItems.length} itens válidos carregados do localStorage`);
              setCartItems(validItems);
              
              if (validItems.length !== parsedData.length) {
                console.warn('[CartContext] Alguns itens inválidos foram filtrados');
                // Salvar apenas os dados válidos
                localStorage.setItem('cartItems', JSON.stringify(validItems));
              }
            } else {
              console.warn('[CartContext] Dados não são um array, resetando carrinho');
              localStorage.removeItem('cartItems');
              setCartItems([]);
            }
          } catch (error) {
            console.error("[CartContext] Erro ao fazer parse dos dados do localStorage:", error);
            localStorage.removeItem('cartItems'); // Limpa dados corrompidos
            setCartItems([]);
          }
        } else {
          console.log('[CartContext] Carrinho vazio inicializado');
          setCartItems([]);
        }
      } catch (error) {
        console.error('[CartContext] Erro geral na inicialização:', error);
        setCartItems([]);
      }
      
      setIsInitialized(true);
      setIsLoading(false);
      console.log('[CartContext] Inicialização completa');
    }
  }, []);

  // Salva o carrinho no localStorage sempre que ele mudar (apenas no cliente e após inicialização)
  useEffect(() => {
    if (isInitialized && !isLoading && typeof window !== 'undefined') {
      try {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
      } catch (error) {
        console.error('[CartContext] Erro ao salvar no localStorage:', error);
      }
    }
  }, [cartItems, isInitialized, isLoading]);

  const addToCart = (product: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    if (!isInitialized) {
      console.warn('[CartContext] Tentativa de adicionar ao carrinho antes da inicialização');
      return;
    }
    
    // Validar dados do produto
    if (!product.id || !product.name || typeof product.price !== 'number') {
      console.error('[CartContext] Dados do produto inválidos:', product);
      return;
    }
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        // Se o item já existe, atualiza a quantidade
        const updatedItems = prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
        console.log(`[CartContext] ${product.name} quantidade atualizada para ${existingItem.quantity + quantity}`);
        return updatedItems;
      } else {
        // Se o item não existe, adiciona ao carrinho
        const newItem = { ...product, quantity };
        const newItems = [...prevItems, newItem];
        console.log(`[CartContext] ${product.name} adicionado ao carrinho`);
        return newItems;
      }
    });
  };

  const removeFromCart = (productId: string) => {
    if (!isInitialized) {
      console.warn('[CartContext] Tentativa de remover do carrinho antes da inicialização');
      return;
    }
    
    const itemToRemove = cartItems.find(item => item.id === productId);
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== productId);
      return newItems;
    });
    
    if (itemToRemove) {
      console.log(`[CartContext] ${itemToRemove.name} removido do carrinho`);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (!isInitialized) {
      console.warn('[CartContext] Tentativa de atualizar quantidade antes da inicialização');
      return;
    }
    
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems => {
        const newItems = prevItems.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        );
        return newItems;
      });
    }
  };

  const clearCart = () => {
    if (!isInitialized) {
      console.warn('[CartContext] Tentativa de limpar carrinho antes da inicialização');
      return;
    }
    
    clearCartCompletely();
    console.log('[CartContext] Carrinho limpo pelo utilizador');
  };

  const getCartTotal = (): number => {
    if (!isInitialized) return 0;
    const total = cartItems.reduce((total, item) => {
      if (typeof item.price === 'number' && typeof item.quantity === 'number') {
        return total + (item.price * item.quantity);
      }
      return total;
    }, 0);
    return total;
  };
  
  const getTotalItems = (): number => {
    if (!isInitialized) return 0;
    const total = cartItems.reduce((total, item) => {
      if (typeof item.quantity === 'number') {
        return total + item.quantity;
      }
      return total;
    }, 0);
    return total;
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
    isInitialized,
    isLoading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}; 