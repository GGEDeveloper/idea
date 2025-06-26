'use client';

import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../../hooks/useNotifications';
import {
  BellIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const NotificationIcon = ({ type, priority }: { type: string; priority: string }) => {
  if (priority === 'critical') {
    return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
  }
  
  switch (type) {
    case 'customer_application':
      return <CheckCircleIcon className="h-6 w-6 text-blue-500" />;
    case 'order_created':
      return <InformationCircleIcon className="h-6 w-6 text-green-500" />;
    default:
      return <BellIcon className="h-6 w-6 text-gray-500" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
    case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400';
    case 'normal': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
    case 'low': return 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400';
    default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Agora';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
  
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export default function NotificationsPage() {
  const {
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
  } = useNotifications();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (filter === 'unread') {
      fetchUnreadOnly();
    } else {
      fetchNotifications();
    }
  }, [filter, fetchNotifications, fetchUnreadOnly]);

  const handleSelectNotification = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map(n => n.notification_id));
    }
  };

  const handleMarkSelectedAsRead = async () => {
    if (selectedIds.length > 0) {
      const success = await markAsRead(selectedIds, true);
      if (success) {
        setSelectedIds([]);
      }
    }
  };

  const handleMarkSelectedAsUnread = async () => {
    if (selectedIds.length > 0) {
      const success = await markAsRead(selectedIds, false);
      if (success) {
        setSelectedIds([]);
      }
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead([notification.notification_id], true);
    }
    
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Notificações
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas as notificações lidas'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={refresh}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              {loading ? 'Carregando...' : 'Atualizar'}
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded-full ${
                filter === 'all'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Todas ({pagination.total})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 text-sm rounded-full ${
                filter === 'unread'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Não lidas ({unreadCount})
            </button>
          </div>

          {/* Bulk actions */}
          {selectedIds.length > 0 && (
            <div className="flex items-center space-x-2 ml-auto">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedIds.length} selecionadas
              </span>
              <button
                onClick={handleMarkSelectedAsRead}
                className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                title="Marcar como lidas"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
              <button
                onClick={handleMarkSelectedAsUnread}
                className="p-1 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400"
                title="Marcar como não lidas"
              >
                <EyeSlashIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Select all */}
        {notifications.length > 0 && (
          <div className="mt-2">
            <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={selectedIds.length === notifications.length}
                onChange={handleSelectAll}
                className="mr-2"
              />
              Selecionar todas visíveis
            </label>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.notification_id}
            className={`bg-white dark:bg-gray-800 rounded-lg border ${
              notification.is_read 
                ? 'border-gray-200 dark:border-gray-700' 
                : 'border-blue-200 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-900/10'
            } p-4 hover:shadow-md transition-shadow cursor-pointer`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex items-start space-x-4">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedIds.includes(notification.notification_id)}
                onChange={(e) => {
                  e.stopPropagation();
                  handleSelectNotification(notification.notification_id);
                }}
                className="mt-1"
              />

              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                <NotificationIcon type={notification.type} priority={notification.priority} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-medium ${
                    notification.is_read 
                      ? 'text-gray-900 dark:text-white' 
                      : 'text-gray-900 dark:text-white font-semibold'
                  }`}>
                    {notification.title}
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                      {notification.priority}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                </div>
                
                <p className={`mt-1 text-sm ${
                  notification.is_read 
                    ? 'text-gray-600 dark:text-gray-400' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {notification.message}
                </p>

                {notification.related_entity_type && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {notification.related_entity_type}: {notification.related_entity_id}
                  </div>
                )}
              </div>

              {/* Read indicator */}
              {!notification.is_read && (
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {pagination.hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50"
          >
            {loading ? 'Carregando...' : 'Carregar mais'}
          </button>
        </div>
      )}

      {/* Empty state */}
      {notifications.length === 0 && !loading && (
        <div className="text-center py-12">
          <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {filter === 'unread' ? 'Sem notificações não lidas' : 'Sem notificações'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filter === 'unread' 
              ? 'Todas as notificações foram lidas.' 
              : 'Não há notificações para mostrar.'
            }
          </p>
        </div>
      )}
    </div>
  );
} 