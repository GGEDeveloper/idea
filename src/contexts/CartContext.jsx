import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast'; // Importar toast

const CartContext = createContext();

export { CartContext };

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const localData = localStorage.getItem('cartItems');
    if (localData) {
      try {
        const parsedData = JSON.parse(localData);
        // Garante que o que foi parseado é um array, caso contrário retorna array vazio.
        return Array.isArray(parsedData) ? parsedData : [];
      } catch (error) {
        console.error("Erro ao ler 'cartItems' do localStorage:", error);
        localStorage.removeItem('cartItems'); // Limpa dados corrompidos para evitar futuros erros.
        return []; // Retorna um array vazio em caso de erro.
      }
    }
    return []; // Retorna um array vazio se não houver dados no localStorage.
  });

  // Salva o carrinho no localStorage sempre que ele mudar
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
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
    toast.success(`${product.name} (x${quantity}) adicionado ao carrinho!`, { icon: '🛒' });
  };

  const removeFromCart = (productId) => {
    const itemToRemove = cartItems.find(item => item.id === productId);
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    if (itemToRemove) {
      toast.error(`${itemToRemove.name} removido do carrinho.`, { icon: '🗑️' });
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    const itemToUpdate = cartItems.find(item => item.id === productId);
    if (newQuantity <= 0) {
      removeFromCart(productId); // removeFromCart já tem seu próprio toast
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
      if (itemToUpdate) {
        // Para evitar spam de toasts, podemos ser mais seletivos
        // ou ter um toast mais genérico como "Carrinho atualizado"
        // Por agora, vamos deixar sem toast específico para cada incremento/decremento
        // a menos que seja uma remoção (tratada acima).
      }
    }
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success('Carrinho esvaziado!', { icon: '💨' });
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
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
