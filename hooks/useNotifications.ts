import { useState, useEffect, useCallback } from 'react';

interface Notification {
  notification_id: string;
  type: string;
  title: string;
  message: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  related_entity_type?: string;
  related_entity_id?: string;
  action_url?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  unread_count: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  });

  // Buscar notificações
  const fetchNotifications = useCallback(async (options?: {
    limit?: number;
    offset?: number;
    type?: string;
    unreadOnly?: boolean;
    append?: boolean;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());
      if (options?.type) params.append('type', options.type);
      if (options?.unreadOnly) params.append('unread_only', 'true');

      const response = await fetch(`/api/admin/notifications?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar notificações');
      }

      const data: NotificationsResponse = await response.json();
      
      if (options?.append && options.offset > 0) {
        setNotifications(prev => [...prev, ...data.notifications]);
      } else {
        setNotifications(data.notifications);
      }
      
      setPagination(data.pagination);
      setUnreadCount(data.unread_count);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao buscar notificações:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Marcar como lida/não lida
  const markAsRead = useCallback(async (
    notificationIds: string[], 
    isRead: boolean = true
  ) => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification_ids: notificationIds,
          is_read: isRead,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar notificação');
      }

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notification => 
          notificationIds.includes(notification.notification_id)
            ? { ...notification, is_read: isRead, read_at: isRead ? new Date().toISOString() : undefined }
            : notification
        )
      );

      // Atualizar contador não lidas
      if (isRead) {
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
      } else {
        setUnreadCount(prev => prev + notificationIds.length);
      }

      return true;
    } catch (err) {
      console.error('Erro ao marcar notificação:', err);
      return false;
    }
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications
      .filter(n => !n.is_read)
      .map(n => n.notification_id);
    
    if (unreadIds.length > 0) {
      return await markAsRead(unreadIds, true);
    }
    return true;
  }, [notifications, markAsRead]);

  // Carregar mais notificações
  const loadMore = useCallback(() => {
    if (pagination.hasMore && !loading) {
      fetchNotifications({
        limit: pagination.limit,
        offset: pagination.offset + pagination.limit,
        append: true
      });
    }
  }, [pagination, loading, fetchNotifications]);

  // Buscar apenas não lidas
  const fetchUnreadOnly = useCallback(() => {
    fetchNotifications({ unreadOnly: true });
  }, [fetchNotifications]);

  // Refrescar notificações
  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Polling automático a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      // Só buscar contador se não estiver carregando
      if (!loading) {
        fetch('/api/admin/notifications?limit=1&unread_only=true')
          .then(res => res.json())
          .then(data => setUnreadCount(data.unread_count))
          .catch(console.error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    pagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    loadMore,
    fetchUnreadOnly,
    refresh
  };
} 