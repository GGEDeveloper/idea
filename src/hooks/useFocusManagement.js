import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook personalizado para gerenciar o foco de forma acessível
 * 
 * @param {Object} options - Opções de configuração
 * @param {boolean} [options.isOpen] - Se o componente está aberto (para modais, menus, etc.)
 * @param {boolean} [options.autoFocus] - Se deve focar automaticamente no primeiro elemento focado
 * @param {string} [options.selector] - Seletor CSS para os elementos focáveis
 * @param {boolean} [options.trapFocus] - Se deve manter o foco dentro do elemento
 * @returns {Object} Referências e funções úteis
 */
const useFocusManagement = ({
  isOpen = true,
  autoFocus = true,
  selector = 'a, button, [href], [tabindex]:not([tabindex="-1"])',
  trapFocus = false,
} = {}) => {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Obter elementos focáveis dentro do container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    return Array.from(containerRef.current.querySelectorAll(selector)).filter(el => {
      // Filtrar elementos visíveis e não desabilitados
      const style = window.getComputedStyle(el);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        !el.disabled &&
        !el.hasAttribute('disabled') &&
        el.getAttribute('aria-hidden') !== 'true' &&
        el.offsetParent !== null
      );
    });
  }, [selector]);

  // Focar no primeiro elemento focável
  const focusFirstElement = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
      return true;
    }
    return false;
  }, [getFocusableElements]);

  // Focar no último elemento focável
  const focusLastElement = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
      return true;
    }
    return false;
  }, [getFocusableElements]);

  // Gerenciar o foco quando o componente é aberto/fechado
  useEffect(() => {
    if (isOpen && autoFocus) {
      // Salvar o elemento que tinha o foco antes de abrir o componente
      previousFocusRef.current = document.activeElement;
      
      // Tentar focar no primeiro elemento focável
      const focused = focusFirstElement();
      
      // Se não houver elementos focáveis, focar no próprio container
      if (!focused && containerRef.current) {
        containerRef.current.setAttribute('tabindex', '-1');
        containerRef.current.focus();
      }
    } else if (previousFocusRef.current && previousFocusRef.current.focus) {
      // Restaurar o foco para o elemento anterior quando o componente for fechado
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }

    // Limpar a referência quando o componente for desmontado
    return () => {
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, autoFocus, focusFirstElement]);

  // Gerenciar a armadilha de foco (trap focus)
  useEffect(() => {
    if (!isOpen || !trapFocus) return;

    const handleKeyDown = (event) => {
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      // Se o elemento ativo não estiver no container, focar no primeiro elemento
      if (!containerRef.current?.contains(activeElement)) {
        firstElement.focus();
        return;
      }

      // Gerenciar a navegação por teclado
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift + Tab: mover para o elemento anterior
          if (activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: mover para o próximo elemento
          if (activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      } else if (event.key === 'Escape') {
        // Fechar o componente ao pressionar Escape
        event.preventDefault();
        event.stopPropagation();
        if (previousFocusRef.current && previousFocusRef.current.focus) {
          previousFocusRef.current.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, trapFocus, getFocusableElements, previousFocusRef]);

  return {
    containerRef,
    focusFirstElement,
    focusLastElement,
    getFocusableElements,
  };
};

export default useFocusManagement;
