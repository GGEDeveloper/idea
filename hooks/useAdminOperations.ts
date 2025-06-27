import { useState, useCallback } from 'react';
import { useNotification } from '../app/contexts/NotificationContext';

interface AdminOperationOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  revalidate?: () => Promise<void>;
}

export function useAdminOperations() {
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();

  const executeOperation = useCallback(async (
    operation: () => Promise<Response>,
    options: AdminOperationOptions = {}
  ) => {
    const {
      successMessage = 'Operação realizada com sucesso!',
      errorMessage = 'Erro ao realizar operação',
      onSuccess,
      onError,
      revalidate
    } = options;

    setLoading(true);

    try {
      const response = await operation();
      
      if (response.ok) {
        const data = await response.json();
        
        addNotification({
          type: 'success',
          title: 'Sucesso',
          message: data.message || successMessage,
          duration: 4000
        });

        // Revalidate data if function provided
        if (revalidate) {
          await revalidate();
        }

        if (onSuccess) {
          onSuccess();
        }

        return { success: true, data };
      } else {
        const errorData = await response.json();
        const errorMsg = errorData.error || errorMessage;
        
        addNotification({
          type: 'error',
          title: 'Erro',
          message: errorMsg,
          duration: 6000
        });

        if (onError) {
          onError(errorMsg);
        }

        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('Admin operation error:', error);
      const errorMsg = 'Erro de conexão';
      
      addNotification({
        type: 'error',
        title: 'Erro de Conexão',
        message: errorMsg,
        duration: 6000
      });

      if (onError) {
        onError(errorMsg);
      }

      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const saveOperation = useCallback(async (
    url: string,
    data: any,
    method: 'POST' | 'PUT' | 'PATCH' = 'POST',
    options: AdminOperationOptions = {}
  ) => {
    return executeOperation(
      () => fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      }),
      {
        successMessage: 'Dados salvos com sucesso!',
        ...options
      }
    );
  }, [executeOperation]);

  const deleteOperation = useCallback(async (
    url: string,
    options: AdminOperationOptions = {}
  ) => {
    return executeOperation(
      () => fetch(url, {
        method: 'DELETE',
        credentials: 'include'
      }),
      {
        successMessage: 'Item excluído com sucesso!',
        ...options
      }
    );
  }, [executeOperation]);

  return {
    loading,
    executeOperation,
    saveOperation,
    deleteOperation
  };
} 